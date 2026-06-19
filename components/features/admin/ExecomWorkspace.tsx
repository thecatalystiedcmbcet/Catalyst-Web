/* eslint-disable @typescript-eslint/no-unused-vars, @typescript-eslint/no-explicit-any, prefer-const, @next/next/no-img-element */
"use client";

import React, { useState, useEffect, useDeferredValue, useTransition } from "react";
import { toast, Toaster } from "sonner";
import {
  UsersRound,
  Plus,
  Trash2,
  Search,
  GripVertical,
  GripHorizontal,
  X,
  Loader2,
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
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

import { useAdminStore, ExecomSection, Member, ExecomMember, ExecomScope } from "@/lib/adminStore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

// ==========================================
// DRAGGABLE MEMBER CARD COMPONENT
// ==========================================
interface SortableMemberProps {
  id: string; // Format: `${sectionId}::${memberId}`
  member: Member;
  sectionMember: ExecomMember;
  sectionId: string;
  isMatched?: boolean;
  onRemove: () => void;
  onRoleChange: (newRole: string) => void;
}

function SortableMemberCard({
  id,
  member,
  sectionMember,
  sectionId,
  isMatched = false,
  onRemove,
  onRoleChange,
}: SortableMemberProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "flex items-center gap-3 p-3 border rounded-lg group transition-all",
        isMatched 
          ? "border-white/30 bg-white/5 shadow-[0_0_10px_rgba(255,255,255,0.05)]" 
          : "bg-[#121212] border-white/5 hover:border-white/10"
      )}
    >
      {/* Drag Handle */}
      <button
        type="button"
        {...attributes}
        {...listeners}
        className="text-white/30 hover:text-white/60 cursor-grab active:cursor-grabbing p-1 hover:bg-white/5 rounded shrink-0"
      >
        <GripHorizontal className="h-4 w-4" />
      </button>

      {/* Member Avatar */}
      <div className="h-10 w-10 shrink-0 overflow-hidden rounded-md border border-white/10 bg-white/5">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={member.photoUrl}
          alt={member.name}
          className="h-full w-full object-cover"
        />
      </div>

      {/* Name and Role Editor */}
      <div className="flex-1 min-w-0 grid grid-cols-1 sm:grid-cols-2 gap-2 items-center">
        <div className="truncate">
          <h4 className="font-secondary text-sm font-semibold text-white leading-none">
            {member.name}
          </h4>
        </div>
        
        {/* Role Inline input */}
        <div>
          <Input
            type="text"
            value={sectionMember.role}
            placeholder="Assign role (e.g. Lead)"
            onChange={(e) => onRoleChange(e.target.value)}
            className="h-7 text-xs bg-black/40 border-white/5 text-white/80 focus:bg-black/60 focus-visible:bg-black/60 focus-visible:ring-0 focus-visible:border-white/20 py-0 px-2"
          />
        </div>
      </div>

      {/* Remove Button */}
      <button
        type="button"
        onClick={onRemove}
        className="opacity-0 group-hover:opacity-100 p-1.5 text-white/40 hover:text-red-400 hover:bg-red-500/10 rounded transition-all cursor-pointer shrink-0"
        title="Remove from Section"
      >
        <X className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}

// ==========================================
// DRAGGABLE SECTION CARD COMPONENT
// ==========================================
interface SortableSectionProps {
  section: ExecomSection;
  globalMembers: Member[];
  onDeleteSection: () => void;
  onUpdateTitle: (newTitle: string, bgWhite: boolean, cols: number, size: string) => void;
  onAddMember: (memberId: string) => void;
  onRemoveMember: (memberId: string) => void;
  children: React.ReactNode;
}

