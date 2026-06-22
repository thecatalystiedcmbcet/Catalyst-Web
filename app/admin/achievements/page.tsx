"use client";

import React, { useState, useEffect, useDeferredValue, useTransition, useCallback } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast, Toaster } from "sonner";
import {
  Award,
  Search,
  Plus,
  Edit2,
  Trash2,
  Calendar,
  Upload,
  Loader2,
  Image as ImageIcon,
  Building,
  ChevronLeft,
  ChevronRight,
  Star,
} from "lucide-react";

import { useAdminStore, Achievement } from "@/lib/adminStore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
const achievementFormSchema = z.object({
  title: z.string().min(2, "Title must be at least 2 characters"),
  image: z.string().min(1, "An image is required"),
  description: z.string().min(5, "Description must be at least 5 characters"),
  date: z.string().min(1, "Date is required"),
  organisation: z.string().min(1, "Organisation is required"),
  isFeatured: z.boolean(),
});

// ==========================================
// CONSTANTS
// ==========================================
const PAGE_SIZE = 9;

type AchievementFormValues = z.infer<typeof achievementFormSchema>;

export default function AdminAchievementsPage() {
  const [mounted, setMounted] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const deferredSearchQuery = useDeferredValue(searchQuery);
  const [orgFilter, setOrgFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);

  const [isPending, startTransition] = useTransition();

  // Dialog Controls
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingAchievement, setEditingAchievement] = useState<Achievement | null>(null);
  const [deletingAchievement, setDeletingAchievement] = useState<Achievement | null>(null);

  // Dynamic Organisation UI states
  const [isAddingNewOrg, setIsAddingNewOrg] = useState(false);
  const [newOrgName, setNewOrgName] = useState("");

  // Simulated Image Upload States
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [imagePreview, setImagePreview] = useState("");
  const [pendingFile, setPendingFile] = useState<File | null>(null);

  // Hydrate Store
  const {
    achievements,
    organisations,
    isLoadingAchievements,
    fetchAchievements,
    addAchievement,
    updateAchievement,
    deleteAchievement,
    addOrganisation,
    uploadFile,
  } = useAdminStore();

  useEffect(() => {
    setMounted(true);
    fetchAchievements();
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
  } = useForm<AchievementFormValues>({
    resolver: zodResolver(achievementFormSchema),
    defaultValues: {
      title: "",
      image: "",
      description: "",
      date: "",
      organisation: "",
      isFeatured: false,
    },
  });

  const watchOrganisation = watch("organisation");

  // Sync Form when Editing
  useEffect(() => {
    if (editingAchievement) {
      reset({
        title: editingAchievement.title,
        image: editingAchievement.image,
        description: editingAchievement.description,
        date: editingAchievement.date.slice(0, 10), // Extract YYYY-MM-DD
        organisation: editingAchievement.organisation,
        isFeatured: editingAchievement.isFeatured,
      });
      setImagePreview(editingAchievement.image);
    } else {
      reset({
        title: "",
        image: "",
        description: "",
        date: "",
        organisation: "",
        isFeatured: false,
      });
      setImagePreview("");
    }
    setNewOrgName("");
    setIsAddingNewOrg(false);
    setUploadProgress(0);
    setIsUploading(false);
    setPendingFile(null);
  }, [editingAchievement, isFormOpen, reset]);

  // Handle Dynamic Select changes
  const handleOrgChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    if (val === "__ADD_NEW__") {
      setIsAddingNewOrg(true);
      setValue("organisation", "");
    } else {
      setIsAddingNewOrg(false);
      setValue("organisation", val, { shouldValidate: true });
    }
  };

  // Add custom Organisation inline
  const handleAddNewOrgSubmit = () => {
    const trimmed = newOrgName.trim();
    if (!trimmed) return;

    addOrganisation(trimmed);
    setValue("organisation", trimmed, { shouldValidate: true });
    setIsAddingNewOrg(false);
    setNewOrgName("");
    toast.success(`Added "${trimmed}" to organisation list!`);
  };

  // Photo Selection — stage file and show local preview
  const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const tempUrl = URL.createObjectURL(file);
    setImagePreview(tempUrl);
    setPendingFile(file);
    setIsUploading(true);
    setUploadProgress(0);
    let progress = 0;
    const interval = setInterval(() => {
      progress += 25;
      setUploadProgress(progress);
      if (progress >= 100) {
        clearInterval(interval);
        setIsUploading(false);
        setValue("image", tempUrl, { shouldValidate: true });
      }
    }, 60);
  };

  // Submit Actions
  const onSubmit: import("react-hook-form").SubmitHandler<AchievementFormValues> = useCallback(
    async (data: AchievementFormValues) => {
      startTransition(async () => {
        try {
          let finalImage = data.image;
          if (pendingFile) {
            setIsUploading(true);
            finalImage = await uploadFile(pendingFile, "achievements");
            setIsUploading(false);
          }
          const formattedData = {
            ...data,
            image: finalImage,
            date: new Date(data.date).toISOString(),
          };
          if (editingAchievement) {
            await updateAchievement(editingAchievement.id, formattedData);
            toast.success(`Updated achievement: ${data.title}`);
          } else {
            await addAchievement(formattedData);
            toast.success(`Added achievement: ${data.title}`);
          }
          setIsFormOpen(false);
          setEditingAchievement(null);
          setPendingFile(null);
        } catch (err) {
          console.error(err);
          toast.error("Failed to save achievement.");
          setIsUploading(false);
        }
      });
    },
    [pendingFile, editingAchievement, uploadFile, updateAchievement, addAchievement]
  );

  const handleDeleteConfirm = async () => {
    if (deletingAchievement) {
      try {
        await deleteAchievement(deletingAchievement.id);
        toast.success(`Removed achievement: ${deletingAchievement.title}`);
        setDeletingAchievement(null);
      } catch {
        toast.error("Failed to delete achievement.");
      }
    }
  };

  // Filtering
  const filteredAchievements = achievements.filter((ach) => {
    // 1. Search Query
    if (
      deferredSearchQuery &&
      !ach.title.toLowerCase().includes(deferredSearchQuery.toLowerCase()) &&
      !ach.description.toLowerCase().includes(deferredSearchQuery.toLowerCase())
    ) {
      return false;
    }

    // 2. Organisation Filter
    if (orgFilter !== "all" && ach.organisation !== orgFilter) {
      return false;
    }

    return true;
  });

  // ---- PAGINATION ----
  const totalPages = Math.ceil(filteredAchievements.length / PAGE_SIZE);
  const paginatedAchievements = filteredAchievements.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [deferredSearchQuery, orgFilter]);

  const formatDate = (isoString: string) => {
    const d = new Date(isoString);
    return d.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  if (!mounted || isLoadingAchievements) {
    return (
      <div className="flex h-96 items-center justify-center flex-col gap-3">
        <Loader2 className="h-8 w-8 animate-spin text-white/50" />
        <p className="text-white/30 text-sm font-secondary">Loading achievements from database...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fadeIn">
      <Toaster theme="dark" closeButton position="top-right" />

      {/* Header Panel */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-primary text-2xl font-bold tracking-wider uppercase text-white">
            Achievements Board
          </h1>
          <p className="font-secondary text-sm text-white/50">
            Publish startup recognitions, hackathon accomplishments, and cell rewards.
          </p>
        </div>
        <Button
          onClick={() => {
            setEditingAchievement(null);
            setIsFormOpen(true);
          }}
          className="bg-white text-black hover:bg-white/90 font-secondary font-semibold shrink-0 cursor-pointer flex items-center gap-1.5"
        >
          <Plus className="h-4 w-4" />
          Add Achievement
        </Button>
      </div>

      {/* Search & Filter Header Panel */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-[#0E0E0E] rounded-xl border border-white/5 items-center">
        {/* Search */}
        <div className="relative md:col-span-2">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-white/40" />
          <Input
            type="text"
            placeholder="Search by title or description..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 bg-[#161616] border-white/5 text-white placeholder-white/30 focus:bg-[#161616] focus-visible:bg-[#161616] focus-visible:ring-white/20 focus-visible:border-white/20"
          />
        </div>

        {/* Organisation Filter */}
        <select
          value={orgFilter}
          onChange={(e) => setOrgFilter(e.target.value)}
          className="w-full bg-[#161616] border border-white/5 text-white rounded-md p-2 text-sm focus:outline-none focus:border-white/20 focus:ring-1 focus:ring-white/20"
        >
          <option value="all">All Organisations</option>
          {organisations.map((org) => (
            <option key={org} value={org}>
              {org}
            </option>
          ))}
        </select>
      </div>

      {/* Card Grid Layout */}
      {filteredAchievements.length > 0 ? (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {paginatedAchievements.map((ach: Achievement) => (
            <div
              key={ach.id}
              className="group relative flex flex-col rounded-xl border border-white/5 bg-[#0F0F0F] overflow-hidden hover:border-white/10 transition-all duration-300"
            >
              {/* Card Photo */}
              <div className="relative h-48 w-full bg-white/5 overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={ach.image}
                  alt={ach.title}
                  className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />
                <div className="absolute bottom-3 left-3 flex items-center gap-2">
                  <div className="flex items-center gap-1.5 bg-black/60 border border-white/10 px-2 py-1 rounded-md text-[10px] text-white/80 font-medium font-secondary uppercase tracking-wider backdrop-blur-md">
                    <Building className="h-3 w-3" />
                    {ach.organisation}
                  </div>
                  {ach.isFeatured && (
                    <div className="flex items-center gap-1 bg-yellow-500/20 border border-yellow-500/30 px-2 py-1 rounded-md text-[10px] text-yellow-400 font-medium font-secondary uppercase tracking-wider backdrop-blur-md">
                      <Star className="h-3 w-3 fill-yellow-400" />
                      Featured
                    </div>
                  )}
                </div>
              </div>

              {/* Card Contents */}
              <div className="flex-1 p-5 space-y-3 flex flex-col justify-between">
                <div className="space-y-2">
                  <h3 className="font-secondary text-base font-bold text-white leading-snug group-hover:text-white/95">
                    {ach.title}
                  </h3>
                  <p className="text-[11px] font-secondary text-white/40 flex items-center gap-1.5">
                    <Calendar className="h-3 w-3" />
                    <span>{formatDate(ach.date)}</span>
                  </p>
                  <p className="font-secondary text-xs text-white/55 line-clamp-3 leading-relaxed">
                    {ach.description}
                  </p>
                </div>

                {/* Actions */}
                <div className="pt-3 border-t border-white/5 flex items-center justify-end gap-1.5">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                      setEditingAchievement(ach);
                      setIsFormOpen(true);
                    }}
                    className="h-8 w-8 hover:bg-white/5 hover:text-white text-white/50 cursor-pointer animate-all"
                  >
                    <Edit2 className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setDeletingAchievement(ach)}
                    className="h-8 w-8 hover:bg-red-500/10 hover:text-red-400 text-white/50 cursor-pointer animate-all"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
          </div>

          {totalPages > 1 && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-white/5 font-secondary text-sm">
              <span className="text-white/40">
                Showing {(currentPage - 1) * PAGE_SIZE + 1} to{" "}
                {Math.min(currentPage * PAGE_SIZE, filteredAchievements.length)} of{" "}
                {filteredAchievements.length} achievements
              </span>
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="h-8 w-8 text-white/50 hover:text-white hover:bg-white/5 disabled:opacity-30 cursor-pointer"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                {/* Page Number Buttons */}
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
                        type="button"
                        onClick={() => setCurrentPage(item as number)}
                        className={`h-8 w-8 rounded-lg text-xs font-secondary font-medium cursor-pointer transition-all ${
                          currentPage === item
                            ? "bg-white text-black"
                            : "text-white/50 hover:text-white hover:bg-white/5"
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
            <Award className="h-6 w-6" />
          </div>
          <h3 className="font-secondary text-base font-semibold text-white/80">No achievements found</h3>
          <p className="font-secondary text-sm text-white/40 mt-1 max-w-sm">
            Try adjusting your search criteria, selecting another organisation filter, or adding a new award.
          </p>
          <Button
            onClick={() => {
              setEditingAchievement(null);
              setIsFormOpen(true);
            }}
            className="mt-6 bg-white text-black hover:bg-white/90 font-secondary font-semibold cursor-pointer"
          >
            Add Achievement
          </Button>
        </div>
      )}

      {/* ==========================================
          ADD/EDIT ACHIEVEMENT MODAL DIALOG
          ========================================== */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingAchievement ? "Edit Achievement details" : "Add New Achievement"}
            </DialogTitle>
            <DialogDescription>
              Record student accomplishments and startup wins.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 font-secondary py-2">
            {/* Title Input */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-white/70">Achievement Title</label>
              <Input
                type="text"
                placeholder="Best IEDC Cell 2026"
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
                placeholder="Detail the recognition, who won, and the context..."
                rows={3}
                {...register("description")}
                className="w-full bg-[#141414] border border-white/10 text-white rounded-md p-3 text-sm focus:outline-none focus:border-white/20 focus:ring-1 focus:ring-white/20 placeholder-white/30"
              />
              {errors.description && (
                <p className="text-[11px] text-red-400 font-semibold">{errors.description.message}</p>
              )}
            </div>

            {/* Date Input */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-white/70">Date Awarded</label>
              <Input
                type="date"
                {...register("date")}
                className="bg-[#141414] border-white/10 text-xs text-white focus:bg-[#141414] focus-visible:bg-[#141414] focus-visible:ring-white/20 focus-visible:border-white/20"
              />
              {errors.date && (
                <p className="text-[11px] text-red-400 font-semibold">{errors.date.message}</p>
              )}
            </div>

            {/* Organisation Select Dropdown */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-white/70">Awarding Organisation</label>
              <select
                value={isAddingNewOrg ? "__ADD_NEW__" : watchOrganisation}
                onChange={handleOrgChange}
                className="w-full bg-[#141414] border border-white/10 text-white rounded-md p-2 text-sm focus:outline-none focus:border-white/20 focus:ring-1 focus:ring-white/20"
              >
                <option value="">Select Organisation</option>
                {organisations.map((org) => (
                  <option key={org} value={org}>
                    {org}
                  </option>
                ))}
                <option value="__ADD_NEW__">+ Add New Organisation</option>
              </select>

              {/* Inline input field for dynamic addition of new organization */}
              {isAddingNewOrg && (
                <div className="flex gap-2 items-center mt-2 animate-fadeIn">
                  <Input
                    type="text"
                    placeholder="New Organisation name..."
                    value={newOrgName}
                    onChange={(e) => setNewOrgName(e.target.value)}
                    className="bg-[#141414] border-white/10 text-xs text-white focus:bg-[#141414] focus-visible:bg-[#141414] focus-visible:ring-white/20 focus-visible:border-white/20"
                  />
                  <Button
                    type="button"
                    onClick={handleAddNewOrgSubmit}
                    disabled={!newOrgName.trim()}
                    className="bg-white text-black hover:bg-white/90 text-xs py-1 h-9 cursor-pointer"
                  >
                    Add
                  </Button>
                </div>
              )}

              {errors.organisation && (
                <p className="text-[11px] text-red-400 font-semibold">{errors.organisation.message}</p>
              )}
            </div>

            {/* Image Upload with simulated Progress */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-white/70">Achievement Image</label>
              
              <div className="flex gap-4 items-center p-3 bg-[#141414] rounded-lg border border-white/10">
                {/* Image Preview Container */}
                <div className="relative h-16 w-24 shrink-0 rounded-md border border-white/10 bg-white/5 flex items-center justify-center overflow-hidden">
                  {imagePreview ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={imagePreview}
                      alt="Achievement Preview"
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <ImageIcon className="h-6 w-6 text-white/20" />
                  )}

                  {/* Upload overlay */}
                  {isUploading && (
                    <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                      <span className="text-[10px] text-white font-bold">{uploadProgress}%</span>
                    </div>
                  )}
                </div>

                {/* File picker button / progress bar */}
                <div className="flex-1 space-y-2">
                  <div className="relative">
                    <input
                      type="file"
                      accept="image/*"
                      id="achievement-upload-file"
                      onChange={handlePhotoSelect}
                      disabled={isUploading}
                      className="hidden"
                    />
                    <label
                      htmlFor="achievement-upload-file"
                      className={`inline-flex items-center gap-1.5 px-3 py-2 bg-white/5 border border-white/10 hover:bg-white/10 rounded-lg text-xs font-medium text-white/80 cursor-pointer transition-colors ${
                        isUploading ? "pointer-events-none opacity-50" : ""
                      }`}
                    >
                      <Upload className="h-3 w-3" />
                      Select Image
                    </label>
                  </div>

                  {isUploading && (
                    <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden">
                      <div
                        className="bg-white h-full transition-all duration-100"
                        style={{ width: `${uploadProgress}%` }}
                      />
                    </div>
                  )}
                </div>
              </div>

              {errors.image && (
                <p className="text-[11px] text-red-400 font-semibold">{errors.image.message}</p>
              )}
            </div>

            {/* Featured Toggle */}
            <div className="flex items-center justify-between p-3 bg-[#141414] border border-white/10 rounded-lg">
              <div className="space-y-0.5">
                <label className="text-sm font-semibold text-white/90">Featured Achievement</label>
                <p className="text-[11px] text-white/50">Highlight this on the homepage.</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" {...register("isFeatured")} className="sr-only peer" />
                <div className="w-9 h-5 bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-white/30"></div>
              </label>
            </div>

            {/* Actions */}
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
                disabled={isSubmitting || isPending || isUploading}
                className="bg-white text-black hover:bg-white/90 font-semibold cursor-pointer"
              >
                {(isSubmitting || isPending) && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {editingAchievement ? "Save Changes" : "Record Win"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* ==========================================
          DELETE CONFIRMATION ALERT DIALOG
          ========================================== */}
      <AlertDialog open={deletingAchievement !== null} onOpenChange={(open) => !open && setDeletingAchievement(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action will permanently delete <span className="font-semibold text-white">{deletingAchievement?.title}</span>. 
              This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="cursor-pointer">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              className="bg-red-500 text-white hover:bg-red-600 focus:ring-red-500 cursor-pointer"
            >
              Delete Achievement
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
