"use client"
import { Role, Organization } from "@/app/admin/members/types"

import * as React from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { Controller, useForm } from "react-hook-form"
import { Calendar } from "@/components/ui/calendar"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import { format } from "date-fns"
import { ChevronDownIcon } from "lucide-react"

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
    organization: z.array(z.object({
        name: z.string(),
    })),
    roles: z.array(z.object({
        name: z.string(),
    })),
    join_date: z.string(),
    leave_date: z.string(),


})

export default function AddMemberForm({ roles, organizations }: { roles: Role[], organizations: Organization[] }) {
    const [joinDate, setJoinDate] = React.useState<Date>()
    const [leaveDate, setLeaveDate] = React.useState<Date>()
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: "",
            email: "",
            phone: "",
            photo: "",
            organization: [],
            roles: [],
            join_date: "",
            leave_date: "",
        },
    })

    async function onSubmit(data: z.infer<typeof formSchema>) {
        console.log("Form data:", data)
        const formData = new FormData()
        formData.append("name", data.name)
        formData.append("email", data.email)
        formData.append("phone", data.phone)
        formData.append("photo", data.photo)

        // Map organization names to organization IDs
        console.log("Available organizations:", organizations)
        console.log("Entered organizations:", data.organization)
        const organizationIds = data.organization
            .map((org: any) => {
                const matchedOrg = organizations.find(organization => organization.name.toLowerCase() === org.name.toLowerCase())
                console.log(`Matching "${org.name}":`, matchedOrg)
                return matchedOrg?.$id
            })
            .filter(Boolean) // Remove any undefined values

        console.log("Organization IDs:", organizationIds)
        formData.append("orgs", JSON.stringify(organizationIds))

        // Map role names to role IDs
        console.log("Available roles:", roles)
        console.log("Entered roles:", data.roles)
        const roleIds = data.roles
            .map((r: any) => {
                const matchedRole = roles.find(role => role.name.toLowerCase() === r.name.toLowerCase())
                console.log(`Matching "${r.name}":`, matchedRole)
                return matchedRole?.$id
            })
            .filter(Boolean) // Remove any undefined values

        console.log("Role IDs:", roleIds)
        formData.append("roles", JSON.stringify(roleIds))
        formData.append("join_date", data.join_date)
        formData.append("leave_date", data.leave_date)
        for (const [key, value] of formData.entries()) {
            console.log(key, value)
        }
        const response = await fetch("/api/v1/members", {
            method: "POST",
            body: formData,
        });
        const result = await response.json();
        console.log(result)

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
                                        id="add-member-organization"
                                        name={field.name}
                                        ref={field.ref}
                                        disabled={field.disabled}
                                        aria-invalid={fieldState.invalid}
                                        placeholder="Enter organizations (comma-separated)"
                                        autoComplete="off"
                                        value={Array.isArray(field.value) ? field.value.map((org: any) => org.name).join(", ") : ""}
                                        onChange={(e) => {
                                            console.log("Organization input changed:", e.target.value);
                                            const orgNames = e.target.value.split(",").map(name => name.trim()).filter(name => name);
                                            console.log("Parsed org names:", orgNames);
                                            const orgObjects = orgNames.map(name => ({ name }));
                                            console.log("Org objects to store:", orgObjects);
                                            field.onChange(orgObjects);
                                        }}
                                        onBlur={field.onBlur}
                                    />
                                    {fieldState.invalid && (
                                        <FieldError errors={[fieldState.error]} />
                                    )}
                                    <FieldDescription>
                                        Enter organizations separated by commas (e.g., Company A, Company B)
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
                                        id="add-member-roles"
                                        name={field.name}
                                        ref={field.ref}
                                        disabled={field.disabled}
                                        aria-invalid={fieldState.invalid}
                                        placeholder="Enter roles (comma-separated)"
                                        autoComplete="off"
                                        value={Array.isArray(field.value) ? field.value.map((r: any) => r.name).join(", ") : ""}
                                        onChange={(e) => {
                                            console.log("Roles input changed:", e.target.value);
                                            const roleNames = e.target.value.split(",").map(name => name.trim()).filter(name => name);
                                            console.log("Parsed role names:", roleNames);
                                            const roleObjects = roleNames.map(name => ({ name }));
                                            console.log("Role objects to store:", roleObjects);
                                            field.onChange(roleObjects);
                                        }}
                                        onBlur={field.onBlur}
                                    />
                                    {fieldState.invalid && (
                                        <FieldError errors={[fieldState.error]} />
                                    )}
                                    <FieldDescription>
                                        Enter roles separated by commas (e.g., Admin, Developer, Manager)
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
                        />
                        <Controller
                            name="leave_date"
                            control={form.control}
                            render={({ field, fieldState }) => (
                                <Field data-invalid={fieldState.invalid}>
                                    <FieldLabel htmlFor="add-member-leave_date">
                                        Leave Date
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
