"use client";

import { useEffect, useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { Users, Calendar, ShieldCheck, Landmark, Activity, Star, Zap } from "lucide-react";
import { cn } from "@/lib/utils";

interface DashboardStats {
    total_members: number;
    active_members: number;
    inactive_members: number;
    total_roles: number;
    total_organizations: number;
    total_events: number;
    featured_events: number;
}

export default function AdminDashboardPage() {
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        async function fetchDashboardData() {
            try {
                // Fetch stats from the dashboard API
                const statsRes = await fetch("/api/v1/dashboard/stats");
                if (statsRes.ok) {
                    const statsData = await statsRes.json();
                    setStats(statsData);
                }
            } catch (error) {
                console.error("Failed to fetch dashboard data:", error);
            } finally {
                setIsLoading(false);
            }
        }

        fetchDashboardData();
    }, []);

    return (
        <div className="w-full max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500 pb-12">

            {/* Header: Desktop & Mobile responsive according to designs */}
            <div className="space-y-1">
                <p className="hidden md:block text-[10px] font-bold tracking-[0.2em] text-neutral-400 uppercase mb-2">Administrative Hub</p>
                <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-white md:tracking-tighter">
                    <span className="md:hidden">Overview</span>
                    <span className="hidden md:inline">Dashboard Overview</span>
                </h2>
                <p className="md:hidden text-xs text-neutral-400 font-medium mt-1">Management Console • Curator Admin</p>
            </div>

            {/* Uniform Grid - No weird spans */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-5">
                <BentoCard
                    value={stats?.total_members}
                    isLoading={isLoading}
                    icon={<Users className="w-4 h-4 md:w-5 md:h-5 text-neutral-400" />}
                    desktopTitle="Total Members"
                    desktopDesc="Comprehensive count of all registered users within the curation network."
                    mobileTitle={<><Users className="w-4 h-4" /> TOTAL MEMBERS</>}
                />

                <BentoCard
                    value={stats?.active_members}
                    isLoading={isLoading}
                    icon={<Zap className="w-4 h-4 md:w-5 md:h-5 text-neutral-400" />}
                    desktopTitle="Active Members"
                    desktopDesc="Users currently engaged with the platform or with active sessions today."
                    mobileTitle={<><Zap className="w-4 h-4" /> ACTIVE</>}
                />

                <BentoCard
                    value={stats?.total_events}
                    isLoading={isLoading}
                    icon={<Calendar className="w-4 h-4 md:w-5 md:h-5 text-neutral-400" />}
                    desktopTitle="Total Events"
                    desktopDesc="Aggregated exhibitions, private views, and curated social gatherings."
                    mobileTitle={<><Calendar className="w-4 h-4" /> EVENTS</>}
                />

                <BentoCard
                    value={stats?.featured_events}
                    isLoading={isLoading}
                    icon={<Star className="w-4 h-4 md:w-5 md:h-5 text-neutral-400" />}
                    desktopTitle="Featured Events"
                    desktopDesc="High-profile activations currently highlighted on the member landing page."
                    mobileTitle={<><Star className="w-4 h-4" /> FEATURED EVENTS</>}
                    mobileSpecialBg
                />

                <BentoCard
                    value={stats?.total_roles}
                    isLoading={isLoading}
                    icon={<ShieldCheck className="w-4 h-4 md:w-5 md:h-5 text-neutral-400" />}
                    desktopTitle="Total Roles"
                    desktopDesc="Defined permission tier currently configured for system governance."
                    mobileTitle={<><ShieldCheck className="w-4 h-4" /> ROLES</>}
                />

                <BentoCard
                    value={stats?.total_organizations}
                    isLoading={isLoading}
                    icon={<Landmark className="w-4 h-4 md:w-5 md:h-5 text-neutral-400" />}
                    desktopTitle="Organizations"
                    desktopDesc="Parent entity managing the current instance of The Curator."
                    mobileTitle={<><Landmark className="w-4 h-4" /> ORGS</>}
                />
            </div>
        </div>
    );
}

