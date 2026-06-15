import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

interface AdminFeatures {
  events: boolean;
  members: boolean;
  roles: boolean;
  achievements: boolean;
  logs: boolean;
}

interface AdminAppearance {
  compactMode: boolean;
  showSidebarBadges: boolean;
}

interface AdminPermissions {
  defaultNewMemberRole: string;
  allowPublicRegistration: boolean;
  requireEmailVerification: boolean;
  enableGuestAccess: boolean;
  allowMemberInvites: boolean;
  requireEventApproval: boolean;
  requireAchievementApproval: boolean;
}

interface AdminUIElements {
  showExportButtons: boolean;
  showAddButtons: boolean;
  showEditButtons: boolean;
  showDeleteButtons: boolean;
  showSearchBars: boolean;
}

interface AdminFrontendPages {
  showHome: boolean;
  showEvents: boolean;
  showAchievements: boolean;
  showCatalystExecom: boolean;
  showWebTeam: boolean;
  showMuLearn: boolean;
  showGallery: boolean;
}

interface AdminFrontendComponents {
  showHero: boolean;
  showAddText: boolean;
  showAbout: boolean;
  showTimelineDemo: boolean;
  showStats: boolean;
  showHomeEvents: boolean;
  showOurPioneers: boolean;
  showFamilyText: boolean;
  showTeam: boolean;
  showConnect: boolean;
}

interface AdminPageComponents {
  events: {
    showNowHappening: boolean;
    showUpcoming: boolean;
    showPast: boolean;
  };
  achievements: {
    showFeatured: boolean;
    showRecent: boolean;
    showPast: boolean;
  };
  execom: {
    showFeatured: boolean;
    showCore: boolean;
    showLegacy: boolean;
  };
  devTeam: {
    showMembers: boolean;
    showV1: boolean;
  };
  mulearn: {
    showStats: boolean;
    showDiscord: boolean;
  };
  gallery: {
    showMasonry: boolean;
  };
}

interface AdminSettingsState {
  features: AdminFeatures;
  appearance: AdminAppearance;
  permissions: AdminPermissions;
  uiElements: AdminUIElements;
  frontendPages: AdminFrontendPages;
  frontendComponents: AdminFrontendComponents;
  pageComponents: AdminPageComponents;
  
  // Actions
  toggleFeature: (feature: keyof AdminFeatures) => void;
  setFeature: (feature: keyof AdminFeatures, value: boolean) => void;
  updateAppearance: (updates: Partial<AdminAppearance>) => void;
  updatePermissions: (updates: Partial<AdminPermissions>) => void;
  toggleUIElement: (element: keyof AdminUIElements) => void;
  toggleFrontendPage: (page: keyof AdminFrontendPages) => void;
  toggleFrontendComponent: (component: keyof AdminFrontendComponents) => void;
  togglePageComponent: <P extends keyof AdminPageComponents>(
    page: P,
    component: keyof AdminPageComponents[P]
  ) => void;
  resetToDefaults: () => void;
}

const defaultState = {
  features: {
    events: true,
    members: true,
    roles: true,
    achievements: true,
    logs: true,
  },
  appearance: {
    compactMode: false,
    showSidebarBadges: true,
  },
  permissions: {
    defaultNewMemberRole: "member",
    allowPublicRegistration: true,
    requireEmailVerification: false,
    enableGuestAccess: true,
    allowMemberInvites: false,
    requireEventApproval: true,
    requireAchievementApproval: true,
  },
  uiElements: {
    showExportButtons: true,
    showAddButtons: true,
    showEditButtons: true,
    showDeleteButtons: true,
    showSearchBars: true,
  },
  frontendPages: {
    showHome: true,
    showEvents: true,
    showAchievements: true,
    showCatalystExecom: true,
    showWebTeam: true,
    showMuLearn: true,
    showGallery: true,
  },
  frontendComponents: {
    showHero: true,
    showAddText: true,
    showAbout: true,
    showTimelineDemo: true,
    showStats: true,
    showHomeEvents: true,
    showOurPioneers: true,
    showFamilyText: true,
    showTeam: true,
    showConnect: true,
  },
  pageComponents: {
    events: {
      showNowHappening: true,
      showUpcoming: true,
      showPast: true,
    },
    achievements: {
      showFeatured: true,
      showRecent: true,
      showPast: true,
    },
    execom: {
      showFeatured: true,
      showCore: true,
      showLegacy: true,
    },
    devTeam: {
      showMembers: true,
      showV1: true,
    },
    mulearn: {
      showStats: true,
      showDiscord: true,
    },
    gallery: {
      showMasonry: true,
    },
  },
};

export const useAdminSettings = create<AdminSettingsState>()(
  persist(
    (set) => ({
      ...defaultState,
      
      toggleFeature: (feature) =>
        set((state) => ({
          features: {
            ...state.features,
            [feature]: !state.features[feature],
          },
        })),
        
      setFeature: (feature, value) =>
        set((state) => ({
          features: {
            ...state.features,
            [feature]: value,
          },
        })),

      updateAppearance: (updates) =>
        set((state) => ({
          appearance: { ...state.appearance, ...updates },
        })),

      updatePermissions: (updates) =>
        set((state) => ({
          permissions: { ...state.permissions, ...updates },
        })),

      toggleUIElement: (element) =>
        set((state) => ({
          uiElements: {
            ...state.uiElements,
            [element]: !state.uiElements[element],
          },
        })),

      toggleFrontendPage: (page) =>
        set((state) => ({
          frontendPages: {
            ...state.frontendPages,
            [page]: !state.frontendPages[page],
          },
        })),

      toggleFrontendComponent: (component) =>
        set((state) => ({
          frontendComponents: {
            ...state.frontendComponents,
            [component]: !state.frontendComponents[component],
          },
        })),

      togglePageComponent: (page, component) =>
        set((state) => ({
          pageComponents: {
            ...state.pageComponents,
            [page]: {
              ...state.pageComponents[page],
              [component]: !state.pageComponents[page][component as keyof typeof state.pageComponents[typeof page]],
            },
          },
        })),

      resetToDefaults: () => set(defaultState),
    }),
    {
      name: "catalyst-admin-settings",
      storage: createJSONStorage(() => localStorage),
    }
  )
);
