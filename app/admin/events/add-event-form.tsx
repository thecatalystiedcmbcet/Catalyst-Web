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
import { ChevronDownIcon, X, Layers, Star, Lock, Unlock } from "lucide-react"
import {
    DropdownMenu,
    DropdownMenuCheckboxItem,
    DropdownMenuContent,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import * as z from "zod"
import { sanitizeFormData, buildSanitizeRules, FORM_FIELDS, URL_REGEX, enforceNoSpaces, enforceTitleChars, containsDangerousContent } from "@/lib/utils/form-safety"
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
import { Event } from "@/app/admin/events/columns"

const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5 MB

const STATUS_OPTIONS = [
    { value: "upcoming", label: "Upcoming" },
    { value: "open", label: "Open" },
    { value: "closed", label: "Closed" },
]

const formSchema = z.object({
    title: z.string()
        .refine(v => !FORM_FIELDS.event.title.required || v.trim().length > 0, { message: "Required" })
        .refine(v => v.trim().length === 0 || !/^\d+$/.test(v.trim()), { message: "Title cannot be only numbers" })
        .refine(v => !containsDangerousContent(v), { message: "Invalid characters detected" })
        .refine(v => v.trim().length === 0 || v.trim().length >= 2, { message: "Title must be at least 2 characters." }),
    subtitle: z.string().optional()
        .refine(v => !FORM_FIELDS.event.subtitle.required || (v && v.trim().length > 0), { message: "Required" })
        .refine(v => !containsDangerousContent(v), { message: "Invalid characters detected" })
        .refine(v => !v || v.trim().length <= 255, { message: "Subtitle must be at most 255 characters." }),
    description: z.string().optional()
        .refine(v => !FORM_FIELDS.event.description.required || (v && v.trim().length > 0), { message: "Required" })
        .refine(v => !containsDangerousContent(v), { message: "Invalid characters detected" })
        .refine(v => !v || v.trim().length <= 2000, { message: "Description must be at most 2000 characters." }),
    cover_image: z.any().optional().refine(v => !FORM_FIELDS.event.cover_image.required || v, { message: "Required" }),
    related_images: z.any().optional(),
    start_date: z.string().optional().refine(v => !FORM_FIELDS.event.start_date.required || (v && v.trim().length > 0), { message: "Required" }),
    end_date: z.string().optional().refine(v => !FORM_FIELDS.event.end_date.required || (v && v.trim().length > 0), { message: "Required" }),
    register_link: z
        .string()
        .optional()
        .refine((v) => !FORM_FIELDS.event.register_link.required || (v && v.trim().length > 0), { message: "Required" })
        .refine(v => !containsDangerousContent(v), { message: "Invalid characters detected" })
        .refine((v) => !v || URL_REGEX.test(v), { message: "Enter valid url" }),
    status: z.string().optional().refine(v => !FORM_FIELDS.event.status.required || (v && v.trim().length > 0), { message: "Required" }),
    is_featured: z.enum(["true", "false"]),
})

type FormValues = z.infer<typeof formSchema>

interface AddEventFormProps {
    onSubmitSuccess?: () => void
    onBackgroundPost?: (promise: Promise<void>) => void
    initialData?: Event
    eventId?: string
}

export default function AddEventForm({
    onSubmitSuccess,
    onBackgroundPost,
    initialData,
    eventId,
}: AddEventFormProps) {
    const isEditMode = !!eventId && !!initialData
    const [isLocked, setIsLocked] = React.useState(isEditMode)
    const [isSubmitting, setIsSubmitting] = React.useState(false)
    const [addMultiple, setAddMultiple] = React.useState(false)

    // Floating background alerts
    type BgAlert = { id: number; type: "success" | "error"; message: string }
    const [bgAlerts, setBgAlerts] = React.useState<BgAlert[]>([])
    const alertCounterRef = React.useRef(0)

    const pushAlert = React.useCallback((type: "success" | "error", message: string) => {
        const id = ++alertCounterRef.current
        setBgAlerts((prev) => [...prev, { id, type, message }])
        setTimeout(() => setBgAlerts((prev) => prev.filter((a) => a.id !== id)), 4000)
    }, [])

    // Cover image
    const [coverPreview, setCoverPreview] = React.useState<string>("")
    const [coverError, setCoverError] = React.useState<string>("")
    const coverInputRef = React.useRef<HTMLInputElement>(null)

    // Related images
    const [relatedFiles, setRelatedFiles] = React.useState<File[]>([])
    const [relatedPreviews, setRelatedPreviews] = React.useState<string[]>([])
    const [relatedError, setRelatedError] = React.useState<string>("")
    const relatedInputRef = React.useRef<HTMLInputElement>(null)

    // Date pickers
    const [startDate, setStartDate] = React.useState<Date | undefined>()
    const [endDate, setEndDate] = React.useState<Date | undefined>()

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            title: initialData?.title ?? "",
            subtitle: initialData?.subtitle ?? "",
            description: "",
            start_date: initialData?.start_date ?? "",
            end_date: initialData?.end_date ?? "",
            register_link: initialData?.register_link ?? "",
            status: initialData?.status ?? "",
            is_featured: initialData ? (initialData.is_featured ? "true" : "false") : "false",
        },
    })

    // Seed from initialData on first render
    React.useEffect(() => {
        if (initialData?.start_date) setStartDate(new Date(initialData.start_date))
        if (initialData?.end_date) setEndDate(new Date(initialData.end_date))
        if (initialData?.cover_image) setCoverPreview(initialData.cover_image)
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    const handleCoverChange = (
        e: React.ChangeEvent<HTMLInputElement>,
        fieldOnChange: (v: any) => void
    ) => {
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
        const oversized = files.filter((f) => f.size > MAX_FILE_SIZE)
        if (oversized.length > 0) {
            setRelatedError(`${oversized.length} file(s) exceed 5 MB and were skipped`)
        } else {
            setRelatedError("")
        }
        const valid = files.filter((f) => f.size <= MAX_FILE_SIZE)
        setRelatedFiles((prev) => [...prev, ...valid])
        valid.forEach((file) => {
            const reader = new FileReader()
            reader.onloadend = () =>
                setRelatedPreviews((prev) => [...prev, reader.result as string])
            reader.readAsDataURL(file)
        })
        e.target.value = ""
    }

    const removeRelatedImage = (index: number) => {
        setRelatedFiles((prev) => prev.filter((_, i) => i !== index))
        setRelatedPreviews((prev) => prev.filter((_, i) => i !== index))
    }

    function resetFormState() {
        form.reset()
        setCoverPreview("")
        setCoverError("")
        if (coverInputRef.current) coverInputRef.current.value = ""
        setRelatedFiles([])
        setRelatedPreviews([])
        if (relatedInputRef.current) relatedInputRef.current.value = ""
        setStartDate(undefined)
        setEndDate(undefined)
        setRelatedError("")
    }

    function toISO(dateStr: string | undefined): string {
        if (!dateStr) return ""
        const d = new Date(dateStr)
        if (isNaN(d.getTime())) return ""
        return d.toISOString()  // always "YYYY-MM-DDTHH:mm:ss.sssZ"
    }

    async function postEvent(data: FormValues, files: File[]): Promise<void> {
        const formData = new FormData()
        formData.append("title", data.title)
        if (data.subtitle) formData.append("subtitle", data.subtitle)
        if (data.description) formData.append("description", data.description)
        formData.append("is_featured", data.is_featured)
        if (data.start_date) formData.append("start_date", toISO(data.start_date))
        if (data.end_date) formData.append("end_date", toISO(data.end_date))
        if (data.register_link) formData.append("register_link", data.register_link)
        if (data.status) formData.append("status", data.status)
        if (data.cover_image instanceof File) formData.append("cover_image", data.cover_image)
        files.forEach((f) => formData.append("related_images", f))

        const res = await fetch("/api/v1/events", {
            method: "POST",
            credentials: "include",
            body: formData,
        })
        if (!res.ok) {
            const result = await res.json().catch(() => ({}))
            throw new Error(result.error ?? result.message ?? "Failed to add event")
        }
    }

    async function patchEvent(data: FormValues, files: File[]): Promise<void> {
        const formData = new FormData()
        formData.append("title", data.title)
        formData.append("subtitle", data.subtitle ?? "")
        formData.append("description", data.description ?? "")
        formData.append("is_featured", data.is_featured)
        if (data.start_date) formData.append("start_date", toISO(data.start_date))
        if (data.end_date) formData.append("end_date", toISO(data.end_date))
        formData.append("register_link", data.register_link ?? "")
        formData.append("status", data.status ?? "")
        if (data.cover_image instanceof File) formData.append("cover_image", data.cover_image)
        files.forEach((f) => formData.append("related_images", f))

        const res = await fetch(`/api/v1/events/${eventId}`, {
            method: "PATCH",
            credentials: "include",
            body: formData,
        })
        if (!res.ok) {
            const result = await res.json().catch(() => ({}))
            throw new Error(result.details ?? result.error ?? result.message ?? "Failed to update event")
        }
    }

    function buildEventDetails(data: FormValues) {
        return [
            `Title: ${data.title}`,
            data.subtitle ? `Subtitle: ${data.subtitle}` : null,
            data.status ? `Status: ${data.status}` : null,
            data.start_date ? `Start: ${data.start_date}` : null,
            data.end_date ? `End: ${data.end_date}` : null,
            data.is_featured !== undefined ? `Featured: ${data.is_featured ? "Yes" : "No"}` : null,
            data.register_link ? `Registration URL: ${data.register_link}` : null,
        ].filter(Boolean).join(" | ")
    }

    async function onSubmit(rawData: FormValues) {
        if (FORM_FIELDS.event.related_images.required && relatedFiles.length === 0) {
            setRelatedError("Required")
            return
        }
        const data = sanitizeFormData(rawData, buildSanitizeRules(FORM_FIELDS.event))
        if (isEditMode) {
            setIsSubmitting(true)
            try {
                await patchEvent(data, relatedFiles)
                postActionLog({
                    action: "Updated Event",
                    entity_type: "event",
                    entity_name: `Updated event "${data.title}"`,
                    status: "success",
                    details: buildEventDetails(data),
                })
                setIsLocked(true)
                onSubmitSuccess?.()
            } catch (err: any) {
                postActionLog({
                    action: "Updated Event",
                    entity_type: "event",
                    entity_name: `Failed to update event "${data.title}"`,
                    status: "error",
                    details: err.message ?? "Failed to update event",
                })
                pushAlert("error", err.message ?? "Failed to update event")
            } finally {
                setIsSubmitting(false)
            }
            return
        }

        if (addMultiple) {
            const fileSnapshot = [...relatedFiles]
            const coverSnapshot = data.cover_image instanceof File ? data.cover_image : null
            const dataSnapshot = { ...data }
            resetFormState()
            const promise = postEvent({ ...dataSnapshot, cover_image: coverSnapshot }, fileSnapshot)
                .then(() => {
                    postActionLog({
                        action: "Created Event",
                        entity_type: "event",
                        entity_name: `Created event "${dataSnapshot.title}"`,
                        status: "success",
                        details: buildEventDetails(dataSnapshot),
                    })
                    pushAlert("success", `"${dataSnapshot.title}" added successfully`)
                })
                .catch((err) => {
                    postActionLog({
                        action: "Created Event",
                        entity_type: "event",
                        entity_name: `Failed to create event "${dataSnapshot.title}"`,
                        status: "error",
                        details: err.message ?? "Failed to add event",
                    })
                    pushAlert("error", err.message ?? "Failed to add event")
                })
            onBackgroundPost?.(promise)
        } else {
            setIsSubmitting(true)
            try {
                await postEvent(data, relatedFiles)
                postActionLog({
                    action: "Created Event",
                    entity_type: "event",
                    entity_name: `Created event "${data.title}"`,
                    status: "success",
                    details: buildEventDetails(data),
                })
                resetFormState()
                onSubmitSuccess?.()
            } catch (err: any) {
                postActionLog({
                    action: "Created Event",
                    entity_type: "event",
                    entity_name: `Failed to create event "${data.title}"`,
                    status: "error",
                    details: err.message ?? "Failed to add event",
                })
                pushAlert("error", err.message ?? "Failed to add event")
            } finally {
                setIsSubmitting(false)
            }
        }
    }

    function handleReset() {
        if (isEditMode && initialData) {
            form.reset({
                title: initialData.title ?? "",
                subtitle: initialData.subtitle ?? "",
                description: "",
                start_date: initialData.start_date ?? "",
                end_date: initialData.end_date ?? "",
                register_link: initialData.register_link ?? "",
                status: initialData.status ?? "",
                is_featured: initialData.is_featured ? "true" : "false",
            })
            if (initialData.start_date) setStartDate(new Date(initialData.start_date))
            else setStartDate(undefined)
            if (initialData.end_date) setEndDate(new Date(initialData.end_date))
            else setEndDate(undefined)
            if (initialData.cover_image) setCoverPreview(initialData.cover_image)
            else setCoverPreview("")
            if (coverInputRef.current) coverInputRef.current.value = ""
            setCoverError("")
            setRelatedFiles([])
            setRelatedPreviews([])
            if (relatedInputRef.current) relatedInputRef.current.value = ""
            setRelatedError("")
            setIsLocked(true)
        } else {
            resetFormState()
        }
    }

    return (
        <Card className="w-full sm:max-w-md">
            <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>{isEditMode ? "Event Details" : "Add Event"}</CardTitle>
                {isEditMode && (
                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setIsLocked((v) => !v)}
                        className="gap-1.5"
                    >
                        {isLocked ? (
                            <><Unlock className="h-3.5 w-3.5" /> Edit</>
                        ) : (
                            <><Lock className="h-3.5 w-3.5" /> Lock</>
                        )}
                    </Button>
                )}
            </CardHeader>

            <CardContent>
                <form id="add-event" onSubmit={form.handleSubmit(onSubmit)}>
                    <FieldGroup>

                        {/* Title */}
                        {FORM_FIELDS.event.title.enabled && <Controller
                            name="title"
                            control={form.control}
                            render={({ field, fieldState }) => (
                                <Field data-invalid={fieldState.invalid}>
                                    <FieldLabel htmlFor="ev-title">Title {FORM_FIELDS.event.title.required && <span className="text-destructive">*</span>}</FieldLabel>
                                        <Input
                                            {...field}
                                            onChange={(e) => field.onChange(enforceTitleChars(e.target.value))}
                                            id="ev-title"
                                            placeholder="Event title"
                                            autoComplete="off"
                                            aria-invalid={fieldState.invalid}
                                            disabled={isLocked}
                                            maxLength={FORM_FIELDS.event.title.maxLength}
                                        />
                                    {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                                </Field>
                            )}
                        />}

                        {/* Subtitle */}
                        {FORM_FIELDS.event.subtitle.enabled && <Controller
                            name="subtitle"
                            control={form.control}
                            render={({ field, fieldState }) => (
                                <Field data-invalid={fieldState.invalid}>
                                    <FieldLabel htmlFor="ev-subtitle">Subtitle {FORM_FIELDS.event.subtitle.required && <span className="text-destructive">*</span>}</FieldLabel>
                                        <Input
                                            {...field}
                                            onChange={(e) => field.onChange(enforceTitleChars(e.target.value))}
                                            id="ev-subtitle"
                                            placeholder="Short tagline (optional)"
                                            autoComplete="off"
                                            aria-invalid={fieldState.invalid}
                                            disabled={isLocked}
                                            maxLength={FORM_FIELDS.event.subtitle.maxLength}
                                        />
                                    {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                                </Field>
                            )}
                        />}

                        {/* Description */}
                        {FORM_FIELDS.event.description.enabled && <Controller
                            name="description"
                            control={form.control}
                            render={({ field, fieldState }) => (
                                <Field data-invalid={fieldState.invalid}>
                                    <FieldLabel htmlFor="ev-description">Description {FORM_FIELDS.event.description.required && <span className="text-destructive">*</span>}</FieldLabel>
                                    <Textarea
                                        {...field}
                                        id="ev-description"
                                        placeholder="Full description of the event…"
                                        rows={5}
                                        className="resize-y"
                                        aria-invalid={fieldState.invalid}
                                        disabled={isLocked}
                                        maxLength={FORM_FIELDS.event.description.maxLength}
                                    />
                                    {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                                    <FieldDescription>Max 2000 characters</FieldDescription>
                                </Field>
                            )}
                        />}

                        {/* Cover Image */}
                        {FORM_FIELDS.event.cover_image.enabled && <Controller
                            name="cover_image"
                            control={form.control}
                            render={({ field, fieldState }) => (
                                <Field data-invalid={fieldState.invalid || !!coverError}>
                                    <FieldLabel htmlFor="ev-cover">Cover Image {FORM_FIELDS.event.cover_image.required && <span className="text-destructive">*</span>}</FieldLabel>
                                    <Input
                                        id="ev-cover"
                                        type="file"
                                        accept="image/*"
                                        aria-invalid={fieldState.invalid || !!coverError}
                                        onChange={(e) => handleCoverChange(e, field.onChange)}
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
                                    <FieldDescription>Single image. Max 5 MB.</FieldDescription>
                                </Field>
                            )}
                        />}

                        {/* Related Images */}
                        {FORM_FIELDS.event.related_images.enabled && <Field>
                            <FieldLabel htmlFor="ev-related">Related Images {FORM_FIELDS.event.related_images.required && <span className="text-destructive">*</span>}</FieldLabel>
                            <Input
                                id="ev-related"
                                type="file"
                                accept="image/*"
                                multiple
                                onChange={handleRelatedChange}
                                disabled={isLocked}
                                ref={relatedInputRef}
                            />
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

                        {/* Start Date */}
                        {FORM_FIELDS.event.start_date.enabled && <Controller
                            name="start_date"
                            control={form.control}
                            render={({ field, fieldState }) => (
                                <Field data-invalid={fieldState.invalid}>
                                    <FieldLabel>Start Date {FORM_FIELDS.event.start_date.required && <span className="text-destructive">*</span>}</FieldLabel>
                                    <Popover>
                                        <PopoverTrigger asChild>
                                            <Button
                                                variant="outline"
                                                data-empty={!startDate}
                                                disabled={isLocked}
                                                className="data-[empty=true]:text-muted-foreground w-full justify-between text-left font-normal"
                                            >
                                                {startDate ? format(startDate, "PPP") : <span>Pick a start date</span>}
                                                <ChevronDownIcon data-icon="inline-end" />
                                            </Button>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-auto p-0" align="start">
                                            <Calendar
                                                mode="single"
                                                captionLayout="dropdown"
                                                selected={startDate}
                                                onSelect={(date) => {
                                                    setStartDate(date)
                                                    field.onChange(date ? format(date, "yyyy-MM-dd") : "")
                                                }}
                                                defaultMonth={startDate}
                                            />
                                        </PopoverContent>
                                    </Popover>
                                    {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                                </Field>
                            )}
                        />}

                        {/* End Date */}
                        {FORM_FIELDS.event.end_date.enabled && <Controller
                            name="end_date"
                            control={form.control}
                            render={({ field, fieldState }) => (
                                <Field data-invalid={fieldState.invalid}>
                                    <FieldLabel>End Date {FORM_FIELDS.event.end_date.required && <span className="text-destructive">*</span>}</FieldLabel>
                                    <Popover>
                                        <PopoverTrigger asChild>
                                            <Button
                                                variant="outline"
                                                data-empty={!endDate}
                                                disabled={isLocked}
                                                className="data-[empty=true]:text-muted-foreground w-full justify-between text-left font-normal"
                                            >
                                                {endDate ? format(endDate, "PPP") : <span>Pick an end date</span>}
                                                <ChevronDownIcon data-icon="inline-end" />
                                            </Button>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-auto p-0" align="start">
                                            <Calendar
                                                mode="single"
                                                captionLayout="dropdown"
                                                selected={endDate}
                                                onSelect={(date) => {
                                                    setEndDate(date)
                                                    field.onChange(date ? format(date, "yyyy-MM-dd") : "")
                                                }}
                                                defaultMonth={endDate}
                                            />
                                        </PopoverContent>
                                    </Popover>
                                    {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                                </Field>
                            )}
                        />}

                        {/* Registration URL */}
                        {FORM_FIELDS.event.register_link.enabled && <Controller
                            name="register_link"
                            control={form.control}
                            render={({ field, fieldState }) => (
                                <Field data-invalid={fieldState.invalid}>
                                    <FieldLabel htmlFor="ev-register-link">Registration URL {FORM_FIELDS.event.register_link.required && <span className="text-destructive">*</span>}</FieldLabel>
                                    {/* Locked view: show as clickable link */}
                                    {isLocked && field.value ? (
                                        <a
                                            href={field.value}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="inline-flex items-center gap-1.5 text-sm text-primary underline underline-offset-2 hover:opacity-80 break-all"
                                        >
                                            {field.value}
                                        </a>
                                    ) : isLocked ? (
                                        <span className="text-sm text-muted-foreground">No registration link</span>
                                    ) : (
                                        <Input
                                            {...field}
                                            onChange={(e) => field.onChange(enforceNoSpaces(e.target.value))}
                                            id="ev-register-link"
                                            type="url"
                                            placeholder="https://..."
                                            autoComplete="off"
                                            aria-invalid={fieldState.invalid}
                                            disabled={isLocked}
                                            maxLength={FORM_FIELDS.event.register_link.maxLength}
                                        />
                                    )}
                                    {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                                    {!isLocked && <FieldDescription>Optional registration link</FieldDescription>}
                                </Field>
                            )}
                        />}

                        {/* Status */}
                        {FORM_FIELDS.event.status.enabled && <Controller
                            name="status"
                            control={form.control}
                            render={({ field, fieldState }) => (
                                <Field data-invalid={fieldState.invalid}>
                                    <FieldLabel htmlFor="ev-status">Status {FORM_FIELDS.event.status.required && <span className="text-destructive">*</span>}</FieldLabel>
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
                                                        ? (STATUS_OPTIONS.find((s) => s.value === field.value)?.label ?? field.value)
                                                        : "Select status"}
                                                </span>
                                                <ChevronDownIcon className="h-4 w-4 opacity-50" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent className="w-56">
                                            {STATUS_OPTIONS.map((s) => (
                                                <DropdownMenuCheckboxItem
                                                    key={s.value}
                                                    checked={field.value === s.value}
                                                    onCheckedChange={() =>
                                                        field.onChange(field.value === s.value ? "" : s.value)
                                                    }
                                                >
                                                    {s.label}
                                                </DropdownMenuCheckboxItem>
                                            ))}
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                    {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                                </Field>
                            )}
                        />}

                        {/* Is Featured */}
                        {FORM_FIELDS.event.is_featured.enabled && <Controller
                            name="is_featured"
                            control={form.control}
                            render={({ field }) => (
                                <Field>
                                    <div className="flex w-full items-center justify-between rounded-md border px-3 py-2 text-sm">
                                        <label
                                            htmlFor="ev-featured-toggle"
                                            className="flex items-center gap-2 cursor-pointer select-none"
                                        >
                                            <Star className="h-4 w-4 text-muted-foreground" />
                                            <span>Featured</span>
                                            <span className="text-xs text-muted-foreground">
                                                {field.value === "true" ? "Shows on homepage" : "Not highlighted"}
                                            </span>
                                        </label>
                                        <button
                                            id="ev-featured-toggle"
                                            type="button"
                                            role="switch"
                                            aria-checked={field.value === "true"}
                                            disabled={isLocked}
                                            onClick={() =>
                                                field.onChange(field.value === "true" ? "false" : "true")
                                            }
                                            className={`relative inline-flex h-5 w-9 shrink-0 rounded-full border-2 border-transparent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${isLocked ? "opacity-50 cursor-not-allowed" : "cursor-pointer"} ${field.value === "true" ? "bg-primary" : "bg-input"}`}
                                        >
                                            <span
                                                className={`pointer-events-none block h-4 w-4 rounded-full bg-background shadow-lg ring-0 transition-transform ${field.value === "true" ? "translate-x-4" : "translate-x-0"}`}
                                            />
                                        </button>
                                    </div>
                                </Field>
                            )}
                        />}

                    </FieldGroup>
                </form>
            </CardContent>

            <CardFooter className="flex flex-col gap-3">
                {/* Add Multiple toggle — add mode only */}
                {!isEditMode && (
                    <div className="flex w-full items-center justify-between rounded-md border px-3 py-2 text-sm">
                        <label
                            htmlFor="ev-add-multiple-toggle"
                            className="flex items-center gap-2 cursor-pointer select-none"
                        >
                            <Layers className="h-4 w-4 text-muted-foreground" />
                            <span>Add multiple</span>
                        </label>
                        <button
                            id="ev-add-multiple-toggle"
                            type="button"
                            role="switch"
                            aria-checked={addMultiple}
                            onClick={() => setAddMultiple((v) => !v)}
                            className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${addMultiple ? "bg-primary" : "bg-input"}`}
                        >
                            <span
                                className={`pointer-events-none block h-4 w-4 rounded-full bg-background shadow-lg ring-0 transition-transform ${addMultiple ? "translate-x-4" : "translate-x-0"}`}
                            />
                        </button>
                    </div>
                )}

                <Field orientation="horizontal" className="w-full">
                    <Button type="button" variant="outline" onClick={handleReset} disabled={isSubmitting}>
                        {isEditMode ? "Revert" : "Reset"}
                    </Button>
                    <Button type="submit" form="add-event" disabled={isSubmitting || isLocked}>
                        {isSubmitting
                            ? isEditMode ? "Saving..." : "Adding..."
                            : isEditMode
                                ? "Save Changes"
                                : addMultiple ? "Add & Continue" : "Add Event"}
                    </Button>
                </Field>
            </CardFooter>

            {/* Floating background-submit alerts (portalled to body) */}
            {bgAlerts.length > 0 &&
                typeof document !== "undefined" &&
                createPortal(
                    <div className="fixed bottom-4 right-4 z-[200] flex flex-col gap-2 max-w-sm pointer-events-none">
                        {bgAlerts.map((alert) => (
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
                )}
        </Card>
    )
}
