"use client";

import React, { useState, useEffect, useDeferredValue, useTransition, useCallback } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast, Toaster } from "sonner";
import {
  Calendar,
  Search,
  Plus,
  Edit2,
  Trash2,
  Grid,
  List,
  Upload,
  Loader2,
  Image as ImageIcon,
  Star,
  ExternalLink,
  GripHorizontal,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

// Dnd Kit Imports
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  rectSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

// ==========================================
// CONSTANTS
// ==========================================
const PAGE_SIZE = 10;

import { useAdminStore, Event, EventStatus } from "@/lib/adminStore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

// ==========================================
// ZOD VALIDATION SCHEMA
// ==========================================
const eventFormSchema = z.object({
  title: z.string().min(2, "Title must be at least 2 characters"),
  logoUrl: z.string().optional(),
  coverImage: z.string().min(1, "A cover image is required"),
  description: z.string().min(5, "Description must be at least 5 characters"),
  registrationUrl: z.string().url("Must be a valid registration URL").or(z.literal("")).optional(),
  startDate: z.string().min(1, "Start date and time is required"),
  endDate: z.string().min(1, "End date and time is required"),
  status: z.enum(["upcoming", "ongoing", "completed", "cancelled"]),
  isFeatured: z.boolean(),
  isRegistrationOpen: z.boolean(),
  relatedImages: z.array(z.string()),
}).superRefine((data, ctx) => {
  if (!data.startDate || !data.endDate) return;

  const start = new Date(data.startDate);
  const end = new Date(data.endDate);
  const now = new Date();

  // 1. Chronological check
  if (end <= start) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "End date must be after the start date",
      path: ["endDate"],
    });
  }

  // 2. Upcoming status check
  if (data.status === "upcoming" && start <= now) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "An upcoming event's start date must be in the future",
      path: ["startDate"],
    });
  }

  // 3. Ongoing status checks
  if (data.status === "ongoing") {
    if (start > now) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "An ongoing event cannot have a start date in the future",
        path: ["startDate"],
      });
    }
    if (end < now) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "An ongoing event cannot have an end date in the past",
        path: ["endDate"],
      });
    }
  }

  // 4. Completed status check
  if (data.status === "completed" && end > now) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "A completed event's end date must be in the past",
      path: ["endDate"],
    });
  }

  // 5. Registration open check
  if (data.isRegistrationOpen && data.status !== "upcoming") {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Registration can only be open for upcoming events",
      path: ["isRegistrationOpen"],
    });
  }
});

type EventFormValues = z.infer<typeof eventFormSchema>;

// ==========================================
// SORTABLE RELATED IMAGE THUMBNAIL COMPONENT
// ==========================================
interface SortableImageProps {
  url: string;
  onRemove: () => void;
}

function SortableImageItem({ url, onRemove }: SortableImageProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: url });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : "auto",
    opacity: isDragging ? 0.6 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="relative h-20 w-20 rounded-lg overflow-hidden border border-white/10 bg-white/5 group"
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={url} alt="Gallery item" className="h-full w-full object-cover" />

      {/* Drag overlay handle */}
      <div
        {...attributes}
        {...listeners}
        className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center gap-1 transition-opacity cursor-grab active:cursor-grabbing"
      >
        <GripHorizontal className="h-4 w-4 text-white" />
        <span className="text-[9px] text-white/80 font-medium">Reorder</span>
      </div>

      {/* Remove button */}
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onRemove();
        }}
        className="absolute top-1 right-1 h-5 w-5 bg-red-500 rounded-full flex items-center justify-center text-white hover:bg-red-600 transition-colors shadow-lg cursor-pointer opacity-0 group-hover:opacity-100 z-10"
      >
        <span className="text-xs leading-none">&times;</span>
      </button>
    </div>
  );
}

