import { create } from "zustand";
import { supabase } from "./supabaseClient";

// ==========================================
// TYPE DEFINITIONS
// ==========================================

export interface Member {
  id: string;
  name: string;
  role: string;
  photoUrl: string;
  instagram?: string;
  linkedin?: string;
}

export type EventStatus = "upcoming" | "ongoing" | "completed" | "cancelled";

export interface Event {
  id: string;
  title: string;
  coverImage: string;
  description: string;
  registrationUrl?: string;
  relatedImages: string[];
  startDate: string;
  endDate: string;
  status: EventStatus;
  isFeatured: boolean;
}

export interface Achievement {
  id: string;
  title: string;
  image: string;
  description: string;
  date: string;
  organisation: string;
  isFeatured: boolean;
}

export interface ExecomMember {
  id: string; // References global Member.id
  role: string;
}

export interface SiteSettings {
  id: string;
  instagram_url: string;
  linkedin_url: string;
  discord_url: string;
  youtube_url: string;
}

export interface MatrixItem {
  id: string;
  value: number;
  suffix: string;
  label: string;
  sort_order: number;
}

export interface TimelineItem {
  id: string;
  category: string;
  date: string;
  title: string;
  description: string;
  image: string;
  sort_order: number;
}

export type ExecomScope = "catalyst" | "mulearn" | "dev-team";

export interface ExecomSection {
  id: string;
  title: string;
  bgWhite: boolean;
  cols: number;
  size: "sm" | "md" | "lg";
  scope: ExecomScope;
  members: ExecomMember[];
}

export const encodeSectionTitle = (title: string, bgWhite: boolean, cols: number, size: string) => {
  const safeCols = cols || 5;
  const safeSize = (size === "sm" || size === "md" || size === "lg") ? size : "md";
  return `${bgWhite ? '[bg:white]' : '[bg:trans]'}[cols:${safeCols}][size:${safeSize}] ${title}`;
};

export const decodeSectionTitle = (rawTitle: string) => {
  let title = rawTitle || "";
  let bgWhite = false;
  let cols = 5;
  let size: "sm" | "md" | "lg" = "md";

  // First, clean up any buggy [size:undefined] strings that might have gotten saved
  title = title.replace(/\[size:undefined\]/gi, "");

  const match = title.match(/^\[bg:(white|trans)\](?:\[cols:(\d+)\])?(?:\[size:(sm|md|lg)\])?\s*(.*)$/i);
  if (match) {
    bgWhite = match[1].toLowerCase() === 'white';
    if (match[2]) cols = parseInt(match[2], 10) || 5;
    if (match[3]) size = match[3] as "sm" | "md" | "lg";
    title = match[4];
  } else if (title.startsWith("[bg:white]")) {
    bgWhite = true;
    title = title.replace("[bg:white]", "").trimStart();
  } else if (title.startsWith("[bg:trans]")) {
    bgWhite = false;
    title = title.replace("[bg:trans]", "").trimStart();
  } else {
    const lower = title.toLowerCase();
    if (lower.includes("legacy") || lower.includes("alumni")) bgWhite = true;
  }
  return { title, bgWhite, cols, size };
};

// ==========================================
// DB ROW → APP TYPE MAPPERS
// ==========================================

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mapMember = (row: any): Member => ({
  id: row.id,
  name: row.name,
  role: row.role ?? "Member",
  photoUrl: row.photo_url ?? "",
  instagram: row.instagram ?? undefined,
  linkedin: row.linkedin ?? undefined,
});

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mapEvent = (row: any): Event => ({
  id: row.id,
  title: row.title,
  coverImage: row.cover_image ?? "",
  description: row.description ?? "",
  registrationUrl: row.registration_url ?? undefined,
  relatedImages: row.related_images ?? [],
  startDate: row.start_date,
  endDate: row.end_date,
  status: row.status as EventStatus,
  isFeatured: row.is_featured ?? false,
});

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mapAchievement = (row: any): Achievement => ({
  id: row.id,
  title: row.title ?? "",
  image: row.image ?? "",
  description: row.description ?? "",
  date: row.date ?? row.created_at,
  organisation: row.organisation ?? "",
  isFeatured: row.is_featured ?? false,
});

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mapMatrixItem = (row: any): MatrixItem => ({
  id: row.id,
  value: row.value,
  suffix: row.suffix ?? "+",
  label: row.label ?? "",
  sort_order: row.sort_order ?? 0,
});

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mapTimelineItem = (row: any): TimelineItem => ({
  id: row.id,
  category: row.category ?? "",
  date: row.date ?? "",
  title: row.title ?? "",
  description: row.description ?? "",
  image: row.image ?? "",
  sort_order: row.sort_order ?? 0,
});

