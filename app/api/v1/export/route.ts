import { NextResponse } from "next/server";
import { database } from "@/lib/appwrite/server";
import { DB_ID, COLLECTIONS } from "@/lib/constants/collections";
import { Query } from "node-appwrite";
import { handleError, badRequest } from "@/lib/utils/api-response";

// Utility to convert an array of Appwrite document objects into a valid CSV string
function arrayToCsv(data: Record<string, any>[]) {
    if (data.length === 0) return "";
    
    // Dynamically collect all keys across all documents to form headers
    const allKeys = new Set<string>();
    data.forEach(item => Object.keys(item).forEach(k => allKeys.add(k)));
    
    // Filter out internal Appwrite system metadata that isn't useful for exports
    const headerParams = Array.from(allKeys).filter(k => 
        !["$databaseId", "$collectionId"].includes(k)
    );
    
    // Format headers
    const headers = headerParams.map(h => `"${h.replace(/"/g, '""')}"`).join(",");
    
    // Format rows
    const rows = data.map(item => {
        return headerParams.map(header => {
            const val = item[header];
            if (val === null || val === undefined) return '""';
            
            // Handle arrays (like relations or multiple selections)
            if (Array.isArray(val)) {
                // If it's an array of objects (like Appwrite relations), stringify them
                const str = val.map(v => typeof v === 'object' ? JSON.stringify(v) : v).join("; ");
                return `"${str.replace(/"/g, '""')}"`;
            }
            
            // Handle nested objects
            if (typeof val === 'object') {
                return `"${JSON.stringify(val).replace(/"/g, '""')}"`;
            }
            
            // Standard strings, numbers, booleans
            return `"${String(val).replace(/"/g, '""')}"`;
        }).join(",");
    });
    
    return [headers, ...rows].join("\n");
}

export async function GET(request: Request) {
    try {
        const url = new URL(request.url);
        const collectionKey = url.searchParams.get("collection")?.toUpperCase();
        
        if (!collectionKey) {
            return badRequest("Collection parameter is required (e.g., ?collection=MEMBERS)");
        }
        
        // Match the provided key against our COLLECTIONS mapping
        if (!(collectionKey in COLLECTIONS)) {
            const validKeys = Object.keys(COLLECTIONS).join(", ");
            return badRequest(`Invalid collection name. Available collections: ${validKeys}`);
        }
        
        const collectionId = COLLECTIONS[collectionKey as keyof typeof COLLECTIONS];
        
        // Fetch all documents. 
        // Appwrite supports a standard maximum limit (usually 5000). We iterate to grab everything.
        let allDocuments: any[] = [];
        let offset = 0;
        const limit = 5000;
        
        while (true) {
            const response = await database.listDocuments(DB_ID, collectionId, [
                Query.limit(limit),
                Query.offset(offset),
                Query.orderDesc("$createdAt")
            ]);
            
            allDocuments = [...allDocuments, ...response.documents];
            
            if (response.documents.length < limit) {
                break; // We've exhausted all documents
            }
            offset += limit;
        }
        
        if (allDocuments.length === 0) {
            return badRequest(`The collection "${collectionKey}" is empty.`);
        }
        
        // Generate the CSV file
        const csvContent = arrayToCsv(allDocuments);
        const dateString = new Date().toISOString().split('T')[0];
        
        return new NextResponse(csvContent, {
            status: 200,
            headers: {
                "Content-Type": "text/csv; charset=utf-8",
                "Content-Disposition": `attachment; filename="${collectionKey.toLowerCase()}_export_${dateString}.csv"`,
            },
        });
        
    } catch (error) {
        return handleError("Export to CSV", error);
    }
}
