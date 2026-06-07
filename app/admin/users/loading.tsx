import { Skeleton } from "@/components/ui/skeleton"

export default function UsersLoading() {
    return (
        <div className="flex flex-col w-full gap-6">
            {/* Header */}
            <Skeleton className="h-9 w-24" />

            {/* Table */}
            <div className="w-full rounded border overflow-hidden">
                <div className="flex gap-4 px-4 py-3 border-b bg-muted/40">
                    <Skeleton className="h-4 w-40" />
                    <Skeleton className="h-4 w-24 ml-auto" />
                    <Skeleton className="h-4 w-24" />
                </div>
                {Array.from({ length: 8 }).map((_, i) => (
                    <div key={i} className="flex gap-4 px-4 py-3 border-b last:border-0">
                        <Skeleton className="h-4 w-48" />
                        <Skeleton className="h-4 w-20 ml-auto" />
                        <Skeleton className="h-4 w-24" />
                    </div>
                ))}
            </div>
        </div>
    )
}