// ==========================================
// ZUSTAND STATE INTERFACE
// ==========================================

interface AdminState {
  // Data
  members: Member[];
  events: Event[];
  achievements: Achievement[];
  execomSections: ExecomSection[];
  organisations: string[];
  siteSettings: SiteSettings | null;
  matrixItems: MatrixItem[];
  timelineItems: TimelineItem[];

  // Loading guards — prevent duplicate fetches per module
  membersLoaded: boolean;
  eventsLoaded: boolean;
  achievementsLoaded: boolean;
  catalystExecomLoaded: boolean;
  mulLearnExecomLoaded: boolean;
  devTeamLoaded: boolean;
  settingsLoaded: boolean;
  matrixLoaded: boolean;
  timelineLoaded: boolean;

  // Loading status for UI spinners
  isLoadingMembers: boolean;
  isLoadingEvents: boolean;
  isLoadingAchievements: boolean;
  isLoadingExecom: boolean;
  isLoadingSettings: boolean;
  isLoadingMatrix: boolean;
  isLoadingTimeline: boolean;

  // ---- FETCH ACTIONS (load from Supabase if not already loaded) ----
  fetchMembers: () => Promise<void>;
  fetchEvents: () => Promise<void>;
  fetchAchievements: () => Promise<void>;
  fetchExecomSections: (scope: ExecomScope) => Promise<void>;
  fetchSettings: () => Promise<void>;
  fetchMatrixItems: () => Promise<void>;
  fetchTimelineItems: () => Promise<void>;

  // ---- FILE UPLOAD HELPER ----
  uploadFile: (file: File, folder: string) => Promise<string>;

  // ---- MEMBERS CRUD ----
  addMember: (member: Omit<Member, "id">) => Promise<void>;
  updateMember: (id: string, updates: Partial<Member>) => Promise<void>;
  deleteMember: (id: string) => Promise<void>;

  // ---- EVENTS CRUD ----
  addEvent: (event: Omit<Event, "id">) => Promise<void>;
  updateEvent: (id: string, updates: Partial<Event>) => Promise<void>;
  deleteEvent: (id: string) => Promise<void>;
  reorderEventImages: (eventId: string, newImages: string[]) => Promise<void>;

  // ---- ACHIEVEMENTS CRUD ----
  addAchievement: (achievement: Omit<Achievement, "id">) => Promise<void>;
  updateAchievement: (id: string, updates: Partial<Achievement>) => Promise<void>;
  deleteAchievement: (id: string) => Promise<void>;
  addOrganisation: (org: string) => void;

  // ---- EXECOM SECTIONS CRUD ----
  addExecomSection: (title: string, scope: ExecomScope, bgWhite: boolean, cols: number, size: string) => Promise<void>;
  updateExecomSectionTitle: (id: string, title: string, bgWhite: boolean, cols: number, size: string) => Promise<void>;
  deleteExecomSection: (id: string) => Promise<void>;
  reorderExecomSections: (sections: ExecomSection[], scope: ExecomScope) => Promise<void>;

  // ---- SETTINGS CRUD ----
  updateSettings: (updates: Partial<SiteSettings>) => Promise<void>;

  // ---- MATRIX CRUD ----
  addMatrixItem: (item: Omit<MatrixItem, "id">) => Promise<void>;
  updateMatrixItem: (id: string, updates: Partial<MatrixItem>) => Promise<void>;
  deleteMatrixItem: (id: string) => Promise<void>;
  reorderMatrixItems: (items: MatrixItem[]) => Promise<void>;

  // ---- TIMELINE CRUD ----
  addTimelineItem: (item: Omit<TimelineItem, "id">) => Promise<void>;
  updateTimelineItem: (id: string, updates: Partial<TimelineItem>) => Promise<void>;
  deleteTimelineItem: (id: string) => Promise<void>;
  reorderTimelineItems: (items: TimelineItem[]) => Promise<void>;

