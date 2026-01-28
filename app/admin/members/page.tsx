import { columns, Payment } from "./columns"
import { DataTable } from "./data-table"
import AddMemberForm from "./add-member-form"

import {
    Drawer,
    DrawerClose,
    DrawerContent,
    DrawerDescription,
    DrawerFooter,
    DrawerHeader,
    DrawerTitle,
    DrawerTrigger,
} from "@/components/ui/drawer"

import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"

async function getData(): Promise<Payment[]> {
    const res = await fetch("http://localhost:3000/api/v1/members", {
        method: "GET",
        cache: "no-store",
    })

    if (!res.ok) {
        throw new Error("Failed to fetch members")
    }

    const rawData = await res.json()

    const payments: Payment[] = rawData.map((item: any) => {
        const temp_join_date = item.join_date
        const join_Date_ = new Intl.DateTimeFormat("en-CA").format(
            new Date(temp_join_date)
        )
        const temp_leave_date = item.leave_date
        const leave_Date_ = new Intl.DateTimeFormat("en-CA").format(
            new Date(temp_leave_date)
        )

        return {
            name: item.name,
            phone: item.phone,
            photo: item.photo,
            email: item.email,
            organization: item.orgs.map((orgs: any) => orgs.name).join(", "),
            roles: item.roles.map((roles: any) => roles.name).join(", "),
            join_date: join_Date_,
            leave_date: leave_Date_,
        }
    })

    return payments
}

export default async function DemoPage() {
    const data = await getData()

    return (
        <div className="flex flex-col items-center w-full max-w-7xl mx-auto">

            <div className="flex justify-between items-center w-full">
                <div>
                    <h1>Members</h1>
                </div>
                <div>
                    <Drawer direction="right" >
                        <DrawerTrigger asChild>
                            <Button variant="outline" ><Plus />Add User</Button>
                        </DrawerTrigger>
                        <DrawerContent className="no-scrollbar overflow-y-auto">
                            <AddMemberForm />
                        </DrawerContent>
                    </Drawer>
                </div>
            </div>

            <div className="py-10 w-full">
                <DataTable columns={columns} data={data} />
            </div>
        </div>
    )
}