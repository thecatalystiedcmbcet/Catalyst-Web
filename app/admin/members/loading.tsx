import { Skeleton } from "@/components/ui/skeleton"

export default function MembersLoading() {
    return (
        <div className="flex flex-col items-center w-full max-w-7xl mx-auto">
            {/* Header row */}
            <div className="flex justify-between items-center w-full mb-8">
                <Skeleton className="h-8 w-32" />
                <Skeleton className="h-9 w-28" />
            </div>

            {/* Toolbar row (search / column toggle) */}
            <div className="flex items-center justify-between w-full mb-4">
                <Skeleton className="h-9 w-64" />
                <Skeleton className="h-9 w-28" />
            </div>

            {/* Table */}
            <div className="w-full rounded-md border overflow-hidden">
                {/* Table header */}
                <div className="flex items-center gap-4 px-4 py-3 border-b bg-muted/40">
                    <Skeleton className="h-4 w-4" />
                    <Skeleton className="h-4 w-28" />
                    <Skeleton className="h-4 w-24 ml-auto" />
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-4 w-16" />
                </div>

                {/* Table rows */}
                {Array.from({ length: 8 }).map((_, i) => (
                    <div
                        key={i}
                        className="flex items-center gap-4 px-4 py-3 border-b last:border-0"
                    >
                        <Skeleton className="h-4 w-4 rounded-sm" />
                        <div className="flex items-center gap-3">
                            <Skeleton className="h-8 w-8 rounded-full" />
                            <Skeleton className="h-4 w-32" />
                        </div>
                        <Skeleton className="h-4 w-40 ml-auto" />
                        <Skeleton className="h-4 w-28" />
                        <Skeleton className="h-4 w-20" />
                        <Skeleton className="h-4 w-24" />
                        <Skeleton className="h-8 w-8 ml-2" />
                    </div>
                ))}
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-between w-full mt-4">
                <Skeleton className="h-4 w-40" />
                <div className="flex gap-2">
                    <Skeleton className="h-8 w-20" />
                    <Skeleton className="h-8 w-20" />
                </div>
            </div>
        </div>
    )
}