interface BentoCardProps {
    value: number | undefined;
    isLoading: boolean;
    colSpan?: string;
    icon: React.ReactNode;
    badgeText?: string;
    hasLiveDot?: boolean;
    desktopTitle: string;
    desktopDesc: string;
    mobileTitle: React.ReactNode;
    mobileWatermarkIcon?: React.ReactNode;
    desktopWatermarkIcon?: React.ReactNode;
    mobileWatermarkText?: string;
    mobileSpecialBg?: boolean;
}

function BentoCard(props: BentoCardProps) {
    return (
        <div className={cn(
            "bg-[#1A1A1A] rounded-xl border border-white/5 flex flex-col justify-between relative overflow-hidden",
            props.colSpan || "col-span-1"
        )}>

            {/* MOBILE LAYOUT */}
            <div className="flex md:hidden flex-col h-full justify-between z-10 p-4 min-h-[140px]">
                <div className="flex items-center gap-1.5 text-neutral-400 text-xs font-bold tracking-wider">
                    {props.mobileTitle}
                </div>
                <div className="flex items-baseline gap-2 mt-4 z-10">
                    {props.isLoading ? (
                        <Skeleton className="h-10 w-16 bg-neutral-800" />
                    ) : (
                        <span className="text-4xl font-bold tracking-tight text-white">{props.value ?? 0}</span>
                    )}
                </div>

                {/* Mobile Watermarks */}
                {props.mobileWatermarkIcon && (
                    <div className="absolute right-[-10px] top-4 w-20 h-20 opacity-[0.05] text-white pointer-events-none">
                        {props.mobileWatermarkIcon}
                    </div>
                )}
                {props.mobileWatermarkText && (
                    <div className="absolute right-2 top-1/2 -translate-y-1/2 text-[3.5rem] font-black italic tracking-tighter opacity-[0.03] text-white pointer-events-none select-none">
                        {props.mobileWatermarkText}
                    </div>
                )}
            </div>

            {/* DESKTOP LAYOUT */}
            <div className="hidden md:flex flex-col h-full justify-between z-10 p-6 min-h-[220px]">
                {/* Top Row: Icon and Badge */}
                <div className="flex justify-between items-start w-full">
                    <div className="p-2.5 bg-white/5 rounded-lg border border-white/5">
                        {props.icon}
                    </div>
                    {props.badgeText && (
                        <div className="flex items-center gap-1.5 px-2 py-1 bg-white/[0.03] rounded border border-white/10">
                            {props.hasLiveDot && <div className="w-1.5 h-1.5 rounded-full bg-white/80" />}
                            <span className="text-[10px] uppercase tracking-[0.15em] font-bold text-neutral-300">{props.badgeText}</span>
                        </div>
                    )}
                </div>

                {/* Middle: Value and Title */}
                <div className="mt-8 flex flex-col gap-1 z-10">
                    {props.isLoading ? (
                        <Skeleton className="h-12 w-20 bg-neutral-800" />
                    ) : (
                        <span className="text-5xl leading-none font-bold tracking-tight text-white">{props.value ?? 0}</span>
                    )}
                    <span className="text-sm font-medium text-neutral-300 mt-2 tracking-wide">{props.desktopTitle}</span>
                </div>

                {/* Bottom: Description */}
                <p className="mt-6 text-[12px] text-neutral-500 leading-relaxed border-t border-white/10 pt-4 max-w-[95%]">
                    {props.desktopDesc}
                </p>

                {/* Desktop Watermark */}
                {props.desktopWatermarkIcon && (
                    <div className="absolute -right-8 top-1/2 -translate-y-1/2 w-48 h-48 opacity-[0.02] text-foreground pointer-events-none transform -rotate-12">
                        {props.desktopWatermarkIcon}
                    </div>
                )}
            </div>
        </div>
    );
}
