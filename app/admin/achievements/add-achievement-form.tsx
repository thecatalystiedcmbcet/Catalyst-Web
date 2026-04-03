"use client"

import * as React from "react"
import { postActionLog } from "@/lib/utils/action-log"
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
import { ChevronDownIcon, X, Layers, Star, Pencil, Lock, Unlock } from "lucide-react"
import {
    DropdownMenu,
    DropdownMenuCheckboxItem,
    DropdownMenuContent,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import * as z from "zod"
import { sanitizeFormData, buildSanitizeRules, FORM_FIELDS, enforceTitleChars, containsDangerousContent } from "@/lib/utils/form-safety"
import { Button } from "@/components/ui/button"
import {
    Card,
    CardContent,
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
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { CheckCircle2, XCircle } from "lucide-react"
import { Organization } from "@/app/admin/members/types"
import { Achievement } from "@/app/admin/achievements/columns"

const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5 MB

const formSchema = z.object({
    title: z.string()
        .refine(v => !FORM_FIELDS.achievement.title.required || v.trim().length > 0, { message: "Required" })
        .refine(v => !containsDangerousContent(v), { message: "Invalid characters detected" })
        .refine(v => v.trim().length === 0 || v.trim().length >= 2, { message: "Title must be at least 2 characters." }),
    subtitle: z.string().optional()
        .refine(v => !FORM_FIELDS.achievement.subtitle.required || (v && v.trim().length > 0), { message: "Required" })
        .refine(v => !containsDangerousContent(v), { message: "Invalid characters detected" })
        .refine(v => !v || v.trim().length <= 255, { message: "Subtitle must be at most 255 characters." }),
    description: z.string().optional()
        .refine(v => !FORM_FIELDS.achievement.description.required || (v && v.trim().length > 0), { message: "Required" })
        .refine(v => !containsDangerousContent(v), { message: "Invalid characters detected" })
        .refine(v => !v || v.trim().length <= 2000, { message: "Description must be at most 2000 characters." }),
    cover_image: z.any().optional().refine(v => !FORM_FIELDS.achievement.cover_image.required || v, { message: "Required" }),
    related_images: z.any().optional(), // FileList-like, handled separately
    is_featured: z.enum(["true", "false"]),
    org: z.string().optional()
        .refine(v => !FORM_FIELDS.achievement.org.required || (v && v.trim().length > 0), { message: "Required" })
        .refine(v => !containsDangerousContent(v), { message: "Invalid characters detected" }),
    date: z.string().optional().refine(v => !FORM_FIELDS.achievement.date.required || (v && v.trim().length > 0), { message: "Required" }),
})

type FormValues = z.infer<typeof formSchema>

interface AddAchievementFormProps {
    organizations: Organization[]
    onSubmitSuccess?: () => void
    onBackgroundPost?: (promise: Promise<void>) => void
    initialData?: Achievement
    achievementId?: string
}

export default function AddAchievementForm({
    organizations,
    onSubmitSuccess,
    onBackgroundPost,
    initialData,
    achievementId,
}: AddAchievementFormProps) {
    const isEditMode = !!achievementId && !!initialData
    const [isLocked, setIsLocked] = React.useState(isEditMode) // locked = read-only
    const [isSubmitting, setIsSubmitting] = React.useState(false)
    const [addMultiple, setAddMultiple] = React.useState(false)

    // Floating background-submit alerts
    type BgAlert = { id: number; type: "success" | "error"; message: string }
    const [bgAlerts, setBgAlerts] = React.useState<BgAlert[]>([])
    const alertCounterRef = React.useRef(0)

    const pushAlert = React.useCallback((type: "success" | "error", message: string) => {
        const id = ++alertCounterRef.current
        setBgAlerts(prev => [...prev, { id, type, message }])
        setTimeout(() => setBgAlerts(prev => prev.filter(a => a.id !== id)), 4000)
    }, [])

    // Cover image
    const [coverPreview, setCoverPreview] = React.useState<string>("")
    const [coverError, setCoverError] = React.useState<string>("")
    const coverInputRef = React.useRef<HTMLInputElement>(null)

    // Related images (multiple)
    const [relatedFiles, setRelatedFiles] = React.useState<File[]>([])
    const [relatedPreviews, setRelatedPreviews] = React.useState<string[]>([])
    // Existing related_image URL(s) from server (edit mode) — shown separately from new uploads
    const toUrlArray = (v: string | string[] | null | undefined): string[] =>
        !v ? [] : Array.isArray(v) ? v : [v]
    const [existingRelatedUrls, setExistingRelatedUrls] = React.useState<string[]>(
        toUrlArray(initialData?.related_image)
    )
    const [relatedError, setRelatedError] = React.useState<string>("")
    const relatedInputRef = React.useRef<HTMLInputElement>(null)

    // Date
    const [achievementDate, setAchievementDate] = React.useState<Date | undefined>()

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            title: initialData?.title ?? "",
            subtitle: initialData?.subtitle ?? "",
            description: "",
            is_featured: initialData ? (initialData.is_featured ? "true" : "false") : "false",
            org: "",
            date: initialData?.date ?? "",
        },
    })

    // Seed date picker and cover preview from initialData on first render
    React.useEffect(() => {
        if (initialData?.date) {
            setAchievementDate(new Date(initialData.date))
        }
        if (initialData?.cover_image) {
            setCoverPreview(initialData.cover_image)
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    const handleCoverChange = (e: React.ChangeEvent<HTMLInputElement>, fieldOnChange: (v: any) => void) => {
        const file = e.target.files?.[0]
        if (!file) return
        if (file.size > MAX_FILE_SIZE) {
            setCoverError("File size must not exceed 5 MB")
            setCoverPreview("")
            fieldOnChange(null)
            e.target.value = ""
            return
        }
        setCoverError("")
        const reader = new FileReader()
        reader.onloadend = () => setCoverPreview(reader.result as string)
        reader.readAsDataURL(file)
        fieldOnChange(file)
    }

    const handleRelatedChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files ?? [])
        const oversized = files.filter(f => f.size > MAX_FILE_SIZE)
        if (oversized.length > 0) {
            setRelatedError(`${oversized.length} file(s) exceed 5 MB and were skipped`)
        } else {
            setRelatedError("")
        }
        const valid = files.filter(f => f.size <= MAX_FILE_SIZE)
        setRelatedFiles(prev => [...prev, ...valid])
        valid.forEach(file => {
            const reader = new FileReader()
            reader.onloadend = () =>
                setRelatedPreviews(prev => [...prev, reader.result as string])
            reader.readAsDataURL(file)
        })
        // reset input so the same file can be added again if needed
        e.target.value = ""
    }

    const removeRelatedImage = (index: number) => {
        setRelatedFiles(prev => prev.filter((_, i) => i !== index))
        setRelatedPreviews(prev => prev.filter((_, i) => i !== index))
    }

    function resetFormState() {
        form.reset()
        setCoverPreview("")
        setCoverError("")
        if (coverInputRef.current) coverInputRef.current.value = ""
        setRelatedFiles([])
        setRelatedPreviews([])
        setExistingRelatedUrls([])
        if (relatedInputRef.current) relatedInputRef.current.value = ""
        setAchievementDate(undefined)
    }

    async function postAchievement(data: FormValues, files: File[]): Promise<void> {
        const formData = new FormData()
        formData.append("title", data.title)
        if (data.subtitle) formData.append("subtitle", data.subtitle)
        if (data.description) formData.append("description", data.description)
        formData.append("is_featured", data.is_featured)
        if (data.org) formData.append("org", data.org)
        if (data.date) formData.append("date", data.date)
        if (data.cover_image instanceof File) formData.append("cover_image", data.cover_image)
        files.forEach(f => formData.append("related_image", f))

        const res = await fetch("/api/v1/achievements", { method: "POST", credentials: "include", body: formData })
        if (!res.ok) {
            const result = await res.json().catch(() => ({}))
            throw new Error(result.error ?? result.message ?? "Failed to add achievement")
        }
    }

    async function patchAchievement(data: FormValues, files: File[]): Promise<void> {
        const formData = new FormData()
        formData.append("title", data.title)
        formData.append("subtitle", data.subtitle ?? "")
        formData.append("description", data.description ?? "")
        formData.append("is_featured", data.is_featured)
        formData.append("org", data.org ?? "")
        formData.append("date", data.date ?? "")
        if (data.cover_image instanceof File) formData.append("cover_image", data.cover_image)
        files.forEach(f => formData.append("related_image", f))

        const res = await fetch(`/api/v1/achievements/${achievementId}`, { method: "PATCH", credentials: "include", body: formData })
        if (!res.ok) {
            const result = await res.json().catch(() => ({}))
            throw new Error(result.details ?? result.error ?? result.message ?? "Failed to update achievement")
        }
    }

    function buildAchievementDetails(data: FormValues) {
        return [
            `Title: ${data.title}`,
            data.subtitle ? `Subtitle: ${data.subtitle}` : null,
            data.date ? `Date: ${data.date}` : null,
            data.is_featured !== undefined ? `Featured: ${data.is_featured ? "Yes" : "No"}` : null,
            data.org ? `Organization: ${data.org}` : null,
        ].filter(Boolean).join(" | ")
    }

    async function onSubmit(rawData: FormValues) {
        if (FORM_FIELDS.achievement.related_images.required && relatedFiles.length === 0) {
            setRelatedError("Required")
            return
        }
        const data = sanitizeFormData(rawData, buildSanitizeRules(FORM_FIELDS.achievement))
        if (isEditMode) {
            setIsSubmitting(true)
            try {
                await patchAchievement(data, relatedFiles)
                postActionLog({
                    action: "Updated Achievement",
                    entity_type: "achievement",
                    entity_name: `Updated achievement "${data.title}"`,
                    status: "success",
                    details: buildAchievementDetails(data),
                })
                setIsLocked(true)
                onSubmitSuccess?.()
            } catch (err: any) {
                console.error("Error updating achievement:", err)
                postActionLog({
                    action: "Updated Achievement",
                    entity_type: "achievement",
                    entity_name: `Failed to update achievement "${data.title}"`,
                    status: "error",
                    details: err.message ?? "Failed to update achievement",
                })
                pushAlert("error", err.message ?? "Failed to update achievement")
            } finally {
                setIsSubmitting(false)
            }
            return
        }

        if (addMultiple) {
            // Snapshot files before reset
            const fileSnapshot = [...relatedFiles]
            const coverSnapshot = data.cover_image instanceof File ? data.cover_image : null
            const dataSnapshot = { ...data }
            // Reset immediately
            resetFormState()
            // Fire in background
            const promise = postAchievement(
                { ...dataSnapshot, cover_image: coverSnapshot },
                fileSnapshot
            )
                .then(() => {
                    postActionLog({
                        action: "Created Achievement",
                        entity_type: "achievement",
                        entity_name: `Created achievement "${dataSnapshot.title}"`,
                        status: "success",
                        details: buildAchievementDetails(dataSnapshot),
                    })
                    pushAlert("success", `"${dataSnapshot.title}" added successfully`)
                })
                .catch(err => {
                    postActionLog({
                        action: "Created Achievement",
                        entity_type: "achievement",
                        entity_name: `Failed to create achievement "${dataSnapshot.title}"`,
                        status: "error",
                        details: err.message ?? "Failed to add achievement",
                    })
                    pushAlert("error", err.message ?? "Failed to add achievement")
                })
            onBackgroundPost?.(promise)
        } else {
            setIsSubmitting(true)
            try {
                await postAchievement(data, relatedFiles)
                postActionLog({
                    action: "Created Achievement",
                    entity_type: "achievement",
                    entity_name: `Created achievement "${data.title}"`,
                    status: "success",
                    details: buildAchievementDetails(data),
                })
                resetFormState()
                onSubmitSuccess?.()
            } catch (err: any) {
                console.error("Error adding achievement:", err)
                postActionLog({
                    action: "Created Achievement",
                    entity_type: "achievement",
                    entity_name: `Failed to create achievement "${data.title}"`,
                    status: "error",
                    details: err.message ?? "Failed to add achievement",
                })
                pushAlert("error", err.message ?? "Failed to add achievement")
            } finally {
                setIsSubmitting(false)
            }
        }
    }

    function handleReset() {
        if (isEditMode && initialData) {
            // Revert to original values
            form.reset({
                title: initialData.title ?? "",
                subtitle: initialData.subtitle ?? "",
                description: "",
                is_featured: initialData.is_featured ? "true" : "false",
                org: "",
                date: initialData.date ?? "",
            })
            if (initialData.date) setAchievementDate(new Date(initialData.date))
            else setAchievementDate(undefined)
            if (initialData.cover_image) setCoverPreview(initialData.cover_image)
            else setCoverPreview("")
            if (coverInputRef.current) coverInputRef.current.value = ""
            setCoverError("")
            setRelatedFiles([])
            setRelatedPreviews([])
            setExistingRelatedUrls(toUrlArray(initialData.related_image))
            if (relatedInputRef.current) relatedInputRef.current.value = ""
            setRelatedError("")
            setIsLocked(true)
        } else {
            resetFormState()
            setRelatedError("")
        }
    }

    return (
        <Card className="w-full sm:max-w-md">
            <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>{isEditMode ? "Achievement Details" : "Add Achievement"}</CardTitle>
                {isEditMode && (
                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setIsLocked(v => !v)}
                        className="gap-1.5"
                    >
                        {isLocked
                            ? <><Unlock className="h-3.5 w-3.5" /> Edit</>
                            : <><Lock className="h-3.5 w-3.5" /> Lock</>
                        }
                    </Button>
                )}
            </CardHeader>
            <CardContent>
                <form id="add-achievement" onSubmit={form.handleSubmit(onSubmit)}>
                    <FieldGroup>

                        {/* Title */}
                        {FORM_FIELDS.achievement.title.enabled && <Controller
                            name="title"
                            control={form.control}
                            render={({ field, fieldState }) => (
                                <Field data-invalid={fieldState.invalid}>
                                    <FieldLabel htmlFor="ach-title">Title {FORM_FIELDS.achievement.title.required && <span className="text-destructive">*</span>}</FieldLabel>
                                        <Input
                                            {...field}
                                            onChange={(e) => field.onChange(enforceTitleChars(e.target.value))}
                                            id="ach-title"
                                            placeholder="Achievement title"
                                            autoComplete="off"
                                            aria-invalid={fieldState.invalid}
                                            disabled={isLocked}
                                            maxLength={FORM_FIELDS.achievement.title.maxLength}
                                        />
                                    {fieldState.invalid && (
                                        <FieldError errors={[fieldState.error]} />
                                    )}
                                </Field>
                            )}
                        />}

                        {/* Subtitle */}
                        {FORM_FIELDS.achievement.subtitle.enabled && <Controller
                            name="subtitle"
                            control={form.control}
                            render={({ field, fieldState }) => (
                                <Field data-invalid={fieldState.invalid}>
                                    <FieldLabel htmlFor="ach-subtitle">Subtitle {FORM_FIELDS.achievement.subtitle.required && <span className="text-destructive">*</span>}</FieldLabel>
                                        <Input
                                            {...field}
                                            onChange={(e) => field.onChange(enforceTitleChars(e.target.value))}
                                            id="ach-subtitle"
                                            placeholder="Short description (optional)"
                                            autoComplete="off"
                                            aria-invalid={fieldState.invalid}
                                            disabled={isLocked}
                                            maxLength={FORM_FIELDS.achievement.subtitle.maxLength}
                                        />
                                    {fieldState.invalid && (
                                        <FieldError errors={[fieldState.error]} />
                                    )}
                                </Field>
                            )}
                        />}

                        {/* Description */}
                        {FORM_FIELDS.achievement.description.enabled && <Controller
                            name="description"
                            control={form.control}
                            render={({ field, fieldState }) => (
                                <Field data-invalid={fieldState.invalid}>
                                    <FieldLabel htmlFor="ach-description">Description {FORM_FIELDS.achievement.description.required && <span className="text-destructive">*</span>}</FieldLabel>
                                    <Textarea
                                        {...field}
                                        id="ach-description"
                                        placeholder="Full description of the achievement…"
                                        rows={5}
                                        className="resize-y"
                                        aria-invalid={fieldState.invalid}
                                        disabled={isLocked}
                                        maxLength={FORM_FIELDS.achievement.description.maxLength}
                                    />
                                    {fieldState.invalid && (
                                        <FieldError errors={[fieldState.error]} />
                                    )}
                                    <FieldDescription>Max 2000 characters</FieldDescription>
                                </Field>
                            )}
                        />}

                        {/* Cover Image */}
                        {FORM_FIELDS.achievement.cover_image.enabled && <Controller
                            name="cover_image"
                            control={form.control}
                            render={({ field, fieldState }) => (
                                <Field data-invalid={fieldState.invalid || !!coverError}>
                                    <FieldLabel htmlFor="ach-cover">Cover Image {FORM_FIELDS.achievement.cover_image.required && <span className="text-destructive">*</span>}</FieldLabel>
                                    <Input
                                        id="ach-cover"
                                        type="file"
                                        accept="image/*"
                                        aria-invalid={fieldState.invalid || !!coverError}
                                        onChange={e => handleCoverChange(e, field.onChange)}
                                        disabled={isLocked}
                                        ref={coverInputRef}
                                    />
                                    {coverPreview && (
                                        <div className="mt-2">
                                            <img
                                                src={coverPreview}
                                                alt="Cover preview"
                                                className="w-24 h-24 object-cover rounded-md border"
                                            />
                                        </div>
                                    )}
                                    {coverError && (
                                        <p className="text-sm text-destructive">{coverError}</p>
                                    )}
                                    <FieldDescription>Max size: 5 MB</FieldDescription>
                                </Field>
                            )}
                        />}

                        {/* Related Images (multiple) */}
                        {FORM_FIELDS.achievement.related_images.enabled && <Field>
                            <FieldLabel htmlFor="ach-related">Related Images {FORM_FIELDS.achievement.related_images.required && <span className="text-destructive">*</span>}</FieldLabel>
                            <Input
                                id="ach-related"
                                type="file"
                                accept="image/*"
                                multiple
                                onChange={handleRelatedChange}
                                disabled={isLocked}
                                ref={relatedInputRef}
                            />
                            {/* Existing related images from server (edit mode) */}
                            {existingRelatedUrls.length > 0 && (
                                <div className="mt-2 flex flex-wrap gap-2">
                                    {existingRelatedUrls.map((url, i) => (
                                        <div key={i} className="relative group">
                                            <img
                                                src={url}
                                                alt={`Existing related image ${i + 1}`}
                                                className="w-16 h-16 object-cover rounded-md border"
                                            />
                                            {!isLocked && (
                                                <button
                                                    type="button"
                                                    onClick={() => setExistingRelatedUrls(prev => prev.filter((_, idx) => idx !== i))}
                                                    className="absolute -top-1 -right-1 bg-destructive text-destructive-foreground rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                                                >
                                                    <X className="h-3 w-3" />
                                                </button>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                            {relatedPreviews.length > 0 && (
                                <div className="mt-2 flex flex-wrap gap-2">
                                    {relatedPreviews.map((src, i) => (
                                        <div key={i} className="relative group">
                                            <img
                                                src={src}
                                                alt={`Related ${i + 1}`}
                                                className="w-16 h-16 object-cover rounded-md border"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => removeRelatedImage(i)}
                                                className="absolute -top-1 -right-1 bg-destructive text-destructive-foreground rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                                            >
                                                <X className="h-3 w-3" />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                            {relatedError && (
                                <p className="text-sm text-destructive">{relatedError}</p>
                            )}
                            <FieldDescription>
                                Select one or more images. Max 5 MB each.
                            </FieldDescription>
                        </Field>}

                        {/* Is Featured */}
                        {FORM_FIELDS.achievement.is_featured.enabled && <Controller
                            name="is_featured"
                            control={form.control}
                            render={({ field }) => (
                                <Field>
                                    <div className="flex w-full items-center justify-between rounded-md border px-3 py-2 text-sm">
                                        <label
                                            htmlFor="is-featured-toggle"
                                            className="flex items-center gap-2 cursor-pointer select-none"
                                        >
                                            <Star className="h-4 w-4 text-muted-foreground" />
                                            <span>Featured</span>
                                            <span className="text-xs text-muted-foreground">
                                                {field.value === "true" ? "Shows on homepage" : "Not highlighted"}
                                            </span>
                                        </label>
                                        <button
                                            id="is-featured-toggle"
                                            type="button"
                                            role="switch"
                                            aria-checked={field.value === "true"}
                                            disabled={isLocked}
                                            onClick={() => field.onChange(field.value === "true" ? "false" : "true")}
                                            className={`relative inline-flex h-5 w-9 shrink-0 rounded-full border-2 border-transparent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${isLocked ? "opacity-50 cursor-not-allowed" : "cursor-pointer"} ${field.value === "true" ? "bg-primary" : "bg-input"
                                                }`}
                                        >
                                            <span
                                                className={`pointer-events-none block h-4 w-4 rounded-full bg-background shadow-lg ring-0 transition-transform ${field.value === "true" ? "translate-x-4" : "translate-x-0"
                                                    }`}
                                            />
                                        </button>
                                    </div>
                                </Field>
                            )}
                        />}

                        {/* Organisation */}
                        {FORM_FIELDS.achievement.org.enabled && <Controller
                            name="org"
                            control={form.control}
                            render={({ field, fieldState }) => (
                                <Field data-invalid={fieldState.invalid}>
                                    <FieldLabel htmlFor="ach-org">Organisation {FORM_FIELDS.achievement.org.required && <span className="text-destructive">*</span>}</FieldLabel>
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button
                                                variant="outline"
                                                className="w-full justify-between"
                                                type="button"
                                                disabled={isLocked}
                                            >
                                                <span className={field.value ? "" : "text-muted-foreground"}>
                                                    {field.value
                                                        ? (organizations.find(o => o.$id === field.value)?.name ?? "Select organisation")
                                                        : "Select organisation"}
                                                </span>
                                                <ChevronDownIcon className="h-4 w-4 opacity-50" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent className="w-56 max-h-64 overflow-y-auto">
                                            {organizations.map(org => (
                                                <DropdownMenuCheckboxItem
                                                    key={org.$id}
                                                    checked={field.value === org.$id}
                                                    onCheckedChange={() =>
                                                        field.onChange(field.value === org.$id ? "" : org.$id)
                                                    }
                                                >
                                                    {org.name}
                                                </DropdownMenuCheckboxItem>
                                            ))}
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                    {field.value && (
                                        <div className="flex flex-wrap gap-2 mt-2">
                                            <Badge
                                                variant="secondary"
                                                className="flex items-center gap-1 pl-2 pr-1 py-1"
                                            >
                                                {organizations.find(o => o.$id === field.value)?.name}
                                                <button
                                                    type="button"
                                                    onClick={() => field.onChange("")}
                                                    className="ml-1 hover:bg-secondary-foreground/20 rounded-full p-0.5"
                                                >
                                                    <X className="h-3 w-3" />
                                                </button>
                                            </Badge>
                                        </div>
                                    )}
                                    <FieldDescription>Select the associated organisation</FieldDescription>
                                </Field>
                            )}
                        />}

                        {/* Date */}
                        {FORM_FIELDS.achievement.date.enabled && <Controller
                            name="date"
                            control={form.control}
                            render={({ field, fieldState }) => (
                                <Field data-invalid={fieldState.invalid}>
                                    <FieldLabel>Achievement Date {FORM_FIELDS.achievement.date.required && <span className="text-destructive">*</span>}</FieldLabel>
                                    <Popover>
                                        <PopoverTrigger asChild>
                                            <Button
                                                variant="outline"
                                                data-empty={!achievementDate}
                                                disabled={isLocked}
                                                className="data-[empty=true]:text-muted-foreground w-[212px] justify-between text-left font-normal"
                                            >
                                                {achievementDate ? format(achievementDate, "PPP") : <span>Pick a date</span>}
                                                <ChevronDownIcon data-icon="inline-end" />
                                            </Button>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-auto p-0" align="start">
                                            <Calendar
                                                mode="single"
                                                captionLayout="dropdown"
                                                selected={achievementDate}
                                                onSelect={date => {
                                                    setAchievementDate(date)
                                                    field.onChange(date ? format(date, "yyyy-MM-dd") : "")
                                                }}
                                                defaultMonth={achievementDate}
                                            />
                                        </PopoverContent>
                                    </Popover>
                                    {fieldState.invalid && (
                                        <FieldError errors={[fieldState.error]} />
                                    )}
                                </Field>
                            )}
                        />}

                    </FieldGroup>
                </form>
            </CardContent>
            <CardFooter className="flex flex-col gap-3">
                {/* Add Multiple toggle — only in add mode */}
                {!isEditMode && (
                    <div className="flex w-full items-center justify-between rounded-md border px-3 py-2 text-sm">
                        <label
                            htmlFor="add-multiple-toggle"
                            className="flex items-center gap-2 cursor-pointer select-none"
                        >
                            <Layers className="h-4 w-4 text-muted-foreground" />
                            <span>Add multiple</span>
                        </label>
                        {/* Simple toggle switch */}
                        <button
                            id="add-multiple-toggle"
                            type="button"
                            role="switch"
                            aria-checked={addMultiple}
                            onClick={() => setAddMultiple(v => !v)}
                            className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${addMultiple ? "bg-primary" : "bg-input"
                                }`}
                        >
                            <span
                                className={`pointer-events-none block h-4 w-4 rounded-full bg-background shadow-lg ring-0 transition-transform ${addMultiple ? "translate-x-4" : "translate-x-0"
                                    }`}
                            />
                        </button>
                    </div>
                )}

                <Field orientation="horizontal" className="w-full">
                    <Button type="button" variant="outline" onClick={handleReset} disabled={isSubmitting}>
                        {isEditMode ? "Revert" : "Reset"}
                    </Button>
                    <Button type="submit" form="add-achievement" disabled={isSubmitting || isLocked}>
                        {isSubmitting
                            ? (isEditMode ? "Saving..." : "Adding...")
                            : isEditMode
                                ? "Save Changes"
                                : addMultiple ? "Add & Continue" : "Add Achievement"
                        }
                    </Button>
                </Field>
            </CardFooter>

            {/* Floating background-submit alerts — portalled to body to escape drawer stacking context */}
            {bgAlerts.length > 0 && typeof document !== "undefined" && createPortal(
                <div className="fixed bottom-4 right-4 z-[200] flex flex-col gap-2 max-w-sm pointer-events-none">
                    {bgAlerts.map(alert => (
                        <div key={alert.id} className="pointer-events-auto">
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
                    ))}
                </div>,
                document.body
            )}
        </Card>
    )
}
