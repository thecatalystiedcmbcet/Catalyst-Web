"use client"

import * as React from "react"
import { getColumns } from "./columns"
import { DataTable } from "./data-table"
import { Role } from "./types"
import { AddRoleForm } from "./add-role-form"
import { EditRoleForm } from "./edit-role-form"
import { Button } from "@/components/ui/button"
import { Plus, CheckCircle2, XCircle, Search,Download,GripVertical } from "lucide-react"
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
    const [isReordering, setIsReordering] = React.useState(false)
    const [reorderedData, setReorderedData] = React.useState<Role[]>([])

    const filteredData = React.useMemo(() => {
        if (isReordering) return reorderedData;
        if (!searchQuery) return data;
        const lowerQ = searchQuery.toLowerCase();
        return data.filter(item =>
            (item.name && item.name.toLowerCase().includes(lowerQ)) ||
            (item.id && item.id.toLowerCase().includes(lowerQ))
        );
    }, [data, searchQuery, isReordering, reorderedData])

    const handleAddRole = React.useCallback((newRole: any) => {
        // Optimistically update the UI using the true backend entity
        setData(prev => [...prev, { id: newRole.$id || newRole.id, name: newRole.name, member_count: 0, priority: 0 } as any])

        // Show success alert
        setAlert({
            type: "success",
            message: `Role "${newRole.name}" added successfully!`
        })

        // Auto-hide alert after 3 seconds
        setTimeout(() => {
            setAlert(null)
        }, 3000)
    }, [])

    const handleEditRole = React.useCallback((roleName: string) => {
        // Optimistically update the UI
        setData(prev => prev.map(r => r.id === editingRole?.id ? { ...r, name: roleName } : r))

        // Show success alert
        setAlert({
            type: "success",
            message: `Role "${roleName}" updated successfully!`
        })

        // Auto-hide alert after 3 seconds
        setTimeout(() => {
            setAlert(null)
        }, 3000)
    }, [editingRole])

    const [isSavingOrder, setIsSavingOrder] = React.useState(false)

    const handleSaveOrder = React.useCallback(async () => {
        setIsSavingOrder(true)
        const updates = reorderedData.map((r, index) => ({ id: r.id || (r as any).$id, priority: index + 1 }))

        try {
            const res = await fetch("/api/v1/roles/reorder", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ updates })
            })
            if (!res.ok) throw new Error("Failed to update role priority")

            setData(reorderedData)
            setIsReordering(false)
            setAlert({
                type: "success",
                message: "Role order saved effectively!"
            })
        } catch (e: any) {
            setAlert({ type: "error", message: e.message || "Failed to save order" })
        } finally {
            setIsSavingOrder(false)
            setTimeout(() => setAlert(null), 3000)
        }
    }, [reorderedData])

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
                    {isReordering ? (
                        <>
                            <Button variant="ghost" className="w-full sm:w-auto h-10 order-2 sm:order-1" onClick={() => setIsReordering(false)} disabled={isSavingOrder}>
                                Cancel
                            </Button>
                            <Button className="w-full sm:w-auto h-10 order-1 sm:order-2" onClick={handleSaveOrder} disabled={isSavingOrder}>
                                {isSavingOrder ? "Saving..." : "Save Order"}
                            </Button>
                        </>
                    ) : (
                        <>
                            <Button variant="outline" className="w-full sm:w-auto h-10 shadow-sm order-3 sm:order-1" onClick={() => {
                                setIsReordering(true)
                                setReorderedData(data)
                                setSearchQuery("")
                            }}>
                                <GripVertical className="w-4 h-4 mr-2" /> Edit Order
                            </Button>
                            <Button variant="outline" className="w-full sm:w-auto h-10 shadow-sm order-2 sm:order-2" asChild>
                                <a href="/api/v1/export?collection=ROLES">
                                    <Download className="w-4 h-4 mr-2" /> Export
                                </a>
                            </Button>
                            <Button className="w-full sm:w-auto h-10 order-1 sm:order-3" onClick={() => setIsAddDialogOpen(true)}>
                                <Plus className="w-4 h-4 mr-2" /> Add Role
                            </Button>
                        </>
                    )}
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
                        disabled={isReordering}
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
                    isReordering={isReordering}
                    onReorder={setReorderedData}
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
