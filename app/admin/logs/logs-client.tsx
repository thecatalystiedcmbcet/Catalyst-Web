"use client"

import * as React from "react"
import { ActionLog } from "./columns"
import { DataTable } from "./data-table"
import { ScrollText, RefreshCw, CheckCircle2, XCircle, Download} from "lucide-react"
import { Button } from "@/components/ui/button"

interface LogsClientProps {
    initialData: ActionLog[]
    total: number
}

export function LogsClient({ initialData, total }: LogsClientProps) {
    const [data, setData] = React.useState<ActionLog[]>(initialData)
    const [totalCount, setTotalCount] = React.useState(total)
    const [page, setPage] = React.useState(1)
    const [statusFilter, setStatusFilter] = React.useState<"all" | "success" | "error">("all")
    const [entityFilter, setEntityFilter] = React.useState<string>("all")
    const [isRefreshing, setIsRefreshing] = React.useState(false)
    const limit = 25

    // Derive unique entity types from data for the filter dropdown
    const entityTypes = React.useMemo(() => {
        const all = initialData.map(l => l.entity_type)
        return Array.from(new Set(all)).sort()
    }, [initialData])

    const fetchLogs = React.useCallback(async (
        p: number,
        status: "all" | "success" | "error",
        entity: string
    ) => {
        setIsRefreshing(true)
        try {
            const params = new URLSearchParams({
                page: String(p),
                limit: String(limit),
            })
            if (status !== "all") params.set("status", status)
            if (entity !== "all") params.set("entity_type", entity)

            const res = await fetch(`/api/v1/action-logs?${params}`, {
                credentials: "include",
                cache: "no-store",
            })
            if (!res.ok) return

            const json = await res.json()
            const list: ActionLog[] = (json.documents ?? []).map((doc: any) => ({
                id: doc.$id,
                action: doc.action,
                entity_type: doc.entity_type,
                entity_id: doc.entity_id,
                entity_name: doc.entity_name,
                performed_by: doc.performed_by,
                details: doc.details,
                status: doc.status,
                createdAt: doc.$createdAt,
            }))
            setData(list)
            setTotalCount(json.total ?? list.length)
        } finally {
            setIsRefreshing(false)
        }
    }, [])

    // Refetch whenever filter/page changes
    React.useEffect(() => {
        fetchLogs(page, statusFilter, entityFilter)
    }, [page, statusFilter, entityFilter, fetchLogs])

    const successCount = data.filter(l => l.status === "success").length
    const errorCount = data.filter(l => l.status === "error").length

    return (
        <div className="flex flex-col items-center w-full max-w-7xl mx-auto gap-6">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4 w-full">
                <div className="space-y-1">
                    <h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-2">
                        <ScrollText className="h-6 w-6 text-muted-foreground hidden sm:block" />
                        Action Logs
                    </h1>
                    <p className="text-sm text-muted-foreground">
                        Monitor system activity and administrative actions. <span className="hidden sm:inline">({totalCount} total)</span>
                    </p>
                </div>
                
                <div className="flex w-full md:w-auto flex-col sm:flex-row shadow-sm sm:shadow-none gap-2">
                    <Button variant="outline" className="w-full sm:w-auto h-10 shadow-sm" asChild>
                        <a href="/api/v1/export?collection=ACTION_LOGS">
                            <Download className="w-4 h-4 mr-2" /> Export
                        </a>
                    </Button>
                    <Button
                        variant="outline"
                        onClick={() => fetchLogs(page, statusFilter, entityFilter)}
                        disabled={isRefreshing}
                        className="w-full sm:w-auto h-10 shadow-sm order-1 sm:order-2"
                    >
                        <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? "animate-spin" : ""}`} />
                        Refresh
                    </Button>
                </div>
            </div>

            {/* Summary cards */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 w-full">
                <div className="rounded-lg border bg-card px-4 py-3 flex items-center gap-3">
                    <div className="rounded-full bg-muted p-1.5">
                        <ScrollText className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div>
                        <p className="text-xs text-muted-foreground">Total (page)</p>
                        <p className="text-lg font-semibold">{data.length}</p>
                    </div>
                </div>
                <div className="rounded-lg border bg-card px-4 py-3 flex items-center gap-3">
                    <div className="rounded-full bg-green-100 p-1.5 dark:bg-green-900/30">
                        <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
                    </div>
                    <div>
                        <p className="text-xs text-muted-foreground">Success</p>
                        <p className="text-lg font-semibold text-green-700 dark:text-green-400">{successCount}</p>
                    </div>
                </div>
                <div className="rounded-lg border bg-card px-4 py-3 flex items-center gap-3">
                    <div className="rounded-full bg-red-100 p-1.5 dark:bg-red-900/30">
                        <XCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
                    </div>
                    <div>
                        <p className="text-xs text-muted-foreground">Errors</p>
                        <p className="text-lg font-semibold text-red-700 dark:text-red-400">{errorCount}</p>
                    </div>
                </div>
            </div>

            {/* Filters */}
            <div className="flex items-center gap-3 w-full flex-wrap">
                <select
                    value={statusFilter}
                    onChange={(e) => {
                        setStatusFilter(e.target.value as "all" | "success" | "error")
                        setPage(1)
                    }}
                    className="h-9 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring w-36"
                >
                    <option value="all">All statuses</option>
                    <option value="success">Success</option>
                    <option value="error">Error</option>
                </select>

                <select
                    value={entityFilter}
                    onChange={(e) => {
                        setEntityFilter(e.target.value)
                        setPage(1)
                    }}
                    className="h-9 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring w-40 capitalize"
                >
                    <option value="all">All entities</option>
                    {entityTypes.map(et => (
                        <option key={et} value={et} className="capitalize">{et}</option>
                    ))}
                </select>
            </div>


            {/* Table */}
            <div className="w-full">
                <DataTable data={data} />
            </div>

            {/* Pagination */}
            {totalCount > 0 && (
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-t pt-4 w-full">
                    <div className="text-sm text-muted-foreground sm:text-left text-center w-full sm:w-auto">
                        Showing <span className="font-semibold text-foreground">{(page - 1) * limit + 1}</span> to <span className="font-semibold text-foreground">{Math.min(page * limit, totalCount)}</span> of <span className="font-semibold text-foreground">{totalCount}</span> results
                    </div>
                    {totalPages > 1 && (
                        <div className="flex flex-col sm:flex-row items-center gap-2 w-full sm:w-auto mt-2 sm:mt-0">
                            <div className="flex items-center gap-1 sm:hidden text-sm font-medium text-muted-foreground mx-auto mb-2">
                                Page <span className="text-foreground">{page}</span> of {totalPages}
                            </div>
                            <div className="flex items-center gap-2 justify-between w-full sm:w-auto">
                                <Button 
                                    variant="outline" 
                                    size="sm" 
                                    className="h-8 md:px-3" 
                                    disabled={page <= 1 || isRefreshing}
                                    onClick={() => setPage(p => p - 1)}
                                >
                                    <ChevronLeft className="w-4 h-4" />
                                </Button>
                                <div className="hidden sm:flex items-center gap-1">
                                    <span className="text-sm text-muted-foreground mx-2">
                                        Page <span className="font-medium text-foreground">{page}</span> of {totalPages}
                                    </span>
                                </div>
                                <Button 
                                    variant="outline" 
                                    size="sm" 
                                    className="h-8 md:px-3"
                                    disabled={page >= totalPages || isRefreshing}
                                    onClick={() => setPage(p => p + 1)}
                                >
                                    <ChevronRight className="w-4 h-4" />
                                </Button>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}
