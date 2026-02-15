"use client"

import * as React from "react"
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
    onSuccess?: (roleName: string) => void
}

export function AddRoleForm({ open, onOpenChange, onSuccess }: AddRoleFormProps) {
    const [roleName, setRoleName] = React.useState("")
    const [error, setError] = React.useState("")
    const [isSubmitting, setIsSubmitting] = React.useState(false)

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault()

        if (!roleName.trim()) {
            setError("Role name is required")
            return
        }

        if (roleName.length < 2) {
            setError("Role name must be at least 2 characters")
            return
        }

        setIsSubmitting(true)
        setError("")

        try {
            const response = await fetch("/api/v1/roles", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ name: roleName }),
            })

            const result = await response.json()

            if (!response.ok) {
                throw new Error(result.error || result.message || "Failed to create role")
            }

            // Success
            if (onSuccess) {
                onSuccess(roleName)
            }

            // Reset form
            setRoleName("")
            setError("")
            onOpenChange(false)
        } catch (err: any) {
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

                    <div className="py-4 space-y-2">
                        <Label htmlFor="role-name">Role Name</Label>
                        <Input
                            id="role-name"
                            placeholder="Enter role name"
                            value={roleName}
                            onChange={(e) => {
                                setRoleName(e.target.value)
                                setError("")
                            }}
                            autoFocus
                            disabled={isSubmitting}
                        />
                        {error && (
                            <p className="text-sm text-destructive">{error}</p>
                        )}
                        <p className="text-sm text-muted-foreground">
                            This is the name that will be displayed for the role.
                        </p>
                    </div>

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
