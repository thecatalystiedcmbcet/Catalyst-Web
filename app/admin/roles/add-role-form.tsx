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

interface AddRoleFormProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    onSuccess?: (role: any) => void
}

export function AddRoleForm({ open, onOpenChange, onSuccess }: AddRoleFormProps) {
    const [roleName, setRoleName] = React.useState("")
    const [error, setError] = React.useState("")
    const [isSubmitting, setIsSubmitting] = React.useState(false)

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault()

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
            const response = await fetch("/api/v1/roles", {
                method: "POST",
                credentials: "include",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ name: sanitizedName }),
            })

            const result = await response.json()

            if (!response.ok) {
                throw new Error(result.error || result.message || result.details || "Failed to create role")
            }

            // Success
            postActionLog({
                action: "Created Role",
                entity_type: "role",
                entity_name: `Created role "${sanitizedName}"`,
                status: "success",
                details: `Role name: ${sanitizedName}`,
            })
            if (onSuccess) {
                onSuccess(result)
            }

            // Reset form
            setRoleName("")
            setError("")
            onOpenChange(false)
        } catch (err: any) {
            postActionLog({
                action: "Created Role",
                entity_type: "role",
                entity_name: `Failed to create role "${roleName}"`,
                status: "error",
                details: err.message ?? "Failed to create role",
            })
            setError(err.message || "Failed to create role")
        } finally {
            setIsSubmitting(false)
        }
    }

    function handleCancel() {
        setRoleName("")
        setError("")
        onOpenChange(false)
    }

    return (
        <AlertDialog open={open} onOpenChange={onOpenChange}>
            <AlertDialogContent>
                <form onSubmit={handleSubmit}>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Add Role</AlertDialogTitle>
                        <AlertDialogDescription>
                            Enter the role name below to create a new role.
                        </AlertDialogDescription>
                    </AlertDialogHeader>

                    {FORM_FIELDS.role.name.enabled && <div className="py-4 space-y-2">
                        <Label htmlFor="role-name">Role Name {FORM_FIELDS.role.name.required && <span className="text-destructive">*</span>}</Label>
                        <Input
                            id="role-name"
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
                            {isSubmitting ? "Adding..." : "Add Role"}
                        </Button>
                    </AlertDialogFooter>
                </form>
            </AlertDialogContent>
        </AlertDialog>
    )
}
