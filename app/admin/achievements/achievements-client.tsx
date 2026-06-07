"use client"

import * as React from "react"
import { Achievement, getColumns } from "./columns"
import { DataTable } from "./data-table"
import AddAchievementForm from "./add-achievement-form"
import { Organization } from "@/app/admin/members/types"
import {
    Drawer,
    DrawerContent,
    DrawerHeader,
    DrawerTitle,
    DrawerTrigger,
} from "@/components/ui/drawer"
import { Button } from "@/components/ui/button"
import { Plus, CheckCircle2, XCircle, Search, Filter, Download, Eye } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Input } from "@/components/ui/input"

interface AchievementsClientProps {
    initialData: Achievement[]
    organizations: Organization[]
}

export function AchievementsClient({ initialData, organizations }: AchievementsClientProps) {
    const [data, setData] = React.useState<Achievement[]>(initialData)
    const [alert, setAlert] = React.useState<{
        type: "success" | "error"
        message: string
    } | null>(null)
    const [isDrawerOpen, setIsDrawerOpen] = React.useState(false)
    const [editingAchievement, setEditingAchievement] = React.useState<Achievement | null>(null)
    const [searchQuery, setSearchQuery] = React.useState("")

    const filteredData = React.useMemo(() => {
        if (!searchQuery) return data;
        const lowerQ = searchQuery.toLowerCase();
        return data.filter(item => 
            (item.title && item.title.toLowerCase().includes(lowerQ)) ||
            (item.date && item.date.toLowerCase().includes(lowerQ)) ||
            (item.id && item.id.toLowerCase().includes(lowerQ))
        );
    }, [data, searchQuery])

    const handleEditAchievement = React.useCallback((achievement: Achievement) => {
        setEditingAchievement(achievement)
        setIsDrawerOpen(true)
    }, [])

    const handleDeleteSuccess = React.useCallback((id: string) => {
        setData((prev) => prev.filter((a) => a.id !== id))
    }, [])

    const handleAddSuccess = React.useCallback(() => {
        setIsDrawerOpen(false)
        setAlert({ type: "success", message: "Achievement added successfully!" })
        setTimeout(() => window.location.reload(), 1200)
    }, [])

    const handleEditSuccess = React.useCallback(() => {
        setIsDrawerOpen(false)
        setEditingAchievement(null)
        setAlert({ type: "success", message: "Achievement updated successfully!" })
        setTimeout(() => window.location.reload(), 1200)
    }, [])

    // Track background POSTs (addMultiple mode)
    const pendingPostsRef = React.useRef<Set<Promise<void>>>(new Set())
    // True if at least one background POST was started this drawer session
    const hadBackgroundPostRef = React.useRef(false)

    const handleBackgroundPost = React.useCallback((promise: Promise<void>) => {
        hadBackgroundPostRef.current = true
        pendingPostsRef.current.add(promise)
        promise.finally(() => pendingPostsRef.current.delete(promise))
    }, [])

    const handleDrawerOpenChange = React.useCallback(async (open: boolean) => {
        if (open) {
            // Reset session flag when drawer opens
            hadBackgroundPostRef.current = false
            setIsDrawerOpen(true)
        } else {
            setIsDrawerOpen(false)
            setEditingAchievement(null)
            if (hadBackgroundPostRef.current) {
                // Wait for any still-in-flight POSTs then reload
                const pending = [...pendingPostsRef.current]
                if (pending.length > 0) await Promise.allSettled(pending)
                window.location.reload()
            }
        }
    }, [])

    return (
        <div className="flex flex-col items-center w-full max-w-7xl mx-auto">
            {alert && (
                <div className="fixed bottom-4 right-4 z-50 max-w-md">
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
            )}

            {/* Header Section */}
            <div className="gsap-fade-up flex flex-col md:flex-row md:justify-between md:items-start gap-4 w-full">
                <div className="space-y-1">
                    <h1 className="text-3xl font-bold tracking-tight text-foreground">Achievements</h1>
                    <p className="text-sm text-muted-foreground">
                        Manage your recognitions and milestones.
                    </p>
                </div>
                
                <div className="flex w-full md:w-auto flex-col sm:flex-row shadow-sm sm:shadow-none gap-2">
                    <Button variant="outline" className="w-full sm:w-auto h-10 shadow-sm order-2 sm:order-1" asChild>
                        <a href="/api/v1/export?collection=ACHIEVEMENTS">
                            <Download className="w-4 h-4 mr-2" /> Export
                        </a>
                    </Button>

                    <Drawer direction="right" open={isDrawerOpen} onOpenChange={handleDrawerOpenChange}>
                        <DrawerTrigger asChild>
                            <Button className="w-full sm:w-auto h-10 order-1 sm:order-2">
                                <Plus className="w-4 h-4 mr-2" /> Add Achievement
                            </Button>
                        </DrawerTrigger>
                        <DrawerContent className="no-scrollbar overflow-y-auto overflow-x-hidden">
                            <DrawerHeader className="sr-only">
                                <DrawerTitle>
                                    {editingAchievement ? "Edit Achievement" : "Add Achievement"}
                                </DrawerTitle>
                            </DrawerHeader>
                            <AddAchievementForm
                                organizations={organizations}
                                onSubmitSuccess={editingAchievement ? handleEditSuccess : handleAddSuccess}
                                onBackgroundPost={editingAchievement ? undefined : handleBackgroundPost}
                                initialData={editingAchievement ?? undefined}
                                achievementId={editingAchievement?.id}
                            />
                        </DrawerContent>
                    </Drawer>
                </div>
            </div>

            {/* Filter and Search Bar */}
            <div className="gsap-fade-up w-full pt-2">
                <div className="relative w-full md:max-w-md">
                    <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input 
                        placeholder="Search achievements..." 
                        className="pl-9 h-10 bg-background"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
            </div>

            <div className="py-10 w-full">
                <DataTable
                    columns={getColumns(handleEditAchievement, handleDeleteSuccess)}
                    data={filteredData}
                />
            </div>
        </div>
    )
}
