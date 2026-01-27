"use client"

import * as React from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { Controller, useForm } from "react-hook-form"

import * as z from "zod"

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

const formSchema = z.object({
    name: z
        .string()
        .min(3, "Bug title must be at least 5 characters.")
        .max(32, "Bug title must be at most 32 characters."),
    email: z
        .string()
        .min(5, "Description must be at least 20 characters.")
        .max(100, "Description must be at most 100 characters."),
    phone: z.string(),
    photo: z.string(),
    organization: z.string(),
    roles: z.string(),
    join_date: z.string(),
    leave_date: z.string(),
      

})

export default function BugReportForm() {
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: "",
            email: "",
            phone: "",
            photo: "",
            organization: "",
            roles: "",
            join_date: "",
            leave_date: "",
        },
    })

    function onSubmit(data: z.infer<typeof formSchema>) {
        console.log(data)
        const formData = new FormData()
        formData.append("name", data.name)
        formData.append("email", data.email)
        formData.append("phone", data.phone)
        formData.append("photo", data.photo)
        formData.append("organization", data.organization)
        formData.append("roles", data.roles)
        formData.append("join_date", data.join_date)
        formData.append("leave_date", data.leave_date)
        for (const [key, value] of formData.entries()) {
  console.log(key, value)
}
    }

    return (
        <Card className="w-full sm:max-w-md">
            <CardHeader>
                <CardTitle>Add Member</CardTitle>
                <CardDescription>
                    Enter details to add a new member
                </CardDescription>
            </CardHeader>
            <CardContent>
                <form id="add-member" onSubmit={form.handleSubmit(onSubmit)}>
                    <FieldGroup>
                        <Controller
                            name="name"
                            control={form.control}
                            render={({ field, fieldState }) => (
                                <Field data-invalid={fieldState.invalid}>
                                    <FieldLabel htmlFor="add-member-name">
                                        Name
                                    </FieldLabel>
                                    <Input
                                        {...field}
                                        id="add-member-name"
                                        aria-invalid={fieldState.invalid}
                                        placeholder="Enter your name"
                                        autoComplete="off"
                                    />
                                    {fieldState.invalid && (
                                        <FieldError errors={[fieldState.error]} />
                                    )}
                                    <FieldDescription>
                                        Enter first and last name
                                    </FieldDescription>
                                </Field>
                            )}
                        />
                        <Controller
                            name="email"
                            control={form.control}
                            render={({ field, fieldState }) => (
                                <Field data-invalid={fieldState.invalid}>
                                    <FieldLabel htmlFor="add-member-email">
                                        Email
                                    </FieldLabel>
                                    <Input
                                        {...field}
                                        id="add-member-email"
                                        aria-invalid={fieldState.invalid}
                                        placeholder="Enter your email"
                                        autoComplete="off"
                                    />
                                    {fieldState.invalid && (
                                        <FieldError errors={[fieldState.error]} />
                                    )}
                                </Field>
                            )}
                        />
                        <Controller
                            name="phone"
                            control={form.control}
                            render={({ field, fieldState }) => (
                                <Field data-invalid={fieldState.invalid}>
                                    <FieldLabel htmlFor="add-member-phone">
                                        Phone
                                    </FieldLabel>
                                    <Input
                                        {...field}
                                        id="add-member-phone"
                                        aria-invalid={fieldState.invalid}
                                        placeholder="Enter your name"
                                        autoComplete="off"
                                    />
                                    {fieldState.invalid && (
                                        <FieldError errors={[fieldState.error]} />
                                    )}
                                    <FieldDescription>
                                        Enter a 10 digit valid phone number
                                    </FieldDescription>
                                </Field>
                            )}
                        />
                        <Controller
                            name="photo"
                            control={form.control}
                            render={({ field, fieldState }) => (
                                <Field data-invalid={fieldState.invalid}>
                                    <FieldLabel htmlFor="add-member-photo">
                                        Photo
                                    </FieldLabel>
                                    <Input
                                        {...field}
                                        id="add-member-photo"
                                        aria-invalid={fieldState.invalid}
                                        placeholder="Enter your photo"
                                        autoComplete="off"
                                    />
                                    {fieldState.invalid && (
                                        <FieldError errors={[fieldState.error]} />
                                    )}
                                    <FieldDescription>
                                        Enter a valid photo URL
                                    </FieldDescription>
                                </Field>
                            )}
                        />
                        <Controller
                            name="organization"
                            control={form.control}
                            render={({ field, fieldState }) => (
                                <Field data-invalid={fieldState.invalid}>
                                    <FieldLabel htmlFor="add-member-organization">
                                        Organization
                                    </FieldLabel>
                                    <Input
                                        {...field}
                                        id="add-member-organization"
                                        aria-invalid={fieldState.invalid}
                                        placeholder="Enter your organization"
                                        autoComplete="off"
                                    />
                                    {fieldState.invalid && (
                                        <FieldError errors={[fieldState.error]} />
                                    )}
                                    <FieldDescription>
                                        Enter first and last name
                                    </FieldDescription>
                                </Field>
                            )}
                        />
                        <Controller
                            name="roles"
                            control={form.control}
                            render={({ field, fieldState }) => (
                                <Field data-invalid={fieldState.invalid}>
                                    <FieldLabel htmlFor="add-member-roles">
                                        Roles
                                    </FieldLabel>
                                    <Input
                                        {...field}
                                        id="add-member-roles"
                                        aria-invalid={fieldState.invalid}
                                        placeholder="Enter your name"
                                        autoComplete="off"
                                    />
                                    {fieldState.invalid && (
                                        <FieldError errors={[fieldState.error]} />
                                    )}
                                    <FieldDescription>
                                        Enter first and last name
                                    </FieldDescription>
                                </Field>
                            )}
                        />
                        <Controller
                            name="join_date"
                            control={form.control}
                            render={({ field, fieldState }) => (
                                <Field data-invalid={fieldState.invalid}>
                                    <FieldLabel htmlFor="add-member-join_date">
                                        Join Date
                                    </FieldLabel>
                                    <Input
                                        {...field}
                                        id="add-member-join_date"
                                        aria-invalid={fieldState.invalid}
                                        placeholder="Enter your name"
                                        autoComplete="off"
                                    />
                                    {fieldState.invalid && (
                                        <FieldError errors={[fieldState.error]} />
                                    )}
                                    <FieldDescription>
                                        Enter first and last name
                                    </FieldDescription>
                                </Field>
                            )}
                        />
                        <Controller
                            name="leave_date"
                            control={form.control}
                            render={({ field, fieldState }) => (
                                <Field data-invalid={fieldState.invalid}>
                                    <FieldLabel htmlFor="add-member-leave_date">
                                        Leave Date
                                    </FieldLabel>
                                    <Input
                                        {...field}
                                        id="add-member-leave_date"
                                        aria-invalid={fieldState.invalid}
                                        placeholder="Enter your name"
                                        autoComplete="off"
                                    />
                                    {fieldState.invalid && (
                                        <FieldError errors={[fieldState.error]} />
                                    )}
                                    <FieldDescription>
                                        Enter first and last name
                                    </FieldDescription>
                                </Field>
                            )}
                        />
                    </FieldGroup>
                </form>
            </CardContent>
            <CardFooter>
                <Field orientation="horizontal">
                    <Button type="button" variant="outline" onClick={() => form.reset()}>
                        Reset
                    </Button>
                    <Button type="submit" form="add-member">
                        Submit
                    </Button>
                </Field>
            </CardFooter>
        </Card>
    )
}
