"use client"

import * as React from "react"
import { getColumns, Payment } from "./columns"
import { DataTable } from "./data-table"
import AddMemberForm from "./add-member-form"
import { Role, Organization } from "./types"
import {
    Drawer,
    DrawerContent,
    DrawerHeader,
    DrawerTitle,
    DrawerTrigger,
} from "@/components/ui/drawer"
import { Button } from "@/components/ui/button"
import { Plus, CheckCircle2, XCircle } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

interface MembersClientProps {
    initialData: Payment[]
    roles: Role[]
    organizations: Organization[]
}

export function MembersClient({ initialData, roles, organizations }: MembersClientProps) {
    const [data, setData] = React.useState<Payment[]>(initialData)
    const [alert, setAlert] = React.useState<{
        type: "success" | "error"
        message: string
    } | null>(null)
    const [isDrawerOpen, setIsDrawerOpen] = React.useState(false)
    const [editingMember, setEditingMember] = React.useState<Payment | null>(null)
    const [editFormData, setEditFormData] = React.useState<any>(null)

    const handleAddMember = React.useCallback(async (memberData: any) => {
        // Show success alert immediately
        setAlert({
            type: "success",
            message: `${memberData.name} added successfully!`
        })

        // Close drawer
        setIsDrawerOpen(false)

        // Make actual API call
        try {
            const formData = new FormData()
            formData.append("name", memberData.name)
            formData.append("email", memberData.email)
            formData.append("phone", memberData.phone)

            // Handle photo - could be File object or string URL
            if (memberData.photo instanceof File) {
                formData.append("photo", memberData.photo)
            } else if (typeof memberData.photo === 'string') {
                formData.append("photo", memberData.photo)
            }

            const organizationIds = memberData.organization
                .map((org: any) => {
                    const matchedOrg = organizations.find(organization =>
                        organization.name.toLowerCase() === org.name.toLowerCase()
                    )
                    return matchedOrg?.$id
                })
                .filter(Boolean)
            formData.append("orgs", JSON.stringify(organizationIds))

            const roleIds = memberData.roles
                .map((r: any) => {
                    const matchedRole = roles.find(role =>
                        role.name.toLowerCase() === r.name.toLowerCase()
                    )
                    return matchedRole?.$id
                })
                .filter(Boolean)
            formData.append("roles", JSON.stringify(roleIds))
            formData.append("join_date", memberData.join_date)
            formData.append("leave_date", memberData.leave_date)

            const response = await fetch("/api/v1/members", {
                method: "POST",
                body: formData,
            })

            const result = await response.json()

            if (!response.ok) {
                const errorMessage = result.error || result.message || result.details || "Failed to add member"
                throw new Error(errorMessage)
            }

            // Success! Reload page after 1 second to show the success message
            setTimeout(() => {
                window.location.reload()
            }, 1000)

        } catch (error: any) {
            console.error("Error adding member:", error)

            // Show error alert
            setAlert({
                type: "error",
                message: `Failed to add ${memberData.name}. ${error.message || 'Please try again.'}`
            })

            // Auto-hide error alert after 5 seconds
            setTimeout(() => setAlert(null), 5000)
        }
    }, [roles, organizations])

    const handleEditMember = React.useCallback(async (memberId: string, memberData: any) => {
        // Show success alert immediately
        setAlert({
            type: "success",
            message: `${memberData.name} updated successfully!`
        })

        // Close drawer
        setIsDrawerOpen(false)
        setEditingMember(null)
        setEditFormData(null)

        // Make PATCH API call
        try {
            const formData = new FormData()
            formData.append("name", memberData.name)
            formData.append("email", memberData.email)
            formData.append("phone", memberData.phone)

            // Handle photo - could be File object or string URL
            if (memberData.photo instanceof File) {
                formData.append("photo", memberData.photo)
            } else if (typeof memberData.photo === 'string') {
                formData.append("photo", memberData.photo)
            }

            const organizationIds = memberData.organization
                .map((org: any) => {
                    const matchedOrg = organizations.find(organization =>
                        organization.name.toLowerCase() === org.name.toLowerCase()
                    )
                    return matchedOrg?.$id
                })
                .filter(Boolean)
            formData.append("orgs", JSON.stringify(organizationIds))

            const roleIds = memberData.roles
                .map((r: any) => {
                    const matchedRole = roles.find(role =>
                        role.name.toLowerCase() === r.name.toLowerCase()
                    )
                    return matchedRole?.$id
                })
                .filter(Boolean)
            formData.append("roles", JSON.stringify(roleIds))
            formData.append("join_date", memberData.join_date)
            formData.append("leave_date", memberData.leave_date)

            const response = await fetch(`/api/v1/members/${memberId}`, {
                method: "PATCH",
                body: formData,
            })

            const result = await response.json()

            if (!response.ok) {
                const errorMessage = result.error || result.message || result.details || "Failed to update member"
                throw new Error(errorMessage)
            }

            // Success! Reload page after 1 second to show the success message
            setTimeout(() => {
                window.location.reload()
            }, 1000)

        } catch (error: any) {
            console.error("Error updating member:", error)

            // Show error alert
            setAlert({
                type: "error",
                message: `Failed to update ${memberData.name}. ${error.message || 'Please try again.'}`
            })

            // Auto-hide error alert after 5 seconds
            setTimeout(() => setAlert(null), 5000)
        }
    }, [roles, organizations])

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
                    <h1>Members</h1>
                </div>
                <div>
                    <Drawer direction="right" open={isDrawerOpen} onOpenChange={(open) => {
                        setIsDrawerOpen(open)
                        if (!open) {
                            setEditingMember(null)
                            setEditFormData(null)
                        }
                    }}>
                        <DrawerTrigger asChild>
                            <Button variant="outline"><Plus />Add User</Button>
                        </DrawerTrigger>
                        <DrawerContent className="no-scrollbar overflow-y-auto">
                            <AddMemberForm
                                roles={roles}
                                organizations={organizations}
                                onSubmitSuccess={editingMember ? undefined : handleAddMember}
                                initialData={editingMember}
                                memberId={editingMember?.id}
                                onEdit={editingMember ? handleEditMember : undefined}
                            />
                        </DrawerContent>
                    </Drawer>
                </div>
            </div>

            <div className="py-10 w-full">
                <DataTable
                    columns={getColumns((member) => {
                        setEditingMember(member)
                        setIsDrawerOpen(true)
                    })}
                    data={data}
                />
            </div>
        </div>
    )
}
