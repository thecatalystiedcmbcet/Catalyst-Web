"use client"

import * as React from "react"
import { getColumns } from "./columns"
import { DataTable } from "./data-table"
import { Role } from "./types"
import { AddRoleForm } from "./add-role-form"
import { EditRoleForm } from "./edit-role-form"
import { Button } from "@/components/ui/button"
import { Plus, CheckCircle2, XCircle, Search, Filter, Download, Eye } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Input } from "@/components/ui/input"

interface RolesClientProps {
    initialData: Role[]
}

export function RolesClient({ initialData }: RolesClientProps) {
    const [data, setData] = React.useState<Role[]>(initialData)
    const [editingRole, setEditingRole] = React.useState<Role | null>(null)
    const [isAddDialogOpen, setIsAddDialogOpen] = React.useState(false)
    const [isEditDialogOpen, setIsEditDialogOpen] = React.useState(false)
    const [alert, setAlert] = React.useState<{
        type: "success" | "error"
        message: string
    } | null>(null)
    const [searchQuery, setSearchQuery] = React.useState("")

    const filteredData = React.useMemo(() => {
        if (!searchQuery) return data;
        const lowerQ = searchQuery.toLowerCase();
        return data.filter(item => 
            (item.name && item.name.toLowerCase().includes(lowerQ)) ||
            (item.id && item.id.toLowerCase().includes(lowerQ))
        );
    }, [data, searchQuery])

    const handleAddRole = React.useCallback((roleName: string) => {
        // Show success alert
        setAlert({
            type: "success",
            message: `Role "${roleName}" added successfully!`
        })

        // Reload page after 1 second to show the new role
        setTimeout(() => {
            window.location.reload()
        }, 1000)
    }, [])

    const handleEditRole = React.useCallback((roleName: string) => {
        // Show success alert
        setAlert({
            type: "success",
            message: `Role "${roleName}" updated successfully!`
        })

        // Reload page after 1 second to show the updated role
        setTimeout(() => {
            window.location.reload()
        }, 1000)
    }, [])

    return (
        <div className="flex flex-col items-center w-full max-w-7xl mx-auto">
            {alert && (
                <div className="fixed bottom-4 right-4 z-50 max-w-md">
                    <Alert
                        variant={alert.type === "error" ? "destructive" : "default"}
                        className={`shadow-lg ${alert.type === "success"
                            ? "border-l-4 border-l-green-500"
                            : "border-l-4"
                            }`}
                    >
                        {alert.type === "success" ? (
                            <CheckCircle2 className="h-4 w-4 text-green-600" />
                        ) : (
                            <XCircle className="h-4 w-4" />
                        )}
                        <AlertTitle>{alert.type === "success" ? "Success" : "Error"}</AlertTitle>
                        <AlertDescription>{alert.message}</AlertDescription>
                    </Alert>
                </div>
            )}

            {/* Header Section */}
            <div className="gsap-fade-up flex flex-col md:flex-row md:justify-between md:items-start gap-4 w-full">
                <div className="space-y-1">
                    <h1 className="text-3xl font-bold tracking-tight text-foreground">Roles</h1>
                    <p className="text-sm text-muted-foreground">
                        Manage user roles and permissions.
                    </p>
                </div>
                
                <div className="flex w-full md:w-auto flex-col sm:flex-row shadow-sm sm:shadow-none gap-2">
                    <Button variant="outline" className="w-full sm:w-auto h-10 shadow-sm order-2 sm:order-1" asChild>
                        <a href="/api/v1/export?collection=ROLES">
                            <Download className="w-4 h-4 mr-2" /> Export
                        </a>
                    </Button>
                    <Button className="w-full sm:w-auto h-10 order-1 sm:order-2" onClick={() => setIsAddDialogOpen(true)}>
                        <Plus className="w-4 h-4 mr-2" /> Add Role
                    </Button>
                </div>
            </div>

            {/* Filter and Search Bar */}
            <div className="gsap-fade-up w-full pt-2">
                <div className="relative w-full md:max-w-md">
                    <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input 
                        placeholder="Search roles..." 
                        className="pl-9 h-10 bg-background"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
            </div>

            <div className="py-10 w-full">
                <DataTable
                    columns={getColumns((role) => {
                        setEditingRole(role)
                        setIsEditDialogOpen(true)
                    })}
                    data={filteredData}
                />
            </div>

            <AddRoleForm
                open={isAddDialogOpen}
                onOpenChange={setIsAddDialogOpen}
                onSuccess={handleAddRole}
            />

            <EditRoleForm
                role={editingRole}
                open={isEditDialogOpen}
                onOpenChange={setIsEditDialogOpen}
                onSuccess={handleEditRole}
            />
        </div>
    )
}
