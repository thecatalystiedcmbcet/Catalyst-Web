"use client"

import * as React from "react"
import { getColumns } from "./columns"
import { DataTable } from "./data-table"
import { Role } from "./types"
import { AddRoleForm } from "./add-role-form"
import { EditRoleForm } from "./edit-role-form"
import { Button } from "@/components/ui/button"
import { Plus, CheckCircle2, XCircle } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

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

            <div className="flex justify-between items-center w-full">
                <div>
                    <h1>Roles</h1>
                </div>
                <div>
                    <Button variant="outline" onClick={() => setIsAddDialogOpen(true)}>
                        <Plus />Add Role
                    </Button>
                </div>
            </div>

            <div className="py-10 w-full">
                <DataTable
                    columns={getColumns((role) => {
                        setEditingRole(role)
                        setIsEditDialogOpen(true)
                    })}
                    data={data}
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
