"use client"
import { Role, Organization } from "@/app/admin/members/types"

import * as React from "react"
import { createPortal } from "react-dom"
import { zodResolver } from "@hookform/resolvers/zod"
import { Controller, useForm } from "react-hook-form"
import { Calendar } from "@/components/ui/calendar"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import { format } from "date-fns"
import { ChevronDownIcon, X } from "lucide-react"
import {
    DropdownMenu,
    DropdownMenuCheckboxItem,
    DropdownMenuContent,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"

import * as z from "zod"
import { sanitizeFormData, buildSanitizeRules, FORM_FIELDS, EMAIL_REGEX, PHONE_REGEX, enforceNameChars, enforceNoSpaces, enforcePhoneChars, containsDangerousContent } from "@/lib/utils/form-safety"

import { Button } from "@/components/ui/button"
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import {
    Field,
    FieldDescription,
    FieldError,
    FieldGroup,
    FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import {
    InputGroup,
    InputGroupAddon,
    InputGroupText,
    InputGroupTextarea,
} from "@/components/ui/input-group"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { CheckCircle2, XCircle } from "lucide-react"

const formSchema = z.object({
    name: z
        .string()
        .refine(v => !FORM_FIELDS.member.name.required || v.trim().length > 0, { message: "Required" })
        .refine(v => !/\d/.test(v), { message: "Name cannot contain numbers" })
        .refine(v => !containsDangerousContent(v), { message: "Invalid characters detected" })
        .refine(v => v.trim().length === 0 || v.trim().length >= 3, { message: "Name must be at least 3 characters." }),
    email: z
        .string()
        .refine(v => !FORM_FIELDS.member.email.required || v.trim().length > 0, { message: "Required" })
        .refine(v => !containsDangerousContent(v), { message: "Invalid characters detected" })
        .refine(v => v.trim().length === 0 || EMAIL_REGEX.test(v), { message: "Enter valid email" }),
    phone: z
        .string()
        .refine(v => !FORM_FIELDS.member.phone.required || v.trim().length > 0, { message: "Required" })
        .refine(v => !containsDangerousContent(v), { message: "Invalid characters detected" })
        .refine(v => v.trim().length === 0 || PHONE_REGEX.test(v), { message: "Enter valid phone" }),
    photo: z.any().optional().refine(v => !FORM_FIELDS.member.photo.required || v, { message: "Required" }),
    organization: z.array(z.object({ name: z.string() })).refine(v => !FORM_FIELDS.member.organization.required || v.length > 0, { message: "Required" }),
    roles: z.array(z.object({ name: z.string() })).refine(v => !FORM_FIELDS.member.roles.required || v.length > 0, { message: "Required" }),
    join_date: z.string().optional().refine(v => !FORM_FIELDS.member.join_date.required || (v && v.trim().length > 0), { message: "Required" }),
    leave_date: z.string().optional().refine(v => !FORM_FIELDS.member.leave_date.required || (v && v.trim().length > 0), { message: "Required" }),
})

export default function AddMemberForm({
    roles,
    organizations,
    onSubmitSuccess,
    initialData,
    memberId,
    onEdit
}: {
    roles: Role[],
    organizations: Organization[],
    onSubmitSuccess?: (data: any) => void,
    initialData?: any,
    memberId?: string,
    onEdit?: (memberId: string, data: any) => void
}) {
    const isEditMode = !!memberId && !!initialData

    const [joinDate, setJoinDate] = React.useState<Date | undefined>(
        initialData?.join_date ? new Date(initialData.join_date) : undefined
    )
    const [leaveDate, setLeaveDate] = React.useState<Date | undefined>(
        initialData?.leave_date ? new Date(initialData.leave_date) : undefined
    )
    const [isSubmitting, setIsSubmitting] = React.useState(false)
    const [photoFile, setPhotoFile] = React.useState<File | null>(null)
    const [photoPreview, setPhotoPreview] = React.useState<string>(initialData?.photo || "")
    const [photoError, setPhotoError] = React.useState<string>("")

    type BgAlert = { id: number; type: "success" | "error"; message: string }
    const [bgAlerts, setBgAlerts] = React.useState<BgAlert[]>([])
    const alertCounterRef = React.useRef(0)
    const pushAlert = React.useCallback((type: "success" | "error", message: string) => {
        const id = ++alertCounterRef.current
        setBgAlerts(prev => [...prev, { id, type, message }])
        setTimeout(() => setBgAlerts(prev => prev.filter(a => a.id !== id)), 4000)
    }, [])

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: initialData?.name || "",
            email: initialData?.email || "",
            phone: initialData?.phone || "",
            photo: initialData?.photo || "",
            organization: initialData?.organization
                ? initialData.organization.split(",").map((org: string) => ({ name: org.trim() }))
                : [],
            roles: initialData?.roles
                ? initialData.roles.split(",").map((role: string) => ({ name: role.trim() }))
                : [],
            join_date: initialData?.join_date || "",
            leave_date: initialData?.leave_date || "",
        },
    })

    async function onSubmit(rawData: z.infer<typeof formSchema>) {
        const data = sanitizeFormData(rawData, buildSanitizeRules(FORM_FIELDS.member))
        console.log("Form data:", data)
        setIsSubmitting(true)

        // Handle edit mode
        if (isEditMode && onEdit && memberId) {
            onEdit(memberId, data)
            setIsSubmitting(false)
            return
        }

        // Handle create mode
        if (onSubmitSuccess) {
            onSubmitSuccess(data)
            form.reset()
            setJoinDate(undefined)
            setLeaveDate(undefined)
            setIsSubmitting(false)
            return
        }

        // Fallback: handle API call directly if no callback provided
        try {
            const formData = new FormData()

            formData.append("name", data.name)
            formData.append("email", data.email)
            formData.append("phone", data.phone)
            if (data.photo) formData.append("photo", data.photo)
            formData.append("organization", data.organization.map((org: any) => org.name).join(","))
            formData.append("roles", data.roles.map((role: any) => role.name).join(","))
            if (data.join_date) formData.append("join_date", data.join_date)
            if (data.leave_date) formData.append("leave_date", data.leave_date)

            const response = await fetch("/api/v1/members", {
                method: "POST",
                credentials: "include",
                body: formData,
            })

            const result = await response.json()
            if (response.ok) {
                form.reset()
                setJoinDate(undefined)
                setLeaveDate(undefined)
                return
            }
            const errorMessage = result.error || result.message || result.details || "Failed to submit"
            console.error("Error:", errorMessage)
            pushAlert("error", errorMessage)
        } catch (error: any) {
            console.error("Error:", error)
            pushAlert("error", error.message ?? "Failed to submit")
        } finally {
            setIsSubmitting(false)
        }
    }

    // Reset handler - resets to initialData in edit mode, or clears form in add mode
    function handleReset() {
        if (isEditMode && initialData) {
            // Reset to original values in edit mode
            form.reset({
                name: initialData.name || "",
                email: initialData.email || "",
                phone: initialData.phone || "",
                photo: initialData.photo || "",
                organization: initialData.organization
                    ? initialData.organization.split(",").map((org: string) => ({ name: org.trim() }))
                    : [],
                roles: initialData.roles
                    ? initialData.roles.split(",").map((role: string) => ({ name: role.trim() }))
                    : [],
                join_date: initialData.join_date || "",
                leave_date: initialData.leave_date || "",
            })

            // Reset date states
            if (initialData.join_date) {
                setJoinDate(new Date(initialData.join_date))
            } else {
                setJoinDate(undefined)
            }
            if (initialData.leave_date) {
                setLeaveDate(new Date(initialData.leave_date))
            } else {
                setLeaveDate(undefined)
            }
        } else {
            // Clear form in add mode
            form.reset()
            setJoinDate(undefined)
            setLeaveDate(undefined)
        }
    }

    return (
        <>
            <Card className="w-full sm:max-w-md">
                <CardHeader>
                    <CardTitle>{isEditMode ? "Edit Member" : "Add Member"}</CardTitle>
                </CardHeader>
                <CardContent>
                    <form id="add-member" onSubmit={form.handleSubmit(onSubmit)}>
                        <FieldGroup>
                            {FORM_FIELDS.member.name.enabled && <Controller
                                name="name"
                                control={form.control}
                                render={({ field, fieldState }) => (
                                    <Field data-invalid={fieldState.invalid}>
                                        <FieldLabel htmlFor="add-member-name">
                                            Name {FORM_FIELDS.member.name.required && <span className="text-destructive">*</span>}
                                        </FieldLabel>
                                        <Input
                                            {...field}
                                            onChange={(e) => field.onChange(enforceNameChars(e.target.value))}
                                            id="add-member-name"
                                            aria-invalid={fieldState.invalid}
                                            placeholder="Enter your name"
                                            autoComplete="off"
                                            maxLength={FORM_FIELDS.member.name.maxLength}
                                        />
                                        {fieldState.invalid && (
                                            <FieldError errors={[fieldState.error]} />
                                        )}
                                        <FieldDescription>
                                            Enter first and last name
                                        </FieldDescription>
                                    </Field>
                                )}
                            />}
                            {FORM_FIELDS.member.email.enabled && <Controller
                                name="email"
                                control={form.control}
                                render={({ field, fieldState }) => (
                                    <Field data-invalid={fieldState.invalid}>
                                        <FieldLabel htmlFor="add-member-email">
                                            Email {FORM_FIELDS.member.email.required && <span className="text-destructive">*</span>}
                                        </FieldLabel>
                                        <Input
                                            {...field}
                                            onChange={(e) => field.onChange(enforceNoSpaces(e.target.value))}
                                            id="add-member-email"
                                            aria-invalid={fieldState.invalid}
                                            placeholder="Enter your email"
                                            autoComplete="off"
                                            maxLength={FORM_FIELDS.member.email.maxLength}
                                        />
                                        {fieldState.invalid && (
                                            <FieldError errors={[fieldState.error]} />
                                        )}
                                    </Field>
                                )}
                            />}
                            {FORM_FIELDS.member.phone.enabled && <Controller
                                name="phone"
                                control={form.control}
                                render={({ field, fieldState }) => (
                                    <Field data-invalid={fieldState.invalid}>
                                        <FieldLabel htmlFor="add-member-phone">
                                            Phone {FORM_FIELDS.member.phone.required && <span className="text-destructive">*</span>}
                                        </FieldLabel>
                                        <Input
                                            {...field}
                                            onChange={(e) => field.onChange(enforcePhoneChars(e.target.value))}
                                            id="add-member-phone"
                                            aria-invalid={fieldState.invalid}
                                            placeholder="Enter phone number"
                                            autoComplete="off"
                                            maxLength={FORM_FIELDS.member.phone.maxLength}
                                        />
                                        {fieldState.invalid && (
                                            <FieldError errors={[fieldState.error]} />
                                        )}
                                        <FieldDescription>
                                            Enter a 10 digit valid phone number
                                        </FieldDescription>
                                    </Field>
                                )}
                            />}
                            {FORM_FIELDS.member.photo.enabled && <Controller
                                name="photo"
                                control={form.control}
                                render={({ field, fieldState }) => (
                                    <Field data-invalid={fieldState.invalid}>
                                        <FieldLabel htmlFor="add-member-photo">
                                            Photo {FORM_FIELDS.member.photo.required && <span className="text-destructive">*</span>}
                                        </FieldLabel>
                                        <Input
                                            id="add-member-photo"
                                            type="file"
                                            accept="image/*"
                                            aria-invalid={fieldState.invalid || !!photoError}
                                            onChange={(e) => {
                                                const file = e.target.files?.[0]
                                                if (file) {
                                                    // Check file size (5MB = 5 * 1024 * 1024 bytes)
                                                    const maxSize = 5 * 1024 * 1024
                                                    if (file.size > maxSize) {
                                                        setPhotoError("File size must not exceed 5MB")
                                                        setPhotoFile(null)
                                                        setPhotoPreview("")
                                                        field.onChange(null)
                                                        e.target.value = "" // Reset input
                                                        return
                                                    }

                                                    setPhotoError("")
                                                    setPhotoFile(file)
                                                    // Create preview URL
                                                    const reader = new FileReader()
                                                    reader.onloadend = () => {
                                                        setPhotoPreview(reader.result as string)
                                                    }
                                                    reader.readAsDataURL(file)
                                                    field.onChange(file)
                                                }
                                            }}
                                        />
                                        {photoPreview && (
                                            <div className="mt-2">
                                                <img
                                                    src={photoPreview}
                                                    alt="Preview"
                                                    className="w-20 h-20 object-cover rounded-md border"
                                                />
                                            </div>
                                        )}
                                        {photoError && (
                                            <p className="text-sm text-destructive">{photoError}</p>
                                        )}
                                        {fieldState.invalid && (
                                            <FieldError errors={[fieldState.error]} />
                                        )}
                                        <FieldDescription>
                                            Upload a photo file (JPG, PNG, etc.). Max size: 5MB
                                        </FieldDescription>
                                    </Field>
                                )}
                            />}
                            {FORM_FIELDS.member.organization.enabled && <Controller
                                name="organization"
                                control={form.control}
                                render={({ field, fieldState }) => {
                                    const selectedOrgs = Array.isArray(field.value) ? field.value : []

                                    const toggleOrganization = (orgName: string) => {
                                        const isSelected = selectedOrgs.some((org: any) => org.name === orgName)
                                        if (isSelected) {
                                            field.onChange(selectedOrgs.filter((org: any) => org.name !== orgName))
                                        } else {
                                            field.onChange([...selectedOrgs, { name: orgName }])
                                        }
                                    }

                                    return (
                                        <Field data-invalid={fieldState.invalid}>
                                            <FieldLabel htmlFor="add-member-organization">
                                                Organization {FORM_FIELDS.member.organization.required && <span className="text-destructive">*</span>}
                                            </FieldLabel>

                                            {/* Selected organizations as badges */}
                                            {selectedOrgs.length > 0 && (
                                                <div className="flex flex-wrap gap-2 mb-2">
                                                    {selectedOrgs.map((org: any, index: number) => (
                                                        <Badge
                                                            key={index}
                                                            variant="secondary"
                                                            className="flex items-center gap-1 pl-2 pr-1 py-1"
                                                        >
                                                            {org.name}
                                                            <button
                                                                type="button"
                                                                onClick={() => toggleOrganization(org.name)}
                                                                className="ml-1 hover:bg-secondary-foreground/20 rounded-full p-0.5"
                                                            >
                                                                <X className="h-3 w-3" />
                                                            </button>
                                                        </Badge>
                                                    ))}
                                                </div>
                                            )}

                                            {/* Dropdown selector */}
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button
                                                        variant="outline"
                                                        className="w-full justify-between"
                                                        type="button"
                                                    >
                                                        <span className="text-muted-foreground">
                                                            {selectedOrgs.length > 0
                                                                ? `${selectedOrgs.length} selected`
                                                                : "Select organizations"}
                                                        </span>
                                                        <ChevronDownIcon className="h-4 w-4 opacity-50" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent className="w-56 max-h-64 overflow-y-auto">
                                                    {organizations.map((org) => (
                                                        <DropdownMenuCheckboxItem
                                                            key={org.$id}
                                                            checked={selectedOrgs.some((selected: any) => selected.name === org.name)}
                                                            onCheckedChange={() => toggleOrganization(org.name)}
                                                        >
                                                            {org.name}
                                                        </DropdownMenuCheckboxItem>
                                                    ))}
                                                </DropdownMenuContent>
                                            </DropdownMenu>

                                            {fieldState.invalid && (
                                                <FieldError errors={[fieldState.error]} />
                                            )}
                                            <FieldDescription>
                                                Select one or more organizations
                                            </FieldDescription>
                                        </Field>
                                    )
                                }}
                            />}
                            {FORM_FIELDS.member.roles.enabled && <Controller
                                name="roles"
                                control={form.control}
                                render={({ field, fieldState }) => {
                                    const selectedRoles = Array.isArray(field.value) ? field.value : []

                                    const toggleRole = (roleName: string) => {
                                        const isSelected = selectedRoles.some((role: any) => role.name === roleName)
                                        if (isSelected) {
                                            field.onChange(selectedRoles.filter((role: any) => role.name !== roleName))
                                        } else {
                                            field.onChange([...selectedRoles, { name: roleName }])
                                        }
                                    }

                                    return (
                                        <Field data-invalid={fieldState.invalid}>
                                            <FieldLabel htmlFor="add-member-roles">
                                                Roles {FORM_FIELDS.member.roles.required && <span className="text-destructive">*</span>}
                                            </FieldLabel>

                                            {/* Selected roles as badges */}
                                            {selectedRoles.length > 0 && (
                                                <div className="flex flex-wrap gap-2 mb-2">
                                                    {selectedRoles.map((role: any, index: number) => (
                                                        <Badge
                                                            key={index}
                                                            variant="outline"
                                                            className="flex items-center gap-1 pl-2 pr-1 py-1"
                                                        >
                                                            {role.name}
                                                            <button
                                                                type="button"
                                                                onClick={() => toggleRole(role.name)}
                                                                className="ml-1 hover:bg-muted rounded-full p-0.5"
                                                            >
                                                                <X className="h-3 w-3" />
                                                            </button>
                                                        </Badge>
                                                    ))}
                                                </div>
                                            )}

                                            {/* Dropdown selector */}
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button
                                                        variant="outline"
                                                        className="w-full justify-between"
                                                        type="button"
                                                    >
                                                        <span className="text-muted-foreground">
                                                            {selectedRoles.length > 0
                                                                ? `${selectedRoles.length} selected`
                                                                : "Select roles"}
                                                        </span>
                                                        <ChevronDownIcon className="h-4 w-4 opacity-50" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent className="w-56 max-h-64 overflow-y-auto">
                                                    {roles.map((role) => (
                                                        <DropdownMenuCheckboxItem
                                                            key={role.$id}
                                                            checked={selectedRoles.some((selected: any) => selected.name === role.name)}
                                                            onCheckedChange={() => toggleRole(role.name)}
                                                        >
                                                            {role.name}
                                                        </DropdownMenuCheckboxItem>
                                                    ))}
                                                </DropdownMenuContent>
                                            </DropdownMenu>

                                            {fieldState.invalid && (
                                                <FieldError errors={[fieldState.error]} />
                                            )}
                                            <FieldDescription>
                                                Select one or more roles
                                            </FieldDescription>
                                        </Field>
                                    )
                                }}
                            />}
                            {FORM_FIELDS.member.join_date.enabled && <Controller
                                name="join_date"
                                control={form.control}
                                render={({ field, fieldState }) => (
                                    <Field data-invalid={fieldState.invalid}>
                                        <FieldLabel htmlFor="add-member-join_date">
                                            Join Date {FORM_FIELDS.member.join_date.required && <span className="text-destructive">*</span>}
                                        </FieldLabel>
                                        <Popover>
                                            <PopoverTrigger asChild>
                                                <Button variant={"outline"} data-empty={!joinDate} className="data-[empty=true]:text-muted-foreground w-[212px] justify-between text-left font-normal">
                                                    {joinDate ? format(joinDate, "PPP") : <span>Pick a date</span>}
                                                    <ChevronDownIcon data-icon="inline-end" />
                                                </Button>
                                            </PopoverTrigger>
                                            <PopoverContent className="w-auto p-0" align="start">
                                                <Calendar
                                                    mode="single"
                                                    captionLayout="dropdown"
                                                    selected={joinDate}
                                                    onSelect={(date) => {
                                                        setJoinDate(date)
                                                        field.onChange(date ? format(date, "yyyy-MM-dd") : "")
                                                    }}
                                                    defaultMonth={joinDate}
                                                />
                                            </PopoverContent>
                                        </Popover>
                                        {fieldState.invalid && (
                                            <FieldError errors={[fieldState.error]} />
                                        )}
                                        <FieldDescription>
                                            Enter first and last name
                                        </FieldDescription>
                                    </Field>
                                )}
                            />}
                            {FORM_FIELDS.member.leave_date.enabled && <Controller
                                name="leave_date"
                                control={form.control}
                                render={({ field, fieldState }) => (
                                    <Field data-invalid={fieldState.invalid}>
                                        <FieldLabel htmlFor="add-member-leave_date">
                                            Leave Date {FORM_FIELDS.member.leave_date.required && <span className="text-destructive">*</span>}
                                        </FieldLabel>
                                        <Popover>
                                            <PopoverTrigger asChild>
                                                <Button variant={"outline"} data-empty={!leaveDate} className="data-[empty=true]:text-muted-foreground w-[212px] justify-between text-left font-normal">
                                                    {leaveDate ? format(leaveDate, "PPP") : <span>Pick a date</span>}
                                                    <ChevronDownIcon data-icon="inline-end" />
                                                </Button>
                                            </PopoverTrigger>
                                            <PopoverContent className="w-auto p-0" align="start">
                                                <Calendar
                                                    mode="single"
                                                    captionLayout="dropdown"
                                                    selected={leaveDate}
                                                    onSelect={(date) => {
                                                        setLeaveDate(date)
                                                        field.onChange(date ? format(date, "yyyy-MM-dd") : "")
                                                    }}
                                                    defaultMonth={leaveDate}
                                                />
                                            </PopoverContent>
                                        </Popover>
                                        {fieldState.invalid && (
                                            <FieldError errors={[fieldState.error]} />
                                        )}
                                        <FieldDescription>
                                            Enter first and last name
                                        </FieldDescription>
                                    </Field>
                                )}
                            />}
                        </FieldGroup>
                    </form>
                </CardContent>
                <CardFooter>
                    <Field orientation="horizontal">
                        <Button type="button" variant="outline" onClick={handleReset} disabled={isSubmitting}>
                            Reset
                        </Button>
                        <Button type="submit" form="add-member" disabled={isSubmitting}>
                            {isSubmitting
                                ? (isEditMode ? "Updating..." : "Adding...")
                                : (isEditMode ? "Update Member" : "Add Member")
                            }
                        </Button>
                    </Field>
                </CardFooter>
            </Card>

            {
                bgAlerts.length > 0 && typeof document !== "undefined" && createPortal(
                    <div className="fixed bottom-4 right-4 z-[200] flex flex-col gap-2 max-w-sm pointer-events-none">
                        {bgAlerts.map(alert => (
                            <div key={alert.id} className="pointer-events-auto">
                                <Alert
                                    variant={alert.type === "error" ? "destructive" : "default"}
                                    className={`shadow-lg ${alert.type === "success" ? "border-l-4 border-l-green-500" : "border-l-4"}`}
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
                        ))}
                    </div>,
                    document.body
                )
            }
        </>
    )
}