  // ---- EXECOM MEMBERS MANAGEMENT ----
  addMemberToSection: (sectionId: string, memberId: string, role?: string) => Promise<void>;
  updateMemberRoleInSection: (sectionId: string, memberId: string, role: string) => Promise<void>;
  removeMemberFromSection: (sectionId: string, memberId: string) => Promise<void>;
  reorderMembersInSection: (sectionId: string, members: ExecomMember[]) => Promise<void>;
}

// ==========================================
// ZUSTAND STORE
// ==========================================

export const useAdminStore = create<AdminState>()((set, get) => ({
  // ---- Initial State ----
  members: [],
  events: [],
  achievements: [],
  execomSections: [],
  organisations: [],
  siteSettings: null,
  matrixItems: [],
  timelineItems: [],

  membersLoaded: false,
  eventsLoaded: false,
  achievementsLoaded: false,
  catalystExecomLoaded: false,
  mulLearnExecomLoaded: false,
  devTeamLoaded: false,
  settingsLoaded: false,
  matrixLoaded: false,
  timelineLoaded: false,

  isLoadingMembers: false,
  isLoadingEvents: false,
  isLoadingAchievements: false,
  isLoadingExecom: false,
  isLoadingSettings: false,
  isLoadingMatrix: false,
  isLoadingTimeline: false,

  // ==========================================
  // FETCH ACTIONS
  // ==========================================

  fetchMembers: async () => {
    // Cache guard — already loaded, do nothing
    if (get().membersLoaded) return;
    set({ isLoadingMembers: true });
    try {
      const { data, error } = await supabase
        .from("members")
        .select("*")
        .order("created_at", { ascending: true });
      if (error) throw error;
      const members = (data ?? []).map(mapMember);
      // Derive unique organisations list from existing members (not in members table but useful)
      set({ members, membersLoaded: true });
    } catch (err) {
      console.error("[fetchMembers]", err);
    } finally {
      set({ isLoadingMembers: false });
    }
  },

  fetchSettings: async () => {
    if (get().settingsLoaded) return;
    set({ isLoadingSettings: true });
    try {
      const { data, error } = await supabase
        .from("site_settings")
        .select("*")
        .eq("id", "social_links")
        .single();
      if (error && error.code !== "PGRST116") throw error; // Ignore not found initially
      if (data) {
        set({ siteSettings: data as SiteSettings, settingsLoaded: true });
      } else {
        set({ settingsLoaded: true });
      }
    } catch (err) {
      console.error("[fetchSettings]", err);
    } finally {
      set({ isLoadingSettings: false });
    }
  },

  fetchEvents: async () => {
    if (get().eventsLoaded) return;
    set({ isLoadingEvents: true });
    try {
      const { data, error } = await supabase
        .from("events")
        .select("*")
        .order("start_date", { ascending: false });
      if (error) throw error;
      set({ events: (data ?? []).map(mapEvent), eventsLoaded: true });
    } catch (err) {
      console.error("[fetchEvents]", err);
    } finally {
      set({ isLoadingEvents: false });
    }
  },

  fetchAchievements: async () => {
    if (get().achievementsLoaded) return;
    set({ isLoadingAchievements: true });
    try {
      const { data, error } = await supabase
        .from("achievements")
        .select("*")
        .order("date", { ascending: false });
      if (error) throw error;
      const achievements = (data ?? []).map(mapAchievement);
      // Derive unique organisations list for dropdown
      const orgs = Array.from(new Set(achievements.map((a) => a.organisation)));
      set({ achievements, achievementsLoaded: true, organisations: orgs });
    } catch (err) {
      console.error("[fetchAchievements]", err);
    } finally {
      set({ isLoadingAchievements: false });
    }
  },

  fetchExecomSections: async (scope: ExecomScope) => {
    // Per-scope cache guards
    let loaded = false;
    if (scope === "catalyst") loaded = get().catalystExecomLoaded;
    else if (scope === "mulearn") loaded = get().mulLearnExecomLoaded;
    else if (scope === "dev-team") loaded = get().devTeamLoaded;

    if (loaded) return;
    set({ isLoadingExecom: true });
    try {
      // 1. Fetch sections for this scope, ordered by order_index
      const { data: sections, error: secErr } = await supabase
        .from("execom_sections")
        .select("*")
        .eq("scope", scope)
        .order("order_index", { ascending: true });
      if (secErr) throw secErr;

      // 2. Fetch execom_members for these sections with member detail in one query
      const sectionIds = (sections ?? []).map((s) => s.id);
      const execomMembers: Record<string, ExecomMember[]> = {};

      if (sectionIds.length > 0) {
        const { data: emRows, error: emErr } = await supabase
          .from("execom_members")
          .select("section_id, member_id, role, order_index")
          .in("section_id", sectionIds)
          .order("order_index", { ascending: true });
        if (emErr) throw emErr;

        // Group by section
        (emRows ?? []).forEach((row) => {
          if (!execomMembers[row.section_id]) execomMembers[row.section_id] = [];
          execomMembers[row.section_id].push({ id: row.member_id, role: row.role });
        });
      }

      // 3. Build ExecomSection objects
      const builtSections: ExecomSection[] = (sections ?? []).map((sec) => {
        const decoded = decodeSectionTitle(sec.title);
        return {
          id: sec.id,
          title: decoded.title,
          bgWhite: decoded.bgWhite,
          cols: decoded.cols,
          size: decoded.size,
          scope: sec.scope as ExecomScope,
          members: execomMembers[sec.id] ?? [],
        };
      });

      // 4. Merge with existing sections of the other scope to avoid overwriting
      const otherSections = get().execomSections.filter((s) => s.scope !== scope);
      set({
        execomSections: [...otherSections, ...builtSections],
        ...(scope === "catalyst"
          ? { catalystExecomLoaded: true }
          : scope === "mulearn"
          ? { mulLearnExecomLoaded: true }
          : { devTeamLoaded: true }),
      });
    } catch (err) {
      console.error("[fetchExecomSections]", err);
    } finally {
      set({ isLoadingExecom: false });
    }
  },

  // ==========================================
  // FILE UPLOAD HELPER
  // ==========================================

  uploadFile: async (file: File, folder: string): Promise<string> => {
    const ext = file.name.split(".").pop();
    const filename = `${folder}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
    const { data, error } = await supabase.storage
      .from("image")
      .upload(filename, file, { upsert: false, cacheControl: "31536000" });
    if (error) throw error;
    const { data: urlData } = supabase.storage
      .from("image")
      .getPublicUrl(data.path);
    return urlData.publicUrl;
  },

  // ==========================================
  // MEMBERS CRUD
  // ==========================================

  addMember: async (newMember) => {
    const { data, error } = await supabase
      .from("members")
      .insert({
        name: newMember.name,
        role: newMember.role ?? "Member",
        photo_url: newMember.photoUrl,
        instagram: newMember.instagram || null,
        linkedin: newMember.linkedin || null,
      })
      .select()
      .single();
    if (error) throw error;
    // Optimistic update — append to existing list
    set((state) => ({ members: [...state.members, mapMember(data)] }));
  },

  updateMember: async (id, updates) => {
    // Optimistic UI update first
    set((state) => ({
      members: state.members.map((m) => (m.id === id ? { ...m, ...updates } : m)),
    }));
    const { error } = await supabase
      .from("members")
      .update({
        ...(updates.name !== undefined && { name: updates.name }),
        ...(updates.role !== undefined && { role: updates.role }),
        ...(updates.photoUrl !== undefined && { photo_url: updates.photoUrl }),
        ...(updates.instagram !== undefined && { instagram: updates.instagram || null }),
        ...(updates.linkedin !== undefined && { linkedin: updates.linkedin || null }),
      })
      .eq("id", id);
    if (error) throw error;
  },

  deleteMember: async (id) => {
    // Optimistic local update
    set((state) => ({
      members: state.members.filter((m) => m.id !== id),
      // Clean dangling execom refs locally — DB handles cascade deletion
      execomSections: state.execomSections.map((sec) => ({
        ...sec,
        members: sec.members.filter((sm) => sm.id !== id),
      })),
    }));
    // ON DELETE CASCADE in the DB handles execom_members rows automatically
    const { error } = await supabase.from("members").delete().eq("id", id);
    if (error) throw error;
  },

  // ==========================================
  // EVENTS CRUD
  // ==========================================

  addEvent: async (newEvent) => {
    const { data, error } = await supabase
      .from("events")
      .insert({
        title: newEvent.title,
        cover_image: newEvent.coverImage,
        description: newEvent.description,
        registration_url: newEvent.registrationUrl || null,
        related_images: newEvent.relatedImages,
        start_date: newEvent.startDate,
        end_date: newEvent.endDate,
        status: newEvent.status,
        is_featured: newEvent.isFeatured,
      })
      .select()
      .single();
    if (error) throw error;
    set((state) => ({ events: [mapEvent(data), ...state.events] }));
  },

  updateEvent: async (id, updates) => {
    // Optimistic UI update
    set((state) => ({
      events: state.events.map((e) => (e.id === id ? { ...e, ...updates } : e)),
    }));
    const { error } = await supabase
      .from("events")
      .update({
        ...(updates.title !== undefined && { title: updates.title }),
        ...(updates.coverImage !== undefined && { cover_image: updates.coverImage }),
        ...(updates.description !== undefined && { description: updates.description }),
        ...(updates.registrationUrl !== undefined && {
          registration_url: updates.registrationUrl || null,
        }),
        ...(updates.relatedImages !== undefined && { related_images: updates.relatedImages }),
        ...(updates.startDate !== undefined && { start_date: updates.startDate }),
        ...(updates.endDate !== undefined && { end_date: updates.endDate }),
        ...(updates.status !== undefined && { status: updates.status }),
        ...(updates.isFeatured !== undefined && { is_featured: updates.isFeatured }),
      })
      .eq("id", id);
    if (error) throw error;
  },

  deleteEvent: async (id) => {
    set((state) => ({ events: state.events.filter((e) => e.id !== id) }));
    const { error } = await supabase.from("events").delete().eq("id", id);
    if (error) throw error;
  },

  reorderEventImages: async (eventId, newImages) => {
    set((state) => ({
      events: state.events.map((e) =>
        e.id === eventId ? { ...e, relatedImages: newImages } : e
      ),
    }));
    const { error } = await supabase
      .from("events")
      .update({ related_images: newImages })
      .eq("id", eventId);
    if (error) throw error;
  },

  // ==========================================
  // ACHIEVEMENTS CRUD
  // ==========================================

  addAchievement: async (newAch) => {
    const { data, error } = await supabase
      .from("achievements")
      .insert({
        title: newAch.title,
        image: newAch.image,
        description: newAch.description,
        date: newAch.date,
        organisation: newAch.organisation,
        is_featured: newAch.isFeatured,
      })
      .select()
      .single();
    if (error) throw error;
    const mapped = mapAchievement(data);
    set((state) => {
      const orgs = state.organisations.includes(mapped.organisation)
        ? state.organisations
        : [...state.organisations, mapped.organisation];
      return { achievements: [mapped, ...state.achievements], organisations: orgs };
    });
  },

  updateAchievement: async (id, updates) => {
    set((state) => ({
      achievements: state.achievements.map((a) => (a.id === id ? { ...a, ...updates } : a)),
    }));
    const { error } = await supabase
      .from("achievements")
      .update({
        ...(updates.title !== undefined && { title: updates.title }),
        ...(updates.image !== undefined && { image: updates.image }),
        ...(updates.description !== undefined && { description: updates.description }),
        ...(updates.date !== undefined && { date: updates.date }),
        ...(updates.organisation !== undefined && { organisation: updates.organisation }),
        ...(updates.isFeatured !== undefined && { is_featured: updates.isFeatured }),
      })
      .eq("id", id);
    if (error) throw error;
  },

  deleteAchievement: async (id) => {
    set((state) => ({ achievements: state.achievements.filter((a) => a.id !== id) }));
    const { error } = await supabase.from("achievements").delete().eq("id", id);
    if (error) throw error;
  },

  addOrganisation: (org) => {
    set((state) => {
      if (state.organisations.includes(org)) return {};
      return { organisations: [...state.organisations, org] };
    });
  },

  // ==========================================
  // EXECOM SECTIONS CRUD
  // ==========================================

  addExecomSection: async (title, scope, bgWhite, cols, size) => {
    // Calculate next order_index
    const currentSections = get().execomSections.filter((s) => s.scope === scope);
    const nextIndex = currentSections.length;

    const dbTitle = encodeSectionTitle(title, bgWhite, cols, size);

    const { data, error } = await supabase
      .from("execom_sections")
      .insert({ title: dbTitle, scope, order_index: nextIndex })
      .select()
      .single();
    if (error) throw error;

    const decoded = decodeSectionTitle(data.title);
    const newSection: ExecomSection = {
      id: data.id,
      title: decoded.title,
      bgWhite: decoded.bgWhite,
      cols: decoded.cols,
      size: decoded.size,
      scope: data.scope,
      members: [],
    };
    set((state) => ({ execomSections: [...state.execomSections, newSection] }));
  },

  updateExecomSectionTitle: async (id, title, bgWhite, cols, size) => {
    set((state) => ({
      execomSections: state.execomSections.map((sec) =>
        sec.id === id ? { ...sec, title, bgWhite, cols, size: size as "sm" | "md" | "lg" } : sec
      ),
    }));
    
    const dbTitle = encodeSectionTitle(title, bgWhite, cols, size);
    
    const { error } = await supabase
      .from("execom_sections")
      .update({ title: dbTitle })
      .eq("id", id);
    if (error) throw error;
  },

  deleteExecomSection: async (id) => {
    set((state) => ({
      execomSections: state.execomSections.filter((sec) => sec.id !== id),
    }));
    // ON DELETE CASCADE removes execom_members rows automatically
    const { error } = await supabase.from("execom_sections").delete().eq("id", id);
    if (error) throw error;
  },

  reorderExecomSections: async (sections, scope) => {
    // Optimistic update
    set((state) => ({
      execomSections: [
        ...state.execomSections.filter((s) => s.scope !== scope),
        ...sections,
      ],
    }));
    // Update each section's order_index in DB in parallel
    await Promise.all(
      sections.map((sec, index) =>
        supabase
          .from("execom_sections")
          .update({ order_index: index })
          .eq("id", sec.id)
      )
    );
  },

  // ==========================================
  // SETTINGS CRUD
  // ==========================================
  updateSettings: async (updates) => {
    // Optimistic UI
    set((state) => ({
      siteSettings: state.siteSettings ? { ...state.siteSettings, ...updates } : { id: "social_links", instagram_url: "#", linkedin_url: "#", discord_url: "#", youtube_url: "#", ...updates }
    }));
    
    const { error } = await supabase
      .from("site_settings")
      .upsert({ id: "social_links", ...updates });
      
    if (error) throw error;
  },

  // ==========================================
  // EXECOM MEMBERS MANAGEMENT
  // ==========================================

  addMemberToSection: async (sectionId, memberId, role = "Member") => {
    // Prevent duplicates locally
    const section = get().execomSections.find((s) => s.id === sectionId);
    if (!section || section.members.some((m) => m.id === memberId)) return;

    const nextIndex = section.members.length;

    // Optimistic update
    set((state) => ({
      execomSections: state.execomSections.map((sec) =>
        sec.id === sectionId
          ? { ...sec, members: [...sec.members, { id: memberId, role }] }
          : sec
      ),
    }));

    const { error } = await supabase.from("execom_members").insert({
      section_id: sectionId,
      member_id: memberId,
      role,
      order_index: nextIndex,
    });
    if (error) throw error;
  },

  updateMemberRoleInSection: async (sectionId, memberId, role) => {
    set((state) => ({
      execomSections: state.execomSections.map((sec) =>
        sec.id === sectionId
          ? {
              ...sec,
              members: sec.members.map((m) => (m.id === memberId ? { ...m, role } : m)),
            }
          : sec
      ),
    }));
    const { error } = await supabase
      .from("execom_members")
      .update({ role })
      .eq("section_id", sectionId)
      .eq("member_id", memberId);
    if (error) throw error;
  },

  removeMemberFromSection: async (sectionId, memberId) => {
    set((state) => ({
      execomSections: state.execomSections.map((sec) =>
        sec.id === sectionId
          ? { ...sec, members: sec.members.filter((m) => m.id !== memberId) }
          : sec
      ),
    }));
    const { error } = await supabase
      .from("execom_members")
      .delete()
      .eq("section_id", sectionId)
      .eq("member_id", memberId);
    if (error) throw error;
  },

  reorderMembersInSection: async (sectionId, members) => {
    set((state) => ({
      execomSections: state.execomSections.map((sec) =>
        sec.id === sectionId ? { ...sec, members } : sec
      ),
    }));
    // Update all order_indexes in parallel
    await Promise.all(
      members.map((m, index) =>
        supabase
          .from("execom_members")
          .update({ order_index: index })
          .eq("section_id", sectionId)
          .eq("member_id", m.id)
      )
    );
  },

  // ==========================================
  // MATRIX CRUD & FETCH
  // ==========================================
  fetchMatrixItems: async () => {
    if (get().matrixLoaded) return;
    set({ isLoadingMatrix: true });
    try {
      const { data, error } = await supabase
        .from("catalyst_matrix")
        .select("*")
        .order("sort_order", { ascending: true });
      if (error) throw error;
      set({ matrixItems: (data || []).map(mapMatrixItem), matrixLoaded: true });
    } catch (error) {
      console.error("Error fetching matrix items:", error);
    } finally {
      set({ isLoadingMatrix: false });
    }
  },

  addMatrixItem: async (item) => {
    const { data, error } = await supabase
      .from("catalyst_matrix")
      .insert({ ...item })
      .select("*")
      .single();
    if (error) throw error;
    set((state) => ({ matrixItems: [...state.matrixItems, mapMatrixItem(data)] }));
  },

  updateMatrixItem: async (id, updates) => {
    set((state) => ({
      matrixItems: state.matrixItems.map((m) => (m.id === id ? { ...m, ...updates } : m)),
    }));
    const { error } = await supabase
      .from("catalyst_matrix")
      .update(updates)
      .eq("id", id);
    if (error) throw error;
  },

  deleteMatrixItem: async (id) => {
    set((state) => ({
      matrixItems: state.matrixItems.filter((m) => m.id !== id),
    }));
    const { error } = await supabase.from("catalyst_matrix").delete().eq("id", id);
    if (error) throw error;
  },

  reorderMatrixItems: async (items) => {
    set({ matrixItems: items });
    await Promise.all(
      items.map((m, index) =>
        supabase
          .from("catalyst_matrix")
          .update({ sort_order: index })
          .eq("id", m.id)
      )
    );
  },

  // ==========================================
  // TIMELINE CRUD & FETCH
  // ==========================================
  fetchTimelineItems: async () => {
    if (get().timelineLoaded) return;
    set({ isLoadingTimeline: true });
    try {
      const { data, error } = await supabase
        .from("catalyst_timeline")
        .select("*")
        .order("sort_order", { ascending: true });
      if (error) throw error;
      set({ timelineItems: (data || []).map(mapTimelineItem), timelineLoaded: true });
    } catch (error) {
      console.error("Error fetching timeline items:", error);
    } finally {
      set({ isLoadingTimeline: false });
    }
  },

  addTimelineItem: async (item) => {
    const { data, error } = await supabase
      .from("catalyst_timeline")
      .insert({ ...item })
      .select("*")
      .single();
    if (error) throw error;
    set((state) => ({ timelineItems: [...state.timelineItems, mapTimelineItem(data)] }));
  },

  updateTimelineItem: async (id, updates) => {
    set((state) => ({
      timelineItems: state.timelineItems.map((m) => (m.id === id ? { ...m, ...updates } : m)),
    }));
    const { error } = await supabase
      .from("catalyst_timeline")
      .update(updates)
      .eq("id", id);
    if (error) throw error;
  },

  deleteTimelineItem: async (id) => {
    set((state) => ({
      timelineItems: state.timelineItems.filter((m) => m.id !== id),
    }));
    const { error } = await supabase.from("catalyst_timeline").delete().eq("id", id);
    if (error) throw error;
  },

  reorderTimelineItems: async (items) => {
    set({ timelineItems: items });
    await Promise.all(
      items.map((m, index) =>
        supabase
          .from("catalyst_timeline")
          .update({ sort_order: index })
          .eq("id", m.id)
      )
    );
  },
}));