function SortableSectionCard({
  section,
  globalMembers,
  onDeleteSection,
  onUpdateTitle,
  onAddMember,
  onRemoveMember,
  children,
}: SortableSectionProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: `section-${section.id}` });

  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [editedTitle, setEditedTitle] = useState(section.title);

  // Search autocomplete states
  const [memberSearch, setMemberSearch] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.3 : 1,
  };

  const saveTitle = () => {
    const trimmed = editedTitle.trim();
    if (trimmed !== section.title) {
      onUpdateTitle(trimmed, section.bgWhite, section.cols, section.size);
      toast.success("Section renamed");
    }
    setIsEditingTitle(false);
  };

  const filteredSearchMembers = globalMembers.filter((m) => {
    if (section.members.some((sm) => sm.id === m.id)) return false;
    return m.name.toLowerCase().includes(memberSearch.toLowerCase());
  });

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="rounded-xl border border-white/5 bg-[#0E0E0E] p-5 md:p-6 space-y-4"
    >
      {/* Section Header */}
      <div className="flex items-center justify-between gap-4 border-b border-white/5 pb-4">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <button
            type="button"
            {...attributes}
            {...listeners}
            className="text-white/30 hover:text-white/60 cursor-grab active:cursor-grabbing p-1.5 hover:bg-white/5 rounded shrink-0"
          >
            <GripVertical className="h-4.5 w-4.5" />
          </button>

          <div className="flex-1 min-w-0">
            {isEditingTitle ? (
              <Input
                type="text"
                placeholder="Section title (blank for none)"
                value={editedTitle}
                onChange={(e) => setEditedTitle(e.target.value)}
                onBlur={saveTitle}
                onKeyDown={(e) => e.key === "Enter" && saveTitle()}
                className="font-secondary text-base font-bold text-white max-w-sm h-8 bg-black/60 focus:bg-black focus-visible:bg-black focus-visible:ring-white/20 focus-visible:border-white/20"
                autoFocus
              />
            ) : (
              <h3
                onClick={() => setIsEditingTitle(true)}
                className="font-secondary text-base font-bold text-white/90 hover:text-white cursor-pointer truncate"
              >
                {section.title || <span className="italic text-white/30">Untitled Section (Hidden)</span>}
              </h3>
            )}
          </div>
        </div>

        <div className="flex items-center gap-4">
          <label className="flex items-center gap-1.5 text-xs text-white/50 cursor-pointer hover:text-white/90">
            <input 
              type="checkbox" 
              checked={section.bgWhite} 
              onChange={(e) => onUpdateTitle(section.title, e.target.checked, section.cols, section.size)} 
              className="rounded bg-black/50 border-white/20 cursor-pointer"
            />
            White BG
          </label>
          <div className="flex items-center gap-1.5 text-xs text-white/50">
            <span>Cols:</span>
            <select
              value={section.cols}
              onChange={(e) => onUpdateTitle(section.title, section.bgWhite, parseInt(e.target.value, 10), section.size)}
              className="bg-black/50 border border-white/20 rounded px-1 py-0.5 text-white outline-none cursor-pointer"
            >
              {[1,2,3, 4, 5, 6, 7].map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-white/50">
            <span>Size:</span>
            <select
              value={section.size || "md"}
              onChange={(e) => onUpdateTitle(section.title, section.bgWhite, section.cols, e.target.value)}
              className="bg-black/50 border border-white/20 rounded px-1 py-0.5 text-white outline-none cursor-pointer"
            >
              <option value="sm">SM</option>
              <option value="md">MD</option>
              <option value="lg">LG</option>
            </select>
          </div>
          <button
            type="button"
            onClick={onDeleteSection}
            className="text-white/40 hover:text-red-400 p-2 hover:bg-red-500/10 rounded transition-all cursor-pointer shrink-0"
            title="Delete Section"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Add Member Autocomplete */}
      <div className="relative font-secondary">
        <div className="relative flex items-center">
          <Search className="absolute left-3 h-3.5 w-3.5 text-white/30" />
          <Input
            type="text"
            placeholder="Search and add global members..."
            value={memberSearch}
            onChange={(e) => {
              setMemberSearch(e.target.value);
              setShowDropdown(true);
            }}
            onFocus={() => setShowDropdown(true)}
            className="h-8 pl-8 pr-8 bg-[#161616] border-white/5 text-xs text-white placeholder-white/30 focus:bg-[#161616] focus-visible:bg-[#161616] focus-visible:ring-white/20 focus-visible:border-white/20"
          />
          {memberSearch && (
            <button
              type="button"
              onClick={() => {
                setMemberSearch("");
                setShowDropdown(false);
              }}
              className="absolute right-3 text-white/40 hover:text-white"
            >
              <X className="h-3 w-3" />
            </button>
          )}
        </div>

        {showDropdown && memberSearch && (
          <div className="absolute top-9 left-0 right-0 z-20 max-h-48 overflow-y-auto rounded-lg border border-white/10 bg-[#121212] shadow-2xl p-1">
            {filteredSearchMembers.length > 0 ? (
              filteredSearchMembers.map((m) => (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => {
                    onAddMember(m.id);
                    setMemberSearch("");
                    setShowDropdown(false);
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-left text-xs text-white/80 hover:text-white hover:bg-white/5 rounded-md transition-colors"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={m.photoUrl}
                    alt={m.name}
                    className="h-6 w-6 rounded object-cover border border-white/10 shrink-0"
                  />
                  <span className="font-medium truncate">{m.name}</span>
                </button>
              ))
            ) : (
              <div className="text-[11px] text-white/35 italic px-3 py-2.5 text-center">
                No matching members found
              </div>
            )}
          </div>
        )}
      </div>

      {/* Members Box */}
      <div className="space-y-2 mt-3 min-h-[4rem] rounded-lg border border-dashed border-white/5 bg-black/10 p-2">
        {children}
      </div>
    </div>
  );
}