export default function AdminEventsPage() {
  const [mounted, setMounted] = useState(false);
  const [viewMode, setViewMode] = useState<"grid" | "table">("grid");

  // Filter States
  const [statusTab, setStatusTab] = useState<"all" | EventStatus>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const deferredSearchQuery = useDeferredValue(searchQuery);
  const [featuredOnly, setFeaturedOnly] = useState(false);
  const [startDateFilter, setStartDateFilter] = useState("");
  const [endDateFilter, setEndDateFilter] = useState("");

  const [isPending, startTransition] = useTransition();

  // Dialog Controls
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const [deletingEvent, setDeletingEvent] = useState<Event | null>(null);

  // Simulated Cover Upload
  const [isCoverUploading, setIsCoverUploading] = useState(false);
  const [coverProgress, setCoverProgress] = useState(0);
  const [coverPreview, setCoverPreview] = useState("");

  // Logo Upload State
  const [isLogoUploading, setIsLogoUploading] = useState(false);
  const [logoProgress, setLogoProgress] = useState(0);
  const [logoPreview, setLogoPreview] = useState("");
  const [pendingLogoFile, setPendingLogoFile] = useState<File | null>(null);

  // File Upload State
  const [isRelatedUploading, setIsRelatedUploading] = useState(false);
  const [relatedProgress, setRelatedProgress] = useState(0);
  const [pendingCoverFile, setPendingCoverFile] = useState<File | null>(null);
  const [pendingRelatedFiles, setPendingRelatedFiles] = useState<File[]>([]);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);

  // Hydrate Store
  const { events, isLoadingEvents, fetchEvents, addEvent, updateEvent, deleteEvent, uploadFile } = useAdminStore();

  useEffect(() => {
    setMounted(true);
    fetchEvents();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Form Setup
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<EventFormValues>({
    resolver: zodResolver(eventFormSchema),
    defaultValues: {
      title: "",
      logoUrl: "",
      coverImage: "",
      description: "",
      registrationUrl: "",
      startDate: "",
      endDate: "",
      status: "upcoming",
      isFeatured: false,
      isRegistrationOpen: false,
      relatedImages: [],
    },
  });

  const watchIsFeatured = watch("isFeatured");
  const watchIsRegistrationOpen = watch("isRegistrationOpen");
  const watchStatus = watch("status");
  const watchStartDate = watch("startDate");
  const watchEndDate = watch("endDate");
  const watchRelatedImages = watch("relatedImages") || [];

  // Sync Form when Editing
  useEffect(() => {
    if (editingEvent) {
      reset({
        title: editingEvent.title,
        logoUrl: editingEvent.logoUrl || "",
        coverImage: editingEvent.coverImage,
        description: editingEvent.description,
        registrationUrl: editingEvent.registrationUrl || "",
        startDate: editingEvent.startDate.slice(0, 16), // Slice to format YYYY-MM-DDTHH:MM
        endDate: editingEvent.endDate.slice(0, 16),
        status: editingEvent.status,
        isFeatured: editingEvent.isFeatured,
        isRegistrationOpen: editingEvent.isRegistrationOpen,
        relatedImages: editingEvent.relatedImages || [],
      });
      setCoverPreview(editingEvent.coverImage);
      setLogoPreview(editingEvent.logoUrl || "");
    } else {
      reset({
        title: "",
        logoUrl: "",
        coverImage: "",
        description: "",
        registrationUrl: "",
        startDate: "",
        endDate: "",
        status: "upcoming",
        isFeatured: false,
        isRegistrationOpen: false,
        relatedImages: [],
      });
      setCoverPreview("");
      setLogoPreview("");
    }
    setCoverProgress(0);
    setIsCoverUploading(false);
    setLogoProgress(0);
    setIsLogoUploading(false);
    setPendingLogoFile(null);
    setRelatedProgress(0);
    setIsRelatedUploading(false);
    setPendingCoverFile(null);
    setPendingRelatedFiles([]);
  }, [editingEvent, isFormOpen, reset]);

  // Force registration open to false if status is not upcoming
  useEffect(() => {
    if (watchStatus !== "upcoming") {
      setValue("isRegistrationOpen", false);
    }
  }, [watchStatus, setValue]);



  // Cover Photo Selection — stage file and show local preview
  const handleCoverSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const tempUrl = URL.createObjectURL(file);
    setCoverPreview(tempUrl);
    setPendingCoverFile(file);
    setIsCoverUploading(true);
    setCoverProgress(0);
    let progress = 0;
    const interval = setInterval(() => {
      progress += 25;
      setCoverProgress(progress);
      if (progress >= 100) {
        clearInterval(interval);
        setIsCoverUploading(false);
        setValue("coverImage", tempUrl, { shouldValidate: true });
      }
    }, 60);
  };

  // Logo Photo Selection
  const handleLogoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const tempUrl = URL.createObjectURL(file);
    setLogoPreview(tempUrl);
    setPendingLogoFile(file);
    setIsLogoUploading(true);
    setLogoProgress(0);
    let progress = 0;
    const interval = setInterval(() => {
      progress += 25;
      setLogoProgress(progress);
      if (progress >= 100) {
        clearInterval(interval);
        setIsLogoUploading(false);
        setValue("logoUrl", tempUrl, { shouldValidate: true });
      }
    }, 60);
  };

  // Multiple Related Images — stage files and show local previews
  const handleRelatedSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    const newFiles = Array.from(files);
    const newLocalUrls = newFiles.map((f) => URL.createObjectURL(f));
    setPendingRelatedFiles((prev) => [...prev, ...newFiles]);
    setValue("relatedImages", [...watchRelatedImages, ...newLocalUrls], { shouldValidate: true });
    toast.success(`${newFiles.length} image(s) staged for upload.`);
  };

  // Remove related image
  const removeRelatedImage = (urlToRemove: string) => {
    setValue(
      "relatedImages",
      watchRelatedImages.filter((url) => url !== urlToRemove),
      { shouldValidate: true }
    );
  };

  // DND Keyboard & Pointer Sensors
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // Require drag movement before initiating reorder
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Drag End Handler
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = watchRelatedImages.indexOf(active.id as string);
    const newIndex = watchRelatedImages.indexOf(over.id as string);

    const reordered = arrayMove(watchRelatedImages, oldIndex, newIndex);
    setValue("relatedImages", reordered, { shouldValidate: true });
  };

  // Submit: upload staged files first, then save event
  const onSubmit = useCallback(
    async (data: EventFormValues) => {
      startTransition(async () => {
        try {
          let finalCoverUrl = data.coverImage;
          let finalLogoUrl = data.logoUrl;
          let finalRelatedUrls = data.relatedImages;

          // Upload cover if a new file was staged
          if (pendingCoverFile) {
            setIsCoverUploading(true);
            finalCoverUrl = await uploadFile(pendingCoverFile, "events/covers");
            setIsCoverUploading(false);
          }

          // Upload logo if a new file was staged
          if (pendingLogoFile) {
            setIsLogoUploading(true);
            finalLogoUrl = await uploadFile(pendingLogoFile, "events/logos");
            setIsLogoUploading(false);
          }

          // Upload any staged related images, replacing local blob URLs with CDN URLs
          if (pendingRelatedFiles.length > 0) {
            setIsRelatedUploading(true);
            const uploadedUrls = await Promise.all(
              pendingRelatedFiles.map((f) => uploadFile(f, "events/gallery"))
            );
            // Replace blob:// URLs with real CDN URLs while preserving order
            let uploadedIdx = 0;
            finalRelatedUrls = finalRelatedUrls.map((url) => {
              if (url.startsWith("blob:")) {
                return uploadedUrls[uploadedIdx++] ?? url;
              }
              return url;
            });
            setIsRelatedUploading(false);
          }

          const formattedData = {
            ...data,
            coverImage: finalCoverUrl,
            logoUrl: finalLogoUrl,
            relatedImages: finalRelatedUrls,
            startDate: new Date(data.startDate).toISOString(),
            endDate: new Date(data.endDate).toISOString(),
          };

          if (editingEvent) {
            await updateEvent(editingEvent.id, formattedData);
            toast.success(`Updated event: ${data.title}`);
          } else {
            await addEvent(formattedData);
            toast.success(`Created event: ${data.title}`);
          }
          setIsFormOpen(false);
          setEditingEvent(null);
          setPendingCoverFile(null);
          setPendingLogoFile(null);
          setPendingRelatedFiles([]);
        } catch (err) {
          console.error(err);
          toast.error("Failed to save event. Check console for details.");
          setIsCoverUploading(false);
          setIsLogoUploading(false);
          setIsRelatedUploading(false);
        }
      });
    },
    [pendingCoverFile, pendingLogoFile, pendingRelatedFiles, editingEvent, uploadFile, updateEvent, addEvent]
  );

  // Delete Action
  const handleDeleteConfirm = async () => {
    if (deletingEvent) {
      try {
        await deleteEvent(deletingEvent.id);
        toast.success(`Deleted event: ${deletingEvent.title}`);
        setDeletingEvent(null);
      } catch {
        toast.error("Failed to delete event.");
      }
    }
  };

  // ---- CLIENT-SIDE FILTERING ----
  const filteredEvents = events.filter((e) => {
    // 1. Status Filter
    if (statusTab !== "all" && e.status !== statusTab) return false;

    // 2. Featured Filter
    if (featuredOnly && !e.isFeatured) return false;

    // 3. Search Query
    if (
      deferredSearchQuery &&
      !e.title.toLowerCase().includes(deferredSearchQuery.toLowerCase()) &&
      !e.description.toLowerCase().includes(deferredSearchQuery.toLowerCase())
    ) {
      return false;
    }

    // 4. Date Range Filter
    if (startDateFilter) {
      const filterStart = new Date(startDateFilter);
      const eventStart = new Date(e.startDate);
      if (eventStart < filterStart) return false;
    }
    if (endDateFilter) {
      const filterEnd = new Date(endDateFilter);
      const eventEnd = new Date(e.endDate);
      if (eventEnd > filterEnd) return false;
    }

    return true;
  });

  // ---- PAGINATION ----
  const totalPages = Math.ceil(filteredEvents.length / PAGE_SIZE);
  const paginatedEvents = filteredEvents.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  );

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [deferredSearchQuery, statusTab, featuredOnly, startDateFilter, endDateFilter]);

  // Helper date formatter
  const formatDate = (isoString: string) => {
    const d = new Date(isoString);
    return d.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Status badge style helper
  const getStatusBadge = (status: EventStatus) => {
    const styles: Record<EventStatus, string> = {
      upcoming: "bg-blue-500/10 text-blue-400 border-blue-500/20",
      ongoing: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
      completed: "bg-white/10 text-white/60 border-white/10",
      cancelled: "bg-red-500/10 text-red-400 border-red-500/20",
    };
    return (
      <span className={`px-2 py-0.5 rounded-full text-[11px] font-semibold font-secondary border uppercase tracking-wider ${styles[status]}`}>
        {status}
      </span>
    );
  };

  // Hydration / loading state
  if (!mounted || isLoadingEvents) {
    return (
      <div className="flex h-96 items-center justify-center flex-col gap-3">
        <Loader2 className="h-8 w-8 animate-spin text-white/50" />
        <p className="text-white/30 text-sm font-secondary">Loading events from database...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Toaster theme="dark" closeButton position="top-right" />

      {/* Header and Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-primary text-2xl font-bold tracking-wider uppercase text-white">
            Events Manager
          </h1>
          <p className="font-secondary text-sm text-white/50">
            Publish, schedule, and showcase summits, hackathons, and webinars.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Grid/Table View Toggle */}
          <div className="flex bg-[#0E0E0E] rounded-lg p-0.5 border border-white/5">
            <button
              onClick={() => setViewMode("grid")}
              className={`p-1.5 rounded-md text-white/50 hover:text-white cursor-pointer ${
                viewMode === "grid" ? "bg-white/5 text-white" : ""
              }`}
              title="Card Grid view"
            >
              <Grid className="h-4 w-4" />
            </button>
            <button
              onClick={() => setViewMode("table")}
              className={`p-1.5 rounded-md text-white/50 hover:text-white cursor-pointer ${
                viewMode === "table" ? "bg-white/5 text-white" : ""
              }`}
              title="Table view"
            >
              <List className="h-4 w-4" />
            </button>
          </div>

          <Button
            onClick={() => {
              setEditingEvent(null);
              setIsFormOpen(true);
            }}
            className="bg-white text-black hover:bg-white/90 font-secondary font-semibold cursor-pointer flex items-center gap-1.5"
          >
            <Plus className="h-4 w-4" />
            Add Event
          </Button>
        </div>
      </div>

      {/* Filter Tabs Row */}
      <div className="flex border-b border-white/5 gap-4 overflow-x-auto pb-px">
        {(["all", "upcoming", "ongoing", "completed", "cancelled"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setStatusTab(tab)}
            className={`font-secondary text-sm pb-3 px-1 border-b-2 capitalize transition-all shrink-0 cursor-pointer ${
              statusTab === tab
                ? "border-white text-white font-semibold"
                : "border-transparent text-white/50 hover:text-white/80"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Advanced Filter Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 p-4 bg-[#0E0E0E] rounded-xl border border-white/5">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-white/40" />
          <Input
            type="text"
            placeholder="Search by title..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 bg-[#161616] border-white/5 text-white placeholder-white/30 focus:bg-[#161616] focus-visible:bg-[#161616] focus-visible:ring-white/20 focus-visible:border-white/20"
          />
        </div>

        {/* Start Date Filter */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-white/40 font-secondary shrink-0 font-medium">From</span>
          <Input
            type="date"
            value={startDateFilter}
            onChange={(e) => setStartDateFilter(e.target.value)}
            className="bg-[#161616] border-white/5 text-white text-xs focus:bg-[#161616] focus-visible:bg-[#161616] focus-visible:ring-white/20 focus-visible:border-white/20"
          />
        </div>

        {/* End Date Filter */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-white/40 font-secondary shrink-0 font-medium">To</span>
          <Input
            type="date"
            value={endDateFilter}
            onChange={(e) => setEndDateFilter(e.target.value)}
            className="bg-[#161616] border-white/5 text-white text-xs focus:bg-[#161616] focus-visible:bg-[#161616] focus-visible:ring-white/20 focus-visible:border-white/20"
          />
        </div>

        {/* Featured Filter (Switch Toggle) */}
        <div className="flex items-center justify-between lg:justify-end gap-3">
          <span className="text-xs text-white/60 font-secondary font-medium">Featured Only</span>
          <Switch checked={featuredOnly} onCheckedChange={setFeaturedOnly} />
        </div>
      </div>

      {/* Grid or Table Render */}
      {filteredEvents.length > 0 ? (
        <div className="space-y-4">
        {viewMode === "grid" ? (
          /* GRID VIEW */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {paginatedEvents.map((event: Event) => (
              <div
                key={event.id}
                className="group relative flex flex-col rounded-xl border border-white/5 bg-[#0F0F0F] overflow-hidden hover:border-white/10 transition-all duration-300"
              >
                {/* Featured Badge */}
                {event.isFeatured && (
                  <div className="absolute top-3 right-3 z-10 bg-black/70 border border-amber-500/20 text-amber-400 rounded-md p-1.5 flex items-center justify-center backdrop-blur-md">
                    <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                  </div>
                )}

                {/* Event Cover */}
                <div className="relative h-44 w-full bg-white/5 overflow-hidden">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={event.coverImage}
                    alt={event.title}
                    className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />
                  <div className="absolute bottom-3 left-3 flex items-center gap-2">
                    {getStatusBadge(event.status)}
                  </div>
                </div>

                {/* Event Info */}
                <div className="flex-1 p-5 space-y-3 flex flex-col justify-between">
                  <div className="space-y-2">
                    <h3 className="font-secondary text-base font-bold text-white leading-snug group-hover:text-white/95">
                      {event.title}
                    </h3>
                    <p className="text-[11px] font-secondary text-white/40 flex items-center gap-1.5">
                      <Calendar className="h-3 w-3" />
                      <span>{formatDate(event.startDate)}</span>
                    </p>
                    <p className="font-secondary text-xs text-white/55 line-clamp-3 leading-relaxed">
                      {event.description}
                    </p>
                  </div>

                  {/* Actions Bar */}
                  <div className="pt-3 border-t border-white/5 flex items-center justify-between">
                    <div>
                      {event.registrationUrl ? (
                        <a
                          href={event.registrationUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="text-[11px] font-secondary text-white/50 hover:text-white flex items-center gap-1"
                        >
                          Registration URL
                          <ExternalLink className="h-2.5 w-2.5" />
                        </a>
                      ) : (
                        <span className="text-[11px] font-secondary text-white/20">No link</span>
                      )}
                    </div>

                    <div className="flex items-center gap-1.5">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          setEditingEvent(event);
                          setIsFormOpen(true);
                        }}
                        className="h-8 w-8 hover:bg-white/5 hover:text-white text-white/50 cursor-pointer animate-all"
                      >
                        <Edit2 className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setDeletingEvent(event)}
                        className="h-8 w-8 hover:bg-red-500/10 hover:text-red-400 text-white/50 cursor-pointer animate-all"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* TABLE VIEW */
          <div className="border border-white/5 rounded-xl bg-[#0E0E0E] overflow-hidden">
            <Table>
              <TableHeader className="bg-[#121212] border-b border-white/5">
                <TableRow className="border-b border-white/5">
                  <TableHead className="text-white/55 font-secondary">Event Title</TableHead>
                  <TableHead className="text-white/55 font-secondary">Status</TableHead>
                  <TableHead className="text-white/55 font-secondary">Schedule Start</TableHead>
                  <TableHead className="text-white/55 font-secondary">Featured</TableHead>
                  <TableHead className="w-24 text-right text-white/55 font-secondary">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedEvents.map((event: Event) => (
                  <TableRow key={event.id} className="border-b border-white/5 hover:bg-white/5">
                    <TableCell className="font-secondary font-semibold text-white max-w-xs truncate">
                      {event.title}
                    </TableCell>
                    <TableCell>{getStatusBadge(event.status)}</TableCell>
                    <TableCell className="font-secondary text-white/70 text-xs">
                      {formatDate(event.startDate)}
                    </TableCell>
                    <TableCell>
                      {event.isFeatured ? (
                        <span className="text-amber-400 flex items-center gap-1 text-xs font-semibold">
                          <Star className="h-3 w-3 fill-amber-400" /> Yes
                        </span>
                      ) : (
                        <span className="text-white/30 text-xs">No</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            setEditingEvent(event);
                            setIsFormOpen(true);
                          }}
                          className="h-8 w-8 hover:bg-white/5 hover:text-white text-white/50 cursor-pointer"
                        >
                          <Edit2 className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setDeletingEvent(event)}
                          className="h-8 w-8 hover:bg-red-500/10 hover:text-red-400 text-white/50 cursor-pointer"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-1">
            <p className="text-xs font-secondary text-white/40">
              Page {currentPage} of {totalPages} &nbsp;&middot;&nbsp; {filteredEvents.length} results
            </p>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="h-8 w-8 text-white/50 hover:text-white hover:bg-white/5 disabled:opacity-30 cursor-pointer"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter((p) => p === 1 || p === totalPages || Math.abs(p - currentPage) <= 1)
                .reduce<(number | "...")[]>((acc, p, idx, arr) => {
                  if (idx > 0 && p - (arr[idx - 1] as number) > 1) acc.push("...");
                  acc.push(p);
                  return acc;
                }, [])
                .map((item, idx) =>
                  item === "..." ? (
                    <span key={`ellipsis-${idx}`} className="text-white/30 text-xs px-1">…</span>
                  ) : (
                    <button
                      key={item}
                      onClick={() => setCurrentPage(item as number)}
                      className={`h-8 w-8 rounded-lg text-xs font-secondary font-medium cursor-pointer transition-all ${
                        currentPage === item ? "bg-white text-black" : "text-white/50 hover:text-white hover:bg-white/5"
                      }`}
                    >
                      {item}
                    </button>
                  )
                )}
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="h-8 w-8 text-white/50 hover:text-white hover:bg-white/5 disabled:opacity-30 cursor-pointer"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
        </div>
      ) : (
        /* Empty State */
        <div className="rounded-xl border border-dashed border-white/10 bg-[#0E0E0E] p-16 text-center flex flex-col items-center justify-center">
          <div className="h-12 w-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mb-4 text-white/40">
            <Calendar className="h-6 w-6" />
          </div>
          <h3 className="font-secondary text-base font-semibold text-white/80">No events found</h3>
          <p className="font-secondary text-sm text-white/40 mt-1 max-w-sm">
            Try adjusting your search query, selecting a different status tab, or creating a new event.
          </p>
          <Button
            onClick={() => {
              setEditingEvent(null);
              setIsFormOpen(true);
            }}
            className="mt-6 bg-white text-black hover:bg-white/90 font-secondary font-semibold cursor-pointer"
          >
            Add Event
          </Button>
        </div>
      )}

      {/* ==========================================
          ADD/EDIT EVENT MODAL DIALOG
          ========================================== */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="max-w-xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingEvent ? "Edit Event details" : "Add New Event"}</DialogTitle>
            <DialogDescription>
              Deploy and schedule innovation initiatives on the Catalyst platform.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 font-secondary py-2">
            {/* Title Input */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-white/70">Event Title</label>
              <Input
                type="text"
                placeholder="IoT Masterclass 2026"
                {...register("title")}
                className="bg-[#141414] border-white/10 text-white focus:bg-[#141414] focus-visible:bg-[#141414] focus-visible:ring-white/20 focus-visible:border-white/20"
              />
              {errors.title && (
                <p className="text-[11px] text-red-400 font-semibold">{errors.title.message}</p>
              )}
            </div>

            {/* Description Textarea */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-white/70">Description</label>
              <textarea
                placeholder="Write a brief overview of the event, itinerary, and targets..."
                rows={3}
                {...register("description")}
                className="w-full bg-[#141414] border border-white/10 text-white rounded-md p-3 text-sm focus:outline-none focus:border-white/20 focus:ring-1 focus:ring-white/20 placeholder-white/30"
              />
              {errors.description && (
                <p className="text-[11px] text-red-400 font-semibold">{errors.description.message}</p>
              )}
            </div>

            {/* Registration URL */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-white/70">Registration Link (Optional)</label>
              <Input
                type="text"
                placeholder="https://..."
                {...register("registrationUrl")}
                className="bg-[#141414] border-white/10 text-white focus:bg-[#141414] focus-visible:bg-[#141414] focus-visible:ring-white/20 focus-visible:border-white/20"
              />
              {errors.registrationUrl && (
                <p className="text-[11px] text-red-400 font-semibold">{errors.registrationUrl.message}</p>
              )}
            </div>

            {/* Start & End Dates Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-white/70">Start Date & Time</label>
                <Input
                  type="datetime-local"
                  {...register("startDate")}
                  className="bg-[#141414] border-white/10 text-xs text-white focus:bg-[#141414] focus-visible:bg-[#141414] focus-visible:ring-white/20 focus-visible:border-white/20"
                />
                {errors.startDate && (
                  <p className="text-[11px] text-red-400 font-semibold">{errors.startDate.message}</p>
                )}
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-white/70">End Date & Time</label>
                <Input
                  type="datetime-local"
                  {...register("endDate")}
                  className="bg-[#141414] border-white/10 text-xs text-white focus:bg-[#141414] focus-visible:bg-[#141414] focus-visible:ring-white/20 focus-visible:border-white/20"
                />
                {errors.endDate && (
                  <p className="text-[11px] text-red-400 font-semibold">{errors.endDate.message}</p>
                )}
              </div>
            </div>

            {/* Status & Featured & Registration Row */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-start">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-white/70">Event Status</label>
                <select
                  {...register("status")}
                  className="w-full bg-[#141414] border border-white/10 text-white rounded-md p-2 text-sm focus:outline-none focus:border-white/20 focus:ring-1 focus:ring-white/20"
                >
                  <option value="upcoming">Upcoming</option>
                  <option value="ongoing">Ongoing</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
                {errors.status && (
                  <p className="text-[11px] text-red-400 font-semibold">{errors.status.message}</p>
                )}
              </div>

              <div className="flex items-center justify-between sm:justify-end gap-3 pt-2">
                <span className="text-xs font-semibold text-white/70">Featured</span>
                <Switch
                  checked={watchIsFeatured}
                  onCheckedChange={(val) => setValue("isFeatured", val)}
                />
              </div>

              <div className="space-y-1 flex flex-col justify-center pt-2">
                <div className="flex items-center justify-between sm:justify-end gap-3 w-full">
                  <span className="text-xs font-semibold text-white/70">Registration Open</span>
                  <Switch
                    checked={watchIsRegistrationOpen}
                    onCheckedChange={(val) => setValue("isRegistrationOpen", val)}
                    disabled={watchStatus !== "upcoming"}
                  />
                </div>
                {errors.isRegistrationOpen && (
                  <p className="text-[11px] text-red-400 font-semibold text-right w-full">{errors.isRegistrationOpen.message}</p>
                )}
              </div>
            </div>

            {/* Logo Image Upload (Simulated progress) */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-white/70">Event Logo (Optional)</label>
              <div className="flex gap-4 items-center p-3 bg-[#141414] rounded-lg border border-white/10">
                <div className="relative h-20 w-20 shrink-0 rounded-md border border-white/10 bg-white/5 flex items-center justify-center overflow-hidden">
                  {logoPreview ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={logoPreview} alt="Logo Preview" className="h-full w-full object-contain p-1" />
                  ) : (
                    <ImageIcon className="h-6 w-6 text-white/20" />
                  )}
                  {isLogoUploading && (
                    <div className="absolute inset-0 bg-black/60 flex items-center justify-center text-xs font-bold text-white">
                      {logoProgress}%
                    </div>
                  )}
                </div>

                <div className="flex-1 space-y-2">
                  <input
                    type="file"
                    accept="image/*"
                    id="logo-upload-file"
                    onChange={handleLogoSelect}
                    disabled={isLogoUploading}
                    className="hidden"
                  />
                  <label
                    htmlFor="logo-upload-file"
                    className={`inline-flex items-center gap-1.5 px-3 py-2 bg-white/5 border border-white/10 hover:bg-white/10 rounded-lg text-xs font-medium text-white/80 cursor-pointer ${
                      isLogoUploading ? "pointer-events-none opacity-50" : ""
                    }`}
                  >
                    <Upload className="h-3 w-3" />
                    Upload Logo
                  </label>
                  {isLogoUploading && (
                    <div className="w-full bg-white/10 h-1 rounded-full overflow-hidden">
                      <div className="bg-white h-full" style={{ width: `${logoProgress}%` }} />
                    </div>
                  )}
                </div>
              </div>
              {errors.logoUrl && (
                <p className="text-[11px] text-red-400 font-semibold">{errors.logoUrl.message}</p>
              )}
            </div>

            {/* Cover Image Upload (Simulated progress) */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-white/70">Cover Image</label>
              <div className="flex gap-4 items-center p-3 bg-[#141414] rounded-lg border border-white/10">
                <div className="relative h-20 w-32 shrink-0 rounded-md border border-white/10 bg-white/5 flex items-center justify-center overflow-hidden">
                  {coverPreview ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={coverPreview} alt="Cover Preview" className="h-full w-full object-cover" />
                  ) : (
                    <ImageIcon className="h-6 w-6 text-white/20" />
                  )}
                  {isCoverUploading && (
                    <div className="absolute inset-0 bg-black/60 flex items-center justify-center text-xs font-bold text-white">
                      {coverProgress}%
                    </div>
                  )}
                </div>

                <div className="flex-1 space-y-2">
                  <input
                    type="file"
                    accept="image/*"
                    id="cover-upload-file"
                    onChange={handleCoverSelect}
                    disabled={isCoverUploading}
                    className="hidden"
                  />
                  <label
                    htmlFor="cover-upload-file"
                    className={`inline-flex items-center gap-1.5 px-3 py-2 bg-white/5 border border-white/10 hover:bg-white/10 rounded-lg text-xs font-medium text-white/80 cursor-pointer ${
                      isCoverUploading ? "pointer-events-none opacity-50" : ""
                    }`}
                  >
                    <Upload className="h-3 w-3" />
                    Upload Cover
                  </label>
                  {isCoverUploading && (
                    <div className="w-full bg-white/10 h-1 rounded-full overflow-hidden">
                      <div className="bg-white h-full" style={{ width: `${coverProgress}%` }} />
                    </div>
                  )}
                </div>
              </div>
              {errors.coverImage && (
                <p className="text-[11px] text-red-400 font-semibold">{errors.coverImage.message}</p>
              )}
            </div>

            {/* Multiple Related Images (Dnd Kit Sortable list) */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-white/70">Gallery / Related Images (Drag to Sort)</label>
              
              <div className="p-3 bg-[#141414] rounded-lg border border-white/10 space-y-3">
                {/* Upload Button */}
                <div className="flex items-center justify-between">
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    id="related-upload-files"
                    onChange={handleRelatedSelect}
                    disabled={isRelatedUploading}
                    className="hidden"
                  />
                  <label
                    htmlFor="related-upload-files"
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 bg-white/5 border border-white/10 hover:bg-white/10 rounded-lg text-xs font-medium text-white/80 cursor-pointer ${
                      isRelatedUploading ? "pointer-events-none opacity-50" : ""
                    }`}
                  >
                    <Upload className="h-3 w-3" />
                    Add Images to Gallery
                  </label>
                  
                  {isRelatedUploading && (
                    <span className="text-[10px] text-white/50 animate-pulse">Uploading... {relatedProgress}%</span>
                  )}
                </div>

                {isRelatedUploading && (
                  <div className="w-full bg-white/10 h-1 rounded-full overflow-hidden">
                    <div className="bg-white h-full" style={{ width: `${relatedProgress}%` }} />
                  </div>
                )}

                {/* Drag and Drop Container */}
                <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                  <SortableContext items={watchRelatedImages} strategy={rectSortingStrategy}>
                    <div className="flex flex-wrap gap-2.5 min-h-[5rem] items-center p-2 rounded border border-white/5 bg-black/20">
                      {watchRelatedImages.length > 0 ? (
                        watchRelatedImages.map((url) => (
                          <SortableImageItem
                            key={url}
                            url={url}
                            onRemove={() => removeRelatedImage(url)}
                          />
                        ))
                      ) : (
                        <div className="text-[11px] text-white/20 italic mx-auto">
                          No related images uploaded. Add some above.
                        </div>
                      )}
                    </div>
                  </SortableContext>
                </DndContext>
              </div>
            </div>

            {/* Dialog Footer Actions */}
            <DialogFooter className="pt-4 border-t border-white/5">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsFormOpen(false)}
                className="bg-transparent border-white/10 hover:bg-white/5 text-white/80 cursor-pointer"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting || isPending || isCoverUploading || isRelatedUploading}
                className="bg-white text-black hover:bg-white/90 font-semibold cursor-pointer"
              >
                {(isSubmitting || isPending) && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {editingEvent ? "Save Changes" : "Deploy Event"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* ==========================================
          DELETE CONFIRMATION ALERT DIALOG
          ========================================== */}
      <AlertDialog open={deletingEvent !== null} onOpenChange={(open) => !open && setDeletingEvent(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action will permanently delete <span className="font-semibold text-white">{deletingEvent?.title}</span>. 
              This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="cursor-pointer">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              className="bg-red-500 text-white hover:bg-red-600 focus:ring-red-500 cursor-pointer"
            >
              Delete Event
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
