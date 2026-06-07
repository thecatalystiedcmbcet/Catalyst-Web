import { Skeleton } from "@/components/ui/skeleton"

export default function LogsLoading() {
    return (
        <div className="flex flex-col items-center w-full max-w-7xl mx-auto gap-6 py-10 px-4">
            {/* Header + refresh */}
            <div className="flex justify-between items-center w-full">
                <Skeleton className="h-8 w-32" />
                <Skeleton className="h-9 w-24" />
            </div>

            {/* Summary cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full">
                {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="rounded-lg border p-4 flex flex-col gap-2">
                        <Skeleton className="h-4 w-24" />
                        <Skeleton className="h-8 w-16" />
                    </div>
                ))}
            </div>

            {/* Filters */}
            <div className="flex items-center gap-3 w-full">
                <Skeleton className="h-9 w-36" />
                <Skeleton className="h-9 w-40" />
            </div>

            {/* Table */}
            <div className="w-full rounded-md border overflow-hidden">
                <div className="flex items-center gap-4 px-4 py-3 border-b bg-muted/40">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-4 w-16" />
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-4 w-24 ml-auto" />
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-4 w-14" />
                    <Skeleton className="h-4 w-20" />
                </div>
                {Array.from({ length: 10 }).map((_, i) => (
                    <div key={i} className="flex items-center gap-4 px-4 py-3 border-b last:border-0">
                        <Skeleton className="h-4 w-28" />
                        <Skeleton className="h-5 w-16 rounded-full" />
                        <Skeleton className="h-4 w-24" />
                        <Skeleton className="h-4 w-28 ml-auto" />
                        <Skeleton className="h-4 w-36" />
                        <Skeleton className="h-5 w-16 rounded-full" />
                        <Skeleton className="h-4 w-24" />
                    </div>
                ))}
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-between w-full">
                <Skeleton className="h-4 w-40" />
                <div className="flex gap-2">
                    <Skeleton className="h-8 w-24" />
                    <Skeleton className="h-8 w-24" />
                </div>
            </div>
        </div>
    )
}