// ==========================================
// WORKSPACE MAIN CONTAINER
// ==========================================
interface ExecomWorkspaceProps {
  scope: ExecomScope;
  title: string;
  description: string;
}

export function ExecomWorkspace({ scope, title, description }: ExecomWorkspaceProps) {
  const [mounted, setMounted] = useState(false);
  const [newSectionTitle, setNewSectionTitle] = useState("");
  const [newSectionBgWhite, setNewSectionBgWhite] = useState(false);
  const [newSectionCols, setNewSectionCols] = useState(5);
  const [newSectionSize, setNewSectionSize] = useState("md");
  const [searchQuery, setSearchQuery] = useState("");
  const deferredSearchQuery = useDeferredValue(searchQuery);

  // Hydrate Store
  const {
    members,
    execomSections,
    addExecomSection,
    updateExecomSectionTitle,
    deleteExecomSection,
    reorderExecomSections,
    addMemberToSection,
    removeMemberFromSection,
    updateMemberRoleInSection,
    reorderMembersInSection,
    fetchMembers,
    fetchExecomSections,
    isLoadingMembers,
    isLoadingExecom,
  } = useAdminStore();

  useEffect(() => {
    const timer = setTimeout(() => {
      setMounted(true);
      fetchMembers();
      fetchExecomSections(scope);
    }, 0);
    return () => clearTimeout(timer);
  }, [scope, fetchMembers, fetchExecomSections]);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleCreateSection = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = newSectionTitle.trim();

    addExecomSection(trimmed, scope, newSectionBgWhite, newSectionCols, newSectionSize);
    setNewSectionTitle("");
    setNewSectionBgWhite(false);
    setNewSectionCols(5);
    setNewSectionSize("md");
    toast.success(`Created section${trimmed ? `: ${trimmed}` : ' (Untitled)'}`);
  };

  // Filter sections by organisation scope AND search query (matching section or member name)
  const scopedSections = execomSections.filter((s) => {
    if (s.scope !== scope) return false;

    if (!deferredSearchQuery.trim()) return true;
    const query = deferredSearchQuery.toLowerCase();

    const matchesSectionTitle = s.title.toLowerCase().includes(query);
    const matchesMemberName = s.members.some((sm) => {
      const globMember = members.find((gm) => gm.id === sm.id);
      return globMember?.name.toLowerCase().includes(query);
    });

    return matchesSectionTitle || matchesMemberName;
  });

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over) return;

    const activeIdStr = active.id.toString();
    const overIdStr = over.id.toString();

    // 1. Dragging a SECTION
    if (activeIdStr.startsWith("section-")) {
      const activeSecId = activeIdStr.replace("section-", "");
      const overSecId = overIdStr.replace("section-", "");

      if (activeSecId === overSecId) return;

      const oldIndex = scopedSections.findIndex((s) => s.id === activeSecId);
      const newIndex = scopedSections.findIndex((s) => s.id === overSecId);

      const reordered = arrayMove(scopedSections, oldIndex, newIndex);
      reorderExecomSections(reordered, scope);
      toast.success("Sections reordered!");
      return;
    }

    // 2. Dragging a MEMBER inside/between sections
    if (activeIdStr.includes("::")) {
      const [activeSecId, activeMemId] = activeIdStr.split("::");
      
      let overSecId = "";
      let overMemId = "";
      let isOverContainer = false;

      if (overIdStr.startsWith("container-")) {
        overSecId = overIdStr.replace("container-", "");
        isOverContainer = true;
      } else if (overIdStr.includes("::")) {
        [overSecId, overMemId] = overIdStr.split("::");
      } else {
        return;
      }

      const sourceSection = execomSections.find((s) => s.id === activeSecId);
      const destSection = execomSections.find((s) => s.id === overSecId);

      if (!sourceSection || !destSection) return;

      // Same Section drop
      if (activeSecId === overSecId) {
        const oldIndex = sourceSection.members.findIndex((m) => m.id === activeMemId);
        const newIndex = isOverContainer
          ? sourceSection.members.length - 1
          : sourceSection.members.findIndex((m) => m.id === overMemId);

        if (oldIndex === newIndex) return;

        const reorderedMembers = arrayMove(sourceSection.members, oldIndex, newIndex);
        reorderMembersInSection(activeSecId, reorderedMembers);
      } else {
        // Different Section drop
        const sourceMember = sourceSection.members.find((m) => m.id === activeMemId);
        if (!sourceMember) return;

        if (destSection.members.some((m) => m.id === activeMemId)) {
          toast.error("This member is already inside the destination section");
          return;
        }

        const newSourceMembers = sourceSection.members.filter((m) => m.id !== activeMemId);
        const destMembers = [...destSection.members];
        const insertIndex = isOverContainer
          ? destMembers.length
          : destMembers.findIndex((m) => m.id === overMemId);

        if (insertIndex === -1) {
          destMembers.push(sourceMember);
        } else {
          destMembers.splice(insertIndex, 0, sourceMember);
        }

        reorderMembersInSection(activeSecId, newSourceMembers);
        reorderMembersInSection(overSecId, destMembers);
        toast.success(`Moved member to ${destSection.title}`);
      }
    }
  };

  if (!mounted || isLoadingMembers || isLoadingExecom) {
    return (
      <div className="flex h-96 items-center justify-center flex-col gap-3">
        <Loader2 className="h-8 w-8 animate-spin text-white/50" />
        <p className="text-white/30 text-sm font-secondary">Loading team structure from database...</p>
      </div>
    );
  }

  const sectionIds = scopedSections.map((s) => `section-${s.id}`);

  return (
    <div className="space-y-6">
      <Toaster theme="dark" closeButton position="top-right" />

      {/* Title Header Panel */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="font-primary text-2xl font-bold tracking-wider uppercase text-white">
            {title}
          </h1>
          <p className="font-secondary text-sm text-white/50">
            {description}
          </p>
        </div>

        {/* Add Section */}
        <form onSubmit={handleCreateSection} className="flex gap-3 items-center font-secondary">
          <Input
            type="text"
            placeholder="New Section... (blank for none)"
            value={newSectionTitle}
            onChange={(e) => setNewSectionTitle(e.target.value)}
            className="h-9 w-48 bg-[#0E0E0E] border-white/10 text-white placeholder-white/35 focus:bg-[#121212] focus-visible:bg-[#121212] focus-visible:ring-white/20 focus-visible:border-white/20 text-xs"
          />
          <label className="flex items-center gap-1.5 text-xs text-white/70 cursor-pointer">
            <input 
              type="checkbox" 
              checked={newSectionBgWhite} 
              onChange={(e) => setNewSectionBgWhite(e.target.checked)} 
              className="rounded bg-black/50 border-white/20 cursor-pointer"
            />
            White BG
          </label>
          <div className="flex items-center gap-1.5 text-xs text-white/70">
            <span>Cols:</span>
            <select
              value={newSectionCols}
              onChange={(e) => setNewSectionCols(parseInt(e.target.value, 10))}
              className="bg-[#0E0E0E] border border-white/20 rounded px-1 py-1 text-white outline-none cursor-pointer"
            >
              {[1, 2, 3, 4, 5, 6, 7].map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-white/70">
            <span>Size:</span>
            <select
              value={newSectionSize}
              onChange={(e) => setNewSectionSize(e.target.value)}
              className="bg-[#0E0E0E] border border-white/20 rounded px-1 py-1 text-white outline-none cursor-pointer"
            >
              <option value="sm">SM</option>
              <option value="md">MD</option>
              <option value="lg">LG</option>
            </select>
          </div>
          <Button
            type="submit"
            className="bg-white text-black hover:bg-white/90 text-xs font-semibold px-3 py-1 cursor-pointer shrink-0"
          >
            Create Section
          </Button>
        </form>
      </div>

      {/* Search Bar for filtering sections and members */}
      <div className="relative font-secondary">
        <Search className="absolute left-3.5 top-3 h-4 w-4 text-white/40" />
        <Input
          type="text"
          placeholder="Search workspace by section name or member name..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="h-10 pl-10 pr-10 bg-[#0E0E0E] border-white/5 text-sm text-white placeholder-white/45 focus:bg-[#0E0E0E] focus-visible:bg-[#0E0E0E] focus-visible:ring-white/20 focus-visible:border-white/20"
        />
        {searchQuery && (
          <button
            type="button"
            onClick={() => setSearchQuery("")}
            className="absolute right-3.5 top-3 text-white/40 hover:text-white"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Workspace */}
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        {scopedSections.length > 0 ? (
          <SortableContext items={sectionIds} strategy={verticalListSortingStrategy}>
            <div className="space-y-6">
              {scopedSections.map((section) => (
                <SortableSectionCard
                  key={section.id}
                  section={section}
                  globalMembers={members}
                  onDeleteSection={() => {
                    deleteExecomSection(section.id);
                    toast.success(`Removed section: ${section.title}`);
                  }}
                  onUpdateTitle={(newTitle, bgWhite, cols, size) => updateExecomSectionTitle(section.id, newTitle, bgWhite, cols, size)}
                  onAddMember={(memId) => {
                    addMemberToSection(section.id, memId, "Committee Member");
                    const name = members.find((m) => m.id === memId)?.name;
                    toast.success(`Added ${name} to ${section.title}`);
                  }}
                  onRemoveMember={(memId) => {
                    removeMemberFromSection(section.id, memId);
                    toast.success("Removed member from section");
                  }}
                >
                  <div id={`container-${section.id}`} className="space-y-2">
                    <SortableContext
                      items={section.members.map((sm) => `${section.id}::${sm.id}`)}
                      strategy={verticalListSortingStrategy}
                    >
                      {section.members.length > 0 ? (
                        section.members.map((sm) => {
                          const m = members.find((glob) => glob.id === sm.id);
                          if (!m) return null;

                          // Check if this member matches search query
                          const isMatched = deferredSearchQuery.trim() !== "" && 
                            m.name.toLowerCase().includes(deferredSearchQuery.toLowerCase());

                          return (
                            <SortableMemberCard
                              key={`${section.id}::${sm.id}`}
                              id={`${section.id}::${sm.id}`}
                              member={m}
                              sectionMember={sm}
                              sectionId={section.id}
                              isMatched={isMatched}
                              onRemove={() => {
                                removeMemberFromSection(section.id, sm.id);
                                toast.success(`Removed ${m.name} from section`);
                              }}
                              onRoleChange={(newRole) =>
                                updateMemberRoleInSection(section.id, sm.id, newRole)
                              }
                            />
                          );
                        })
                      ) : (
                        <div className="text-[11px] text-white/20 italic text-center py-6 font-secondary">
                          No members in this section. Search above to add.
                        </div>
                      )}
                    </SortableContext>
                  </div>
                </SortableSectionCard>
              ))}
            </div>
          </SortableContext>
        ) : (
          <div className="rounded-xl border border-dashed border-white/10 bg-[#0E0E0E] p-16 text-center flex flex-col items-center justify-center font-secondary">
            <div className="h-12 w-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mb-4 text-white/40">
              <UsersRound className="h-6 w-6" />
            </div>
            <h3 className="text-base font-semibold text-white/80">No committee sections</h3>
            <p className="text-sm text-white/40 mt-1 max-w-sm">
              Create a section (e.g. Core Committee) or clear your search to start managing elements.
            </p>
          </div>
        )}
      </DndContext>
    </div>
  );
}
