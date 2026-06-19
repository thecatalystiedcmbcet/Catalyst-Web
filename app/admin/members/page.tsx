"use client";

import React, { useState, useEffect, useDeferredValue, useTransition, useCallback } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast, Toaster } from "sonner";
import {
  Users,
  Search,
  Plus,
  Edit2,
  Trash2,
  Instagram,
  Linkedin,
  Upload,
  Loader2,
  Image as ImageIcon,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

import { useAdminStore, Member } from "@/lib/adminStore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
// CONSTANTS
// ==========================================
const PAGE_SIZE = 10;

// ==========================================
// ZOD VALIDATION SCHEMA
// ==========================================
const memberFormSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  photoUrl: z.string().min(1, "A profile photo is required"),
  instagram: z.string().url("Must be a valid Instagram URL").or(z.literal("")).optional(),
  linkedin: z.string().url("Must be a valid LinkedIn URL").or(z.literal("")).optional(),
});

type MemberFormValues = z.infer<typeof memberFormSchema>;

export default function AdminMembersPage() {
  const [mounted, setMounted] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const deferredSearchQuery = useDeferredValue(searchQuery);
  const [isPending, startTransition] = useTransition();
  const [currentPage, setCurrentPage] = useState(1);

  // Dialog Controls
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<Member | null>(null);
  const [deletingMember, setDeletingMember] = useState<Member | null>(null);

  // Upload State
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [previewUrl, setPreviewUrl] = useState<string>("");
  const [pendingFile, setPendingFile] = useState<File | null>(null);

  // Hydrate Store
  const { members, isLoadingMembers, fetchMembers, addMember, updateMember, deleteMember, uploadFile } = useAdminStore();

  useEffect(() => {
    setMounted(true);
    fetchMembers();
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
  } = useForm<MemberFormValues>({
    resolver: zodResolver(memberFormSchema),
    defaultValues: {
      name: "",
      photoUrl: "",
      instagram: "",
      linkedin: "",
    },
  });

  watch("photoUrl");

  // Sync Form when Editing
  useEffect(() => {
    if (editingMember) {
      reset({
        name: editingMember.name,
        photoUrl: editingMember.photoUrl,
        instagram: editingMember.instagram || "",
        linkedin: editingMember.linkedin || "",
      });
      setPreviewUrl(editingMember.photoUrl);
    } else {
      reset({ name: "", photoUrl: "", instagram: "", linkedin: "" });
      setPreviewUrl("");
    }
    setUploadProgress(0);
    setIsUploading(false);
    setPendingFile(null);
  }, [editingMember, isFormOpen, reset]);

  // Handle Photo Select — stage file and show local preview
  const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const tempUrl = URL.createObjectURL(file);
    setPreviewUrl(tempUrl);
    setPendingFile(file);
    // Indicate ready state with a quick visual progress
    setIsUploading(true);
    setUploadProgress(0);
    let progress = 0;
    const interval = setInterval(() => {
      progress += 25;
      setUploadProgress(progress);
      if (progress >= 100) {
        clearInterval(interval);
        setIsUploading(false);
        // Mark form field valid with placeholder local URL — will be replaced on submit
        setValue("photoUrl", tempUrl, { shouldValidate: true });
      }
    }, 60);
  };

  // Submit: upload pending file first, then save member
  const onSubmit = useCallback(
    async (data: MemberFormValues) => {
      startTransition(async () => {
        try {
          let finalPhotoUrl = data.photoUrl;

          // If a new file was staged, upload it to Supabase Storage now
          if (pendingFile) {
            setIsUploading(true);
            finalPhotoUrl = await uploadFile(pendingFile, "members");
            setIsUploading(false);
          }

          if (editingMember) {
            await updateMember(editingMember.id, { ...data, photoUrl: finalPhotoUrl, role: editingMember.role });
            toast.success(`Updated details for ${data.name}`);
          } else {
            await addMember({ ...data, photoUrl: finalPhotoUrl, role: "Member" });
            toast.success(`Added new member: ${data.name}`);
          }
          setIsFormOpen(false);
          setEditingMember(null);
          setPendingFile(null);
        } catch (err) {
          console.error(err);
          toast.error("Failed to save member. Check console for details.");
          setIsUploading(false);
        }
      });
    },
    [pendingFile, editingMember, uploadFile, updateMember, addMember]
  );

  const handleDeleteConfirm = async () => {
    if (deletingMember) {
      startTransition(async () => {
        try {
          await deleteMember(deletingMember.id);
          toast.success(`Removed ${deletingMember.name} globally`);
          setDeletingMember(null);
        } catch {
          toast.error("Failed to delete member.");
        }
      });
    }
  };

  // ---- CLIENT-SIDE FILTERING ----
  const filteredMembers = members.filter((member: Member) =>
    member.name.toLowerCase().includes(deferredSearchQuery.toLowerCase()) ||
    member.role.toLowerCase().includes(deferredSearchQuery.toLowerCase())
  );

  // ---- PAGINATION ----
  const totalPages = Math.ceil(filteredMembers.length / PAGE_SIZE);
  const paginatedMembers = filteredMembers.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  );

  // Reset page when search query changes
  useEffect(() => {
    setCurrentPage(1);
  }, [deferredSearchQuery]);

  // ---- LOADING STATE ----
  if (!mounted || isLoadingMembers) {
    return (
      <div className="flex h-96 items-center justify-center flex-col gap-3">
        <Loader2 className="h-8 w-8 animate-spin text-white/50" />
        <p className="text-white/30 text-sm font-secondary">Loading members from database...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Toaster theme="dark" closeButton position="top-right" />

      {/* Title & Add Button */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-primary text-2xl font-bold tracking-wider uppercase text-white">
            Members Directory
          </h1>
          <p className="font-secondary text-sm text-white/50">
            Create, update, and manage global organizers across the Catalyst platform.
          </p>
        </div>
        <Button
          onClick={() => {
            setEditingMember(null);
            setIsFormOpen(true);
          }}
          className="bg-white text-black hover:bg-white/90 font-secondary font-semibold shrink-0 cursor-pointer flex items-center gap-1.5"
        >
          <Plus className="h-4 w-4" />
          Add Member
        </Button>
      </div>

      {/* Filtering Header Panel */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between p-4 bg-[#0E0E0E] rounded-xl border border-white/5">
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-white/40" />
          <Input
            type="text"
            placeholder="Search by name or role..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 bg-[#161616] border-white/5 text-white placeholder-white/30 focus:bg-[#161616] focus-visible:bg-[#161616] focus-visible:ring-white/20 focus-visible:border-white/20"
          />
        </div>
        <div className="text-xs font-secondary text-white/40">
          Showing {filteredMembers.length} of {members.length} members
        </div>
      </div>

      {/* Members Table */}
      {filteredMembers.length > 0 ? (
        <div className="space-y-4">
          <div className="border border-white/5 rounded-xl bg-[#0E0E0E] overflow-hidden">
            <Table>
              <TableHeader className="bg-[#121212] border-b border-white/5">
                <TableRow className="border-b border-white/5">
                  <TableHead className="w-16 text-white/55 font-secondary">Photo</TableHead>
                  <TableHead className="text-white/55 font-secondary">Name</TableHead>
                  <TableHead className="hidden md:table-cell text-white/55 font-secondary">Role</TableHead>
                  <TableHead className="w-24 text-white/55 font-secondary">Socials</TableHead>
                  <TableHead className="w-24 text-right text-white/55 font-secondary">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedMembers.map((member: Member) => (
                  <TableRow key={member.id} className="border-b border-white/5 hover:bg-white/5">
                    <TableCell>
                      <div className="relative h-10 w-10 overflow-hidden rounded-lg border border-white/10 bg-white/5">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={member.photoUrl}
                          alt={member.name}
                          className="h-full w-full object-cover"
                        />
                      </div>
                    </TableCell>
                    <TableCell className="font-secondary font-semibold text-white">
                      {member.name}
                    </TableCell>
                    <TableCell className="hidden md:table-cell font-secondary text-white/60 text-xs">
                      {member.role}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {member.instagram ? (
                          <a
                            href={member.instagram}
                            target="_blank"
                            rel="noreferrer"
                            className="h-7 w-7 rounded-md border border-white/5 flex items-center justify-center text-white/50 hover:text-white hover:bg-white/5 transition-all"
                          >
                            <Instagram className="h-3.5 w-3.5" />
                          </a>
                        ) : (
                          <span className="text-white/20 text-xs">-</span>
                        )}
                        {member.linkedin ? (
                          <a
                            href={member.linkedin}
                            target="_blank"
                            rel="noreferrer"
                            className="h-7 w-7 rounded-md border border-white/5 flex items-center justify-center text-white/50 hover:text-white hover:bg-white/5 transition-all"
                          >
                            <Linkedin className="h-3.5 w-3.5" />
                          </a>
                        ) : null}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            setEditingMember(member);
                            setIsFormOpen(true);
                          }}
                          className="h-8 w-8 hover:bg-white/5 hover:text-white text-white/50 cursor-pointer"
                        >
                          <Edit2 className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setDeletingMember(member)}
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

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-1">
              <p className="text-xs font-secondary text-white/40">
                Page {currentPage} of {totalPages} &nbsp;&middot;&nbsp; {filteredMembers.length} results
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
            <Users className="h-6 w-6" />
          </div>
          <h3 className="font-secondary text-base font-semibold text-white/80">No members found</h3>
          <p className="font-secondary text-sm text-white/40 mt-1 max-w-sm">
            Try adjusting your search keywords, or add a new member profile to populate the list.
          </p>
          <Button
            onClick={() => {
              setEditingMember(null);
              setIsFormOpen(true);
            }}
            className="mt-6 bg-white text-black hover:bg-white/90 font-secondary font-semibold cursor-pointer"
          >
            Add Member
          </Button>
        </div>
      )}

      {/* ==========================================
          ADD/EDIT MEMBER MODAL DIALOG
          ========================================== */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editingMember ? "Edit Member Profile" : "Add New Member"}</DialogTitle>
            <DialogDescription>
              {editingMember
                ? "Update credentials, photos, and socials for this organizer."
                : "Fill out the information below to add a new organizer to the website."}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 font-secondary py-2">
            {/* Name Input */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-white/70">Full Name</label>
              <Input
                type="text"
                placeholder="Alex Johnson"
                {...register("name")}
                className="bg-[#141414] border-white/10 text-white focus:bg-[#141414] focus-visible:bg-[#141414] focus-visible:ring-white/20 focus-visible:border-white/20"
              />
              {errors.name && (
                <p className="text-[11px] text-red-400 font-semibold">{errors.name.message}</p>
              )}
            </div>

            {/* Photo Upload */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-white/70">Profile Photo</label>
              <div className="flex gap-4 items-center p-3 bg-[#141414] rounded-lg border border-white/10">
                <div className="relative h-16 w-16 shrink-0 rounded-md border border-white/10 bg-white/5 flex items-center justify-center overflow-hidden">
                  {previewUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={previewUrl} alt="Avatar Preview" className="h-full w-full object-cover" />
                  ) : (
                    <ImageIcon className="h-6 w-6 text-white/20" />
                  )}
                  {isUploading && (
                    <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                      <Loader2 className="h-4 w-4 animate-spin text-white" />
                    </div>
                  )}
                </div>
                <div className="flex-1 space-y-2">
                  <input
                    type="file"
                    accept="image/*"
                    id="avatar-upload-file"
                    onChange={handlePhotoSelect}
                    disabled={isUploading}
                    className="hidden"
                  />
                  <label
                    htmlFor="avatar-upload-file"
                    className={`inline-flex items-center gap-1.5 px-3 py-2 bg-white/5 border border-white/10 hover:bg-white/10 rounded-lg text-xs font-medium text-white/80 cursor-pointer transition-colors ${
                      isUploading ? "pointer-events-none opacity-50" : ""
                    }`}
                  >
                    <Upload className="h-3 w-3" />
                    {pendingFile ? "Change Image" : "Select Image"}
                  </label>
                  {pendingFile && (
                    <p className="text-[10px] text-emerald-400 font-medium">
                      ✓ {pendingFile.name} ready to upload
                    </p>
                  )}
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
              {errors.photoUrl && (
                <p className="text-[11px] text-red-400 font-semibold">{errors.photoUrl.message}</p>
              )}
            </div>

            {/* Social Links Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-white/70 flex items-center gap-1">
                  <Instagram className="h-3 w-3 text-white/50" />
                  Instagram Link
                </label>
                <Input
                  type="text"
                  placeholder="https://instagram.com/..."
                  {...register("instagram")}
                  className="bg-[#141414] border-white/10 text-xs text-white focus:bg-[#141414] focus-visible:bg-[#141414] focus-visible:ring-white/20 focus-visible:border-white/20"
                />
                {errors.instagram && (
                  <p className="text-[11px] text-red-400 font-semibold">{errors.instagram.message}</p>
                )}
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-white/70 flex items-center gap-1">
                  <Linkedin className="h-3 w-3 text-white/50" />
                  LinkedIn Link
                </label>
                <Input
                  type="text"
                  placeholder="https://linkedin.com/in/..."
                  {...register("linkedin")}
                  className="bg-[#141414] border-white/10 text-xs text-white focus:bg-[#141414] focus-visible:bg-[#141414] focus-visible:ring-white/20 focus-visible:border-white/20"
                />
                {errors.linkedin && (
                  <p className="text-[11px] text-red-400 font-semibold">{errors.linkedin.message}</p>
                )}
              </div>
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
                {editingMember ? "Save Changes" : "Create Member"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* ==========================================
          DELETE CONFIRMATION ALERT DIALOG
          ========================================== */}
      <AlertDialog open={deletingMember !== null} onOpenChange={(open) => !open && setDeletingMember(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action will permanently remove{" "}
              <span className="font-semibold text-white">{deletingMember?.name}</span> from the global members
              directory. They will also be deleted from any Execom committees they are currently associated with.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="cursor-pointer">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              className="bg-red-500 text-white hover:bg-red-600 focus:ring-red-500 cursor-pointer"
            >
              Delete Member
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
