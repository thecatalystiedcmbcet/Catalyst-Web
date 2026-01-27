import { columns, Payment } from "./columns"
import { DataTable } from "./data-table"

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
        <div className="container mx-auto py-10">
            <DataTable columns={columns} data={data} />
        </div>
    )
}