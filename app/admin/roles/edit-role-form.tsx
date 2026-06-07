"use client"

import * as React from "react"
import { postActionLog } from "@/lib/utils/action-log"
import { sanitizeText, FORM_FIELDS, enforceTitleChars, containsDangerousContent } from "@/lib/utils/form-safety"
import { Button } from "@/components/ui/button"
import {
    AlertDialog,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Role } from "./types"

interface EditRoleFormProps {
    role: Role | null
    open: boolean
    onOpenChange: (open: boolean) => void
    onSuccess?: (roleName: string) => void
}

export function EditRoleForm({ role, open, onOpenChange, onSuccess }: EditRoleFormProps) {
    const [roleName, setRoleName] = React.useState("")
    const [error, setError] = React.useState("")
    const [isSubmitting, setIsSubmitting] = React.useState(false)

    // Update roleName when role changes
    React.useEffect(() => {
        if (role) {
            setRoleName(role.name)
        }
    }, [role])

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault()

        if (!role) return

        const trimmed = sanitizeText(roleName, FORM_FIELDS.role.name.maxLength)
        if (FORM_FIELDS.role.name.required && !trimmed) {
            setError("Required")
            return
        }

        if (trimmed.length < 2) {
            setError("Role name must be at least 2 characters")
            return
        }

        if (containsDangerousContent(trimmed)) {
            setError("Invalid characters detected")
            return
        }

        const sanitizedName = trimmed

        setIsSubmitting(true)
        setError("")

        try {
            const response = await fetch(`/api/v1/roles/${role.id}`, {
                method: "PATCH",
                credentials: "include",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ name: sanitizedName }),
            })

            const result = await response.json()

            if (!response.ok) {
                throw new Error(result.error || result.message || result.details || "Failed to update role")
            }

            // Success
            postActionLog({
                action: "Updated Role",
                entity_type: "role",
                entity_id: role.id,
                entity_name: `Updated role to "${sanitizedName}"`,
                status: "success",
                details: `New name: ${sanitizedName}`,
            })
            if (onSuccess) {
                onSuccess(sanitizedName)
            }

            // Reset form
            setRoleName("")
            setError("")
            onOpenChange(false)
        } catch (err: any) {
            postActionLog({
                action: "Updated Role",
                entity_type: "role",
                entity_id: role?.id,
                entity_name: `Failed to update role "${roleName}"`,
                status: "error",
                details: err.message ?? "Failed to update role",
            })
            setError(err.message || "Failed to update role")
        } finally {
            setIsSubmitting(false)
        }
    }

    function handleCancel() {
        setRoleName(role?.name || "")
        setError("")
        onOpenChange(false)
    }

    return (
        <AlertDialog open={open} onOpenChange={onOpenChange}>
            <AlertDialogContent>
                <form onSubmit={handleSubmit}>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Edit Role</AlertDialogTitle>
                        <AlertDialogDescription>
                            Update the role name below.
                        </AlertDialogDescription>
                    </AlertDialogHeader>

                    {FORM_FIELDS.role.name.enabled && <div className="py-4 space-y-2">
                        <Label htmlFor="edit-role-name">Role Name {FORM_FIELDS.role.name.required && <span className="text-destructive">*</span>}</Label>
                        <Input
                            id="edit-role-name"
                            placeholder="Enter role name"
                            value={roleName}
                            onChange={(e) => {
                                setRoleName(enforceTitleChars(e.target.value))
                                setError("")
                            }}
                            autoFocus
                            disabled={isSubmitting}
                            maxLength={FORM_FIELDS.role.name.maxLength}
                        />
                        {error && (
                            <p className="text-sm text-destructive">{error}</p>
                        )}
                        <p className="text-sm text-muted-foreground">
                            This is the name that will be displayed for the role.
                        </p>
                    </div>}

                    <AlertDialogFooter>
                        <Button type="button" variant="outline" onClick={handleCancel} disabled={isSubmitting}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={isSubmitting}>
                            {isSubmitting ? "Updating..." : "Update Role"}
                        </Button>
                    </AlertDialogFooter>
                </form>
            </AlertDialogContent>
        </AlertDialog>
    )
}
