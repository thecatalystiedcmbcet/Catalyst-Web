import { Skeleton } from "@/components/ui/skeleton"

export default function RolesLoading() {
    return (
        <div className="flex flex-col items-center w-full max-w-7xl mx-auto gap-6">
            {/* Header */}
            <div className="flex justify-between items-center w-full">
                <Skeleton className="h-8 w-28" />
                <Skeleton className="h-9 w-28" />
            </div>

            {/* Toolbar */}
            <div className="flex items-center justify-between w-full">
                <Skeleton className="h-9 w-64" />
                <Skeleton className="h-9 w-28" />
            </div>

            {/* Table */}
            <div className="w-full rounded-md border overflow-hidden">
                <div className="flex items-center gap-4 px-4 py-3 border-b bg-muted/40">
                    <Skeleton className="h-4 w-4" />
                    <Skeleton className="h-4 w-28" />
                    <Skeleton className="h-4 w-48 ml-auto" />
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-4 w-16" />
                </div>
                {Array.from({ length: 8 }).map((_, i) => (
                    <div key={i} className="flex items-center gap-4 px-4 py-3 border-b last:border-0">
                        <Skeleton className="h-4 w-4 rounded-sm" />
                        <Skeleton className="h-4 w-32" />
                        <Skeleton className="h-4 w-52 ml-auto font-mono" />
                        <Skeleton className="h-5 w-20 rounded-full" />
                        <div className="flex gap-1">
                            <Skeleton className="h-8 w-8" />
                            <Skeleton className="h-8 w-8" />
                        </div>
                    </div>
                ))}
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-between w-full">
                <Skeleton className="h-4 w-40" />
                <div className="flex gap-2">
                    <Skeleton className="h-8 w-20" />
                    <Skeleton className="h-8 w-20" />
                </div>
            </div>
        </div>
    )
}
