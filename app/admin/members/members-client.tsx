"use client"

import * as React from "react"
import { postActionLog } from "@/lib/utils/action-log"
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
import { Plus, CheckCircle2, XCircle, Search,Download } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import gsap from "gsap"
import { useGSAP } from "@gsap/react"
import { Input } from "@/components/ui/input"

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
    const [searchQuery, setSearchQuery] = React.useState("")

    const filteredData = React.useMemo(() => {
        if (!searchQuery) return data;
        const lowerQ = searchQuery.toLowerCase();
        return data.filter(item => 
            (item.name && item.name.toLowerCase().includes(lowerQ)) ||
            (item.email && item.email.toLowerCase().includes(lowerQ)) ||
            (item.phone && item.phone.toLowerCase().includes(lowerQ))
        );
    }, [data, searchQuery])

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
                credentials: "include",
                body: formData,
            })

            const result = await response.json()

            if (!response.ok) {
                const errorMessage = result.error || result.message || result.details || "Failed to add member"
                throw new Error(errorMessage)
            }

            // Log success
            postActionLog({
                action: "Created Member",
                entity_type: "member",
                entity_name: `Created member ${memberData.name}`,
                status: "success",
                details: `Name: ${memberData.name} | Email: ${memberData.email} | Phone: ${memberData.phone} | Joined: ${memberData.join_date}`,
            })

            // Optimistically update the UI since the server cache might be stale
            const newMemberId = result?.$id || result?.id || "temp-" + Date.now().toString()
            const organizationNames = memberData.organization.map((org: any) => org.name).join(", ")
            const roleNames = memberData.roles.map((role: any) => role.name).join(", ")
            
            setData(prev => [{ 
                id: newMemberId, 
                name: memberData.name, 
                email: memberData.email,
                phone: memberData.phone,
                organization: organizationNames,
                roles: roleNames,
                join_date: memberData.join_date || "",
                leave_date: memberData.leave_date || null,
                photo: memberData.photo || null,
            }, ...prev])

        } catch (error: any) {
            console.error("Error adding member:", error)

            // Log failure
            postActionLog({
                action: "Created Member",
                entity_type: "member",
                entity_name: `Failed to create member ${memberData.name}`,
                status: "error",
                details: error.message ?? "Failed to add member",
            })

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
                credentials: "include",
                body: formData,
            })

            const result = await response.json()

            if (!response.ok) {
                const errorMessage = result.error || result.message || result.details || "Failed to update member"
                throw new Error(errorMessage)
            }

            // Log success
            postActionLog({
                action: "Updated Member",
                entity_type: "member",
                entity_id: memberId,
                entity_name: `Updated member ${memberData.name}`,
                status: "success",
                details: `Name: ${memberData.name} | Email: ${memberData.email} | Phone: ${memberData.phone} | Joined: ${memberData.join_date}`,
            })

            // Success! Reload page after 1 second to show the success message
            setTimeout(() => {
                window.location.reload()
            }, 1000)

        } catch (error: any) {
            console.error("Error updating member:", error)

            // Log failure
            postActionLog({
                action: "Updated Member",
                entity_type: "member",
                entity_id: memberId,
                entity_name: `Failed to update member ${memberData.name}`,
                status: "error",
                details: error.message ?? "Failed to update member",
            })

            // Show error alert
            setAlert({
                type: "error",
                message: `Failed to update ${memberData.name}. ${error.message || 'Please try again.'}`
            })

            // Auto-hide error alert after 5 seconds
            setTimeout(() => setAlert(null), 5000)
        }
    }, [roles, organizations])

    const containerRef = React.useRef<HTMLDivElement>(null)

    useGSAP(() => {
        gsap.from(".gsap-fade-up", {
            y: 30,
            opacity: 0,
            duration: 0.6,
            stagger: 0.1,
            ease: "power2.out",
        })
    }, { scope: containerRef })

    return (
        <div ref={containerRef} className="flex flex-col w-full max-w-7xl mx-auto space-y-6 pb-12">
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
                    <h1 className="text-3xl font-bold tracking-tight text-foreground">Members</h1>
                    <p className="text-sm text-muted-foreground">
                        Manage your team members and permissions.
                    </p>
                </div>
                
                <div className="flex w-full md:w-auto flex-col sm:flex-row shadow-sm sm:shadow-none gap-2">
                    <Button variant="outline" className="w-full sm:w-auto h-10 shadow-sm order-2 sm:order-1" asChild>
                        <a href="/api/v1/export?collection=MEMBERS">
                            <Download className="w-4 h-4 mr-2" /> Export
                        </a>
                    </Button>

                    <Drawer direction="right" open={isDrawerOpen} onOpenChange={(open) => {
                        setIsDrawerOpen(open)
                        if (!open) {
                            setEditingMember(null)
                            setEditFormData(null)
                        }
                    }}>
                        <DrawerTrigger asChild>
                            <Button className="w-full sm:w-auto h-10 order-1 sm:order-2">
                                <Plus className="w-4 h-4 mr-2" /> Add User
                            </Button>
                        </DrawerTrigger>
                        <DrawerContent className="no-scrollbar overflow-y-auto overflow-x-hidden">
                            <DrawerHeader className="sr-only">
                                <DrawerTitle>
                                    {editingMember ? "Edit Member" : "Add Member"}
                                </DrawerTitle>
                            </DrawerHeader>
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

            {/* Filter and Search Bar */}
            <div className="gsap-fade-up w-full pt-2">
                <div className="relative w-full md:max-w-md">
                    <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input 
                        placeholder="Search members..." 
                        className="pl-9 h-10 bg-background"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
            </div>

            {/* Data Table */}
            <div className="gsap-fade-up w-full">
                <DataTable
                    columns={getColumns((member) => {
                        setEditingMember(member)
                        setIsDrawerOpen(true)
                    })}
                    data={filteredData}
                />
            </div>
        </div>
    )
}
