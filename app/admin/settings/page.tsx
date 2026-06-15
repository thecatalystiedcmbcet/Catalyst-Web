"use client";

import React, { useState, useEffect } from "react";
import { useAdminSettings } from "@/hooks/use-admin-settings";
import { 
  Settings, 
  LayoutGrid, 
  Shield, 
  Palette, 
  Save, 
  RefreshCw,
  Calendar,
  Users,
  Trophy,
  ScrollText,
  Sidebar,
  ToggleLeft,
  Download,
  PlusCircle,
  Edit,
  Trash2,
  Search,
  Monitor,
  AppWindowMac,
  FileText
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";

const TABS = [
  { id: "modules", label: "Modules", icon: LayoutGrid },
  { id: "components", label: "Components", icon: ToggleLeft },
  { id: "frontend_pages", label: "Frontend Pages", icon: AppWindowMac },
  { id: "frontend_components", label: "Home Sections", icon: Monitor },
  { id: "page_components", label: "Page Content", icon: FileText },
  { id: "appearance", label: "Appearance", icon: Palette },
  { id: "permissions", label: "Permissions", icon: Shield },
];

export default function SettingsPage() {
  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState("modules");
  
  const { 
    features, 
    appearance, 
    permissions,
    uiElements,
    frontendPages,
    frontendComponents,
    pageComponents,
    toggleFeature, 
    updateAppearance, 
    updatePermissions,
    toggleUIElement,
    toggleFrontendPage,
    toggleFrontendComponent,
    togglePageComponent,
    resetToDefaults 
  } = useAdminSettings();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    // Avoid hydration mismatch for persisted Zustand store
    return null;
  }

  return (
    <div className="flex flex-col max-w-5xl mx-auto gap-6 pb-10">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Platform Settings</h1>
          <p className="text-muted-foreground mt-1">
            Manage your application modules, appearance, and core configurations.
          </p>
        </div>
        <Button variant="outline" onClick={resetToDefaults} className="gap-2">
          <RefreshCw className="w-4 h-4" />
          Reset to Defaults
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-[250px_1fr] gap-8 mt-6">
        {/* Sidebar Navigation for Settings */}
        <nav className="flex flex-col gap-2">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                  isActive 
                    ? "bg-primary text-primary-foreground shadow-md" 
                    : "hover:bg-muted text-muted-foreground hover:text-foreground"
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </nav>

        {/* Settings Content area */}
        <div className="flex flex-col gap-6">
          
          {activeTab === "modules" && (
            <Card className="border-border/50 shadow-sm animate-in fade-in slide-in-from-bottom-4 duration-500">
              <CardHeader>
                <CardTitle>Feature Modules</CardTitle>
                <CardDescription>
                  Enable or disable primary sections of the admin dashboard. Disabling a module hides it from the sidebar and restricts direct access.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                
                <div className="flex items-start space-x-4">
                  <Checkbox 
                    id="feat-events" 
                    checked={features.events}
                    onCheckedChange={() => toggleFeature("events")}
                    className="mt-1"
                  />
                  <div className="grid gap-1.5 leading-none">
                    <Label htmlFor="feat-events" className="text-base font-semibold flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-primary" /> Events Management
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Allow administrators to create, edit, and manage calendar events and RSVP lists.
                    </p>
                  </div>
                </div>
                <Separator />
                
                <div className="flex items-start space-x-4">
                  <Checkbox 
                    id="feat-members" 
                    checked={features.members}
                    onCheckedChange={() => toggleFeature("members")}
                    className="mt-1"
                  />
                  <div className="grid gap-1.5 leading-none">
                    <Label htmlFor="feat-members" className="text-base font-semibold flex items-center gap-2">
                      <Users className="w-4 h-4 text-primary" /> Members Directory
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Access to the full community directory, member profiles, and bulk user actions.
                    </p>
                  </div>
                </div>
                <Separator />
                
                <div className="flex items-start space-x-4">
                  <Checkbox 
                    id="feat-roles" 
                    checked={features.roles}
                    onCheckedChange={() => toggleFeature("roles")}
                    className="mt-1"
                  />
                  <div className="grid gap-1.5 leading-none">
                    <Label htmlFor="feat-roles" className="text-base font-semibold flex items-center gap-2">
                      <Shield className="w-4 h-4 text-primary" /> Role Based Access Control (RBAC)
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Manage administrative roles and specific feature access for staff members.
                    </p>
                  </div>
                </div>
                <Separator />
                
                <div className="flex items-start space-x-4">
                  <Checkbox 
                    id="feat-achievements" 
                    checked={features.achievements}
                    onCheckedChange={() => toggleFeature("achievements")}
                    className="mt-1"
                  />
                  <div className="grid gap-1.5 leading-none">
                    <Label htmlFor="feat-achievements" className="text-base font-semibold flex items-center gap-2">
                      <Trophy className="w-4 h-4 text-primary" /> Achievements & Karma
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Gamification engine to reward points, badges, and track student/intern progress.
                    </p>
                  </div>
                </div>
                <Separator />
                
                <div className="flex items-start space-x-4">
                  <Checkbox 
                    id="feat-logs" 
                    checked={features.logs}
                    onCheckedChange={() => toggleFeature("logs")}
                    className="mt-1"
                  />
                  <div className="grid gap-1.5 leading-none">
                    <Label htmlFor="feat-logs" className="text-base font-semibold flex items-center gap-2">
                      <ScrollText className="w-4 h-4 text-primary" /> System Logs
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Audit trails and debugging logs for technical staff and administrators.
                    </p>
                  </div>
                </div>
                
              </CardContent>
            </Card>
          )}

          {activeTab === "components" && (
            <Card className="border-border/50 shadow-sm animate-in fade-in slide-in-from-bottom-4 duration-500">
              <CardHeader>
                <CardTitle>UI Components</CardTitle>
                <CardDescription>
                  Granular control over specific frontend features and buttons. Disabling these will hide them globally across all dashboard modules.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                
                <div className="flex items-start space-x-4">
                  <Checkbox 
                    id="comp-export" 
                    checked={uiElements.showExportButtons}
                    onCheckedChange={() => toggleUIElement("showExportButtons")}
                    className="mt-1"
                  />
                  <div className="grid gap-1.5 leading-none">
                    <Label htmlFor="comp-export" className="text-base font-semibold flex items-center gap-2">
                      <Download className="w-4 h-4 text-primary" /> Export Buttons
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Display buttons to download CSV/JSON reports for events, members, and achievements.
                    </p>
                  </div>
                </div>
                <Separator />
                
                <div className="flex items-start space-x-4">
                  <Checkbox 
                    id="comp-add" 
                    checked={uiElements.showAddButtons}
                    onCheckedChange={() => toggleUIElement("showAddButtons")}
                    className="mt-1"
                  />
                  <div className="grid gap-1.5 leading-none">
                    <Label htmlFor="comp-add" className="text-base font-semibold flex items-center gap-2">
                      <PlusCircle className="w-4 h-4 text-primary" /> Create Buttons
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Display buttons that allow users to add new entities (e.g. Add Event, Add Member).
                    </p>
                  </div>
                </div>
                <Separator />
                
                <div className="flex items-start space-x-4">
                  <Checkbox 
                    id="comp-edit" 
                    checked={uiElements.showEditButtons}
                    onCheckedChange={() => toggleUIElement("showEditButtons")}
                    className="mt-1"
                  />
                  <div className="grid gap-1.5 leading-none">
                    <Label htmlFor="comp-edit" className="text-base font-semibold flex items-center gap-2">
                      <Edit className="w-4 h-4 text-primary" /> Edit Actions
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Display the pencil icon and allow inline editing of data within tables.
                    </p>
                  </div>
                </div>
                <Separator />
                
                <div className="flex items-start space-x-4">
                  <Checkbox 
                    id="comp-delete" 
                    checked={uiElements.showDeleteButtons}
                    onCheckedChange={() => toggleUIElement("showDeleteButtons")}
                    className="mt-1"
                  />
                  <div className="grid gap-1.5 leading-none">
                    <Label htmlFor="comp-delete" className="text-base font-semibold flex items-center gap-2">
                      <Trash2 className="w-4 h-4 text-primary" /> Delete Actions
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Display the trash can icon and allow deletion of data within tables.
                    </p>
                  </div>
                </div>
                <Separator />

                <div className="flex items-start space-x-4">
                  <Checkbox 
                    id="comp-search" 
                    checked={uiElements.showSearchBars}
                    onCheckedChange={() => toggleUIElement("showSearchBars")}
                    className="mt-1"
                  />
                  <div className="grid gap-1.5 leading-none">
                    <Label htmlFor="comp-search" className="text-base font-semibold flex items-center gap-2">
                      <Search className="w-4 h-4 text-primary" /> Search Bars
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Display the search input box for filtering data tables.
                    </p>
                  </div>
                </div>

              </CardContent>
            </Card>
          )}

          {activeTab === "frontend_pages" && (
            <Card className="border-border/50 shadow-sm animate-in fade-in slide-in-from-bottom-4 duration-500">
              <CardHeader>
                <CardTitle>Frontend Pages</CardTitle>
                <CardDescription>
                  Enable or disable static pages on the public facing website. Disabling a page will remove it from the navigation menus.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                
                <div className="flex items-start space-x-4">
                  <Checkbox 
                    id="page-home" 
                    checked={frontendPages.showHome}
                    onCheckedChange={() => toggleFrontendPage("showHome")}
                    className="mt-1"
                  />
                  <div className="grid gap-1.5 leading-none">
                    <Label htmlFor="page-home" className="text-base font-semibold">Home</Label>
                    <p className="text-sm text-muted-foreground">The main landing page.</p>
                  </div>
                </div>
                <Separator />
                
                <div className="flex items-start space-x-4">
                  <Checkbox 
                    id="page-events" 
                    checked={frontendPages.showEvents}
                    onCheckedChange={() => toggleFrontendPage("showEvents")}
                    className="mt-1"
                  />
                  <div className="grid gap-1.5 leading-none">
                    <Label htmlFor="page-events" className="text-base font-semibold">Events</Label>
                    <p className="text-sm text-muted-foreground">Public events listing page.</p>
                  </div>
                </div>
                <Separator />
                
                <div className="flex items-start space-x-4">
                  <Checkbox 
                    id="page-achievements" 
                    checked={frontendPages.showAchievements}
                    onCheckedChange={() => toggleFrontendPage("showAchievements")}
                    className="mt-1"
                  />
                  <div className="grid gap-1.5 leading-none">
                    <Label htmlFor="page-achievements" className="text-base font-semibold">Achievements</Label>
                    <p className="text-sm text-muted-foreground">Public achievements showcase.</p>
                  </div>
                </div>
                <Separator />
                
                <div className="flex items-start space-x-4">
                  <Checkbox 
                    id="page-execom" 
                    checked={frontendPages.showCatalystExecom}
                    onCheckedChange={() => toggleFrontendPage("showCatalystExecom")}
                    className="mt-1"
                  />
                  <div className="grid gap-1.5 leading-none">
                    <Label htmlFor="page-execom" className="text-base font-semibold">Catalyst Execom</Label>
                    <p className="text-sm text-muted-foreground">Executive committee details.</p>
                  </div>
                </div>
                <Separator />
                
                <div className="flex items-start space-x-4">
                  <Checkbox 
                    id="page-webteam" 
                    checked={frontendPages.showWebTeam}
                    onCheckedChange={() => toggleFrontendPage("showWebTeam")}
                    className="mt-1"
                  />
                  <div className="grid gap-1.5 leading-none">
                    <Label htmlFor="page-webteam" className="text-base font-semibold">Web Team</Label>
                    <p className="text-sm text-muted-foreground">Development team page.</p>
                  </div>
                </div>
                <Separator />
                
                <div className="flex items-start space-x-4">
                  <Checkbox 
                    id="page-mulearn" 
                    checked={frontendPages.showMuLearn}
                    onCheckedChange={() => toggleFrontendPage("showMuLearn")}
                    className="mt-1"
                  />
                  <div className="grid gap-1.5 leading-none">
                    <Label htmlFor="page-mulearn" className="text-base font-semibold">MuLearn & Sub-pages</Label>
                    <p className="text-sm text-muted-foreground">MuLearn ecosystem pages including Campus Snapshot.</p>
                  </div>
                </div>
                <Separator />
                
                <div className="flex items-start space-x-4">
                  <Checkbox 
                    id="page-gallery" 
                    checked={frontendPages.showGallery}
                    onCheckedChange={() => toggleFrontendPage("showGallery")}
                    className="mt-1"
                  />
                  <div className="grid gap-1.5 leading-none">
                    <Label htmlFor="page-gallery" className="text-base font-semibold">Gallery</Label>
                    <p className="text-sm text-muted-foreground">Photo gallery page.</p>
                  </div>
                </div>

              </CardContent>
            </Card>
          )}

          {activeTab === "frontend_components" && (
            <Card className="border-border/50 shadow-sm animate-in fade-in slide-in-from-bottom-4 duration-500">
              <CardHeader>
                <CardTitle>Home Page Sections</CardTitle>
                <CardDescription>
                  Enable or disable specific components and sections on the public Home page.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                
                <div className="flex items-start space-x-4">
                  <Checkbox 
                    id="comp-hero" 
                    checked={frontendComponents.showHero}
                    onCheckedChange={() => toggleFrontendComponent("showHero")}
                    className="mt-1"
                  />
                  <div className="grid gap-1.5 leading-none">
                    <Label htmlFor="comp-hero" className="text-base font-semibold">Hero Section</Label>
                    <p className="text-sm text-muted-foreground">Top animated Catalyst hero section.</p>
                  </div>
                </div>
                <Separator />
                
                <div className="flex items-start space-x-4">
                  <Checkbox 
                    id="comp-addtext" 
                    checked={frontendComponents.showAddText}
                    onCheckedChange={() => toggleFrontendComponent("showAddText")}
                    className="mt-1"
                  />
                  <div className="grid gap-1.5 leading-none">
                    <Label htmlFor="comp-addtext" className="text-base font-semibold">Add Text Banner</Label>
                    <p className="text-sm text-muted-foreground">Animated marquee text banner.</p>
                  </div>
                </div>
                <Separator />
                
                <div className="flex items-start space-x-4">
                  <Checkbox 
                    id="comp-about" 
                    checked={frontendComponents.showAbout}
                    onCheckedChange={() => toggleFrontendComponent("showAbout")}
                    className="mt-1"
                  />
                  <div className="grid gap-1.5 leading-none">
                    <Label htmlFor="comp-about" className="text-base font-semibold">About Section</Label>
                    <p className="text-sm text-muted-foreground">Information about the community.</p>
                  </div>
                </div>
                <Separator />
                
                <div className="flex items-start space-x-4">
                  <Checkbox 
                    id="comp-timeline" 
                    checked={frontendComponents.showTimelineDemo}
                    onCheckedChange={() => toggleFrontendComponent("showTimelineDemo")}
                    className="mt-1"
                  />
                  <div className="grid gap-1.5 leading-none">
                    <Label htmlFor="comp-timeline" className="text-base font-semibold">Timeline</Label>
                    <p className="text-sm text-muted-foreground">Historical timeline or roadmap.</p>
                  </div>
                </div>
                <Separator />
                
                <div className="flex items-start space-x-4">
                  <Checkbox 
                    id="comp-stats" 
                    checked={frontendComponents.showStats}
                    onCheckedChange={() => toggleFrontendComponent("showStats")}
                    className="mt-1"
                  />
                  <div className="grid gap-1.5 leading-none">
                    <Label htmlFor="comp-stats" className="text-base font-semibold">Statistics</Label>
                    <p className="text-sm text-muted-foreground">Community metrics and numbers.</p>
                  </div>
                </div>
                <Separator />
                
                <div className="flex items-start space-x-4">
                  <Checkbox 
                    id="comp-homeevents" 
                    checked={frontendComponents.showHomeEvents}
                    onCheckedChange={() => toggleFrontendComponent("showHomeEvents")}
                    className="mt-1"
                  />
                  <div className="grid gap-1.5 leading-none">
                    <Label htmlFor="comp-homeevents" className="text-base font-semibold">Events Showcase</Label>
                    <p className="text-sm text-muted-foreground">Recent or upcoming events carousel.</p>
                  </div>
                </div>
                <Separator />
                
                <div className="flex items-start space-x-4">
                  <Checkbox 
                    id="comp-ourpioneers" 
                    checked={frontendComponents.showOurPioneers}
                    onCheckedChange={() => toggleFrontendComponent("showOurPioneers")}
                    className="mt-1"
                  />
                  <div className="grid gap-1.5 leading-none">
                    <Label htmlFor="comp-ourpioneers" className="text-base font-semibold">Our Pioneers Slider</Label>
                    <p className="text-sm text-muted-foreground">Pioneers showcase slider.</p>
                  </div>
                </div>
                <Separator />
                
                <div className="flex items-start space-x-4">
                  <Checkbox 
                    id="comp-family" 
                    checked={frontendComponents.showFamilyText}
                    onCheckedChange={() => toggleFrontendComponent("showFamilyText")}
                    className="mt-1"
                  />
                  <div className="grid gap-1.5 leading-none">
                    <Label htmlFor="comp-family" className="text-base font-semibold">Family Text Banner</Label>
                    <p className="text-sm text-muted-foreground">Secondary animated marquee text banner.</p>
                  </div>
                </div>
                <Separator />
                
                <div className="flex items-start space-x-4">
                  <Checkbox 
                    id="comp-team" 
                    checked={frontendComponents.showTeam}
                    onCheckedChange={() => toggleFrontendComponent("showTeam")}
                    className="mt-1"
                  />
                  <div className="grid gap-1.5 leading-none">
                    <Label htmlFor="comp-team" className="text-base font-semibold">Team Grid</Label>
                    <p className="text-sm text-muted-foreground">Execom/Team members grid.</p>
                  </div>
                </div>
                <Separator />
                
                <div className="flex items-start space-x-4">
                  <Checkbox 
                    id="comp-connect" 
                    checked={frontendComponents.showConnect}
                    onCheckedChange={() => toggleFrontendComponent("showConnect")}
                    className="mt-1"
                  />
                  <div className="grid gap-1.5 leading-none">
                    <Label htmlFor="comp-connect" className="text-base font-semibold">Connect Section</Label>
                    <p className="text-sm text-muted-foreground">Contact form or social links.</p>
                  </div>
                </div>

              </CardContent>
            </Card>
          )}

          {activeTab === "page_components" && (
            <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
              {/* Events Page */}
              <Card className="border-border/50 shadow-sm">
                <CardHeader>
                  <CardTitle>Events Page</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-start space-x-4">
                    <Checkbox 
                      id="pe-now" 
                      checked={pageComponents.events.showNowHappening}
                      onCheckedChange={() => togglePageComponent("events", "showNowHappening")}
                    />
                    <div className="grid gap-1.5 leading-none">
                      <Label htmlFor="pe-now" className="text-base font-semibold">Now Happening</Label>
                    </div>
                  </div>
                  <Separator />
                  <div className="flex items-start space-x-4">
                    <Checkbox 
                      id="pe-up" 
                      checked={pageComponents.events.showUpcoming}
                      onCheckedChange={() => togglePageComponent("events", "showUpcoming")}
                    />
                    <div className="grid gap-1.5 leading-none">
                      <Label htmlFor="pe-up" className="text-base font-semibold">Upcoming Events</Label>
                    </div>
                  </div>
                  <Separator />
                  <div className="flex items-start space-x-4">
                    <Checkbox 
                      id="pe-past" 
                      checked={pageComponents.events.showPast}
                      onCheckedChange={() => togglePageComponent("events", "showPast")}
                    />
                    <div className="grid gap-1.5 leading-none">
                      <Label htmlFor="pe-past" className="text-base font-semibold">Past Experiences</Label>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Achievements Page */}
              <Card className="border-border/50 shadow-sm">
                <CardHeader>
                  <CardTitle>Achievements Page</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-start space-x-4">
                    <Checkbox 
                      id="pa-feat" 
                      checked={pageComponents.achievements.showFeatured}
                      onCheckedChange={() => togglePageComponent("achievements", "showFeatured")}
                    />
                    <div className="grid gap-1.5 leading-none">
                      <Label htmlFor="pa-feat" className="text-base font-semibold">Featured Achievement</Label>
                    </div>
                  </div>
                  <Separator />
                  <div className="flex items-start space-x-4">
                    <Checkbox 
                      id="pa-rec" 
                      checked={pageComponents.achievements.showRecent}
                      onCheckedChange={() => togglePageComponent("achievements", "showRecent")}
                    />
                    <div className="grid gap-1.5 leading-none">
                      <Label htmlFor="pa-rec" className="text-base font-semibold">Recent Achievements</Label>
                    </div>
                  </div>
                  <Separator />
                  <div className="flex items-start space-x-4">
                    <Checkbox 
                      id="pa-past" 
                      checked={pageComponents.achievements.showPast}
                      onCheckedChange={() => togglePageComponent("achievements", "showPast")}
                    />
                    <div className="grid gap-1.5 leading-none">
                      <Label htmlFor="pa-past" className="text-base font-semibold">Past Achievements</Label>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Execom Page */}
              <Card className="border-border/50 shadow-sm">
                <CardHeader>
                  <CardTitle>Execom Page</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-start space-x-4">
                    <Checkbox 
                      id="pex-feat" 
                      checked={pageComponents.execom.showFeatured}
                      onCheckedChange={() => togglePageComponent("execom", "showFeatured")}
                    />
                    <div className="grid gap-1.5 leading-none">
                      <Label htmlFor="pex-feat" className="text-base font-semibold">Featured Lead</Label>
                    </div>
                  </div>
                  <Separator />
                  <div className="flex items-start space-x-4">
                    <Checkbox 
                      id="pex-core" 
                      checked={pageComponents.execom.showCore}
                      onCheckedChange={() => togglePageComponent("execom", "showCore")}
                    />
                    <div className="grid gap-1.5 leading-none">
                      <Label htmlFor="pex-core" className="text-base font-semibold">Core Team Grid</Label>
                    </div>
                  </div>
                  <Separator />
                  <div className="flex items-start space-x-4">
                    <Checkbox 
                      id="pex-leg" 
                      checked={pageComponents.execom.showLegacy}
                      onCheckedChange={() => togglePageComponent("execom", "showLegacy")}
                    />
                    <div className="grid gap-1.5 leading-none">
                      <Label htmlFor="pex-leg" className="text-base font-semibold">Legacy Leaders Grid</Label>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Dev Team Page */}
              <Card className="border-border/50 shadow-sm">
                <CardHeader>
                  <CardTitle>Web Team Page</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-start space-x-4">
                    <Checkbox 
                      id="pdt-mem" 
                      checked={pageComponents.devTeam.showMembers}
                      onCheckedChange={() => togglePageComponent("devTeam", "showMembers")}
                    />
                    <div className="grid gap-1.5 leading-none">
                      <Label htmlFor="pdt-mem" className="text-base font-semibold">Team Members Grid</Label>
                    </div>
                  </div>
                  <Separator />
                  <div className="flex items-start space-x-4">
                    <Checkbox 
                      id="pdt-v1" 
                      checked={pageComponents.devTeam.showV1}
                      onCheckedChange={() => togglePageComponent("devTeam", "showV1")}
                    />
                    <div className="grid gap-1.5 leading-none">
                      <Label htmlFor="pdt-v1" className="text-base font-semibold">Catalyst Web V1 Section</Label>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* MuLearn Page */}
              <Card className="border-border/50 shadow-sm">
                <CardHeader>
                  <CardTitle>MuLearn Page</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-start space-x-4">
                    <Checkbox 
                      id="pmu-stats" 
                      checked={pageComponents.mulearn.showStats}
                      onCheckedChange={() => togglePageComponent("mulearn", "showStats")}
                    />
                    <div className="grid gap-1.5 leading-none">
                      <Label htmlFor="pmu-stats" className="text-base font-semibold">Campus Statistics</Label>
                    </div>
                  </div>
                  <Separator />
                  <div className="flex items-start space-x-4">
                    <Checkbox 
                      id="pmu-disc" 
                      checked={pageComponents.mulearn.showDiscord}
                      onCheckedChange={() => togglePageComponent("mulearn", "showDiscord")}
                    />
                    <div className="grid gap-1.5 leading-none">
                      <Label htmlFor="pmu-disc" className="text-base font-semibold">Discord Section</Label>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Gallery Page */}
              <Card className="border-border/50 shadow-sm">
                <CardHeader>
                  <CardTitle>Gallery Page</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-start space-x-4">
                    <Checkbox 
                      id="pg-masonry" 
                      checked={pageComponents.gallery.showMasonry}
                      onCheckedChange={() => togglePageComponent("gallery", "showMasonry")}
                    />
                    <div className="grid gap-1.5 leading-none">
                      <Label htmlFor="pg-masonry" className="text-base font-semibold">Masonry Image Grid</Label>
                    </div>
                  </div>
                </CardContent>
              </Card>

            </div>
          )}

          {activeTab === "appearance" && (
            <Card className="border-border/50 shadow-sm animate-in fade-in slide-in-from-bottom-4 duration-500">
              <CardHeader>
                <CardTitle>Appearance</CardTitle>
                <CardDescription>
                  Customize how the administrative interface looks and feels for all logged-in users.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                
                <div className="flex items-start space-x-4">
                  <Checkbox 
                    id="app-compact" 
                    checked={appearance.compactMode}
                    onCheckedChange={(checked) => updateAppearance({ compactMode: checked as boolean })}
                    className="mt-1"
                  />
                  <div className="grid gap-1.5 leading-none">
                    <Label htmlFor="app-compact" className="text-base font-semibold flex items-center gap-2">
                      <LayoutGrid className="w-4 h-4 text-primary" /> Compact Mode
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Reduce padding and margin across tables and lists to fit more data on screen.
                    </p>
                  </div>
                </div>
                <Separator />
                
                <div className="flex items-start space-x-4">
                  <Checkbox 
                    id="app-badges" 
                    checked={appearance.showSidebarBadges}
                    onCheckedChange={(checked) => updateAppearance({ showSidebarBadges: checked as boolean })}
                    className="mt-1"
                  />
                  <div className="grid gap-1.5 leading-none">
                    <Label htmlFor="app-badges" className="text-base font-semibold flex items-center gap-2">
                      <Sidebar className="w-4 h-4 text-primary" /> Show Sidebar Badges
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Display notification badges or unread counts on the sidebar navigation items.
                    </p>
                  </div>
                </div>

              </CardContent>
            </Card>
          )}

          {activeTab === "permissions" && (
            <Card className="border-border/50 shadow-sm animate-in fade-in slide-in-from-bottom-4 duration-500">
              <CardHeader>
                <CardTitle>Global Permissions</CardTitle>
                <CardDescription>
                  Configure system-wide permission settings and default access roles.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-8">
                
                {/* Registration & Access Settings */}
                <div>
                  <h3 className="text-lg font-medium mb-4 text-foreground/90 flex items-center gap-2">
                    <Users className="w-5 h-5 text-primary" /> Registration & Access
                  </h3>
                  <div className="space-y-6">
                    <div className="flex items-start space-x-4">
                      <Checkbox 
                        id="perm-pub" 
                        checked={permissions.allowPublicRegistration}
                        onCheckedChange={(c) => updatePermissions({ allowPublicRegistration: c as boolean })}
                        className="mt-1"
                      />
                      <div className="grid gap-1.5 leading-none">
                        <Label htmlFor="perm-pub" className="text-base font-semibold">Allow Public Registration</Label>
                        <p className="text-sm text-muted-foreground">
                          Let anyone create an account on the platform without an invite.
                        </p>
                      </div>
                    </div>
                    <Separator />

                    <div className="flex items-start space-x-4">
                      <Checkbox 
                        id="perm-email" 
                        checked={permissions.requireEmailVerification}
                        onCheckedChange={(c) => updatePermissions({ requireEmailVerification: c as boolean })}
                        className="mt-1"
                      />
                      <div className="grid gap-1.5 leading-none">
                        <Label htmlFor="perm-email" className="text-base font-semibold">Require Email Verification</Label>
                        <p className="text-sm text-muted-foreground">
                          New users must verify their email address before accessing features.
                        </p>
                      </div>
                    </div>
                    <Separator />

                    <div className="flex items-start space-x-4">
                      <Checkbox 
                        id="perm-guest" 
                        checked={permissions.enableGuestAccess}
                        onCheckedChange={(c) => updatePermissions({ enableGuestAccess: c as boolean })}
                        className="mt-1"
                      />
                      <div className="grid gap-1.5 leading-none">
                        <Label htmlFor="perm-guest" className="text-base font-semibold">Enable Guest Access</Label>
                        <p className="text-sm text-muted-foreground">
                          Allow non-registered users to view public achievements and events.
                        </p>
                      </div>
                    </div>
                    <Separator />

                    <div className="flex flex-col gap-2">
                      <Label htmlFor="perm-role" className="text-base font-semibold">Default New Member Role</Label>
                      <p className="text-sm text-muted-foreground mb-1">
                        The role automatically assigned to users upon successful registration.
                      </p>
                      <select 
                        id="perm-role" 
                        value={permissions.defaultNewMemberRole}
                        onChange={(e) => updatePermissions({ defaultNewMemberRole: e.target.value })}
                        className="flex h-10 w-full max-w-sm items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        <option value="admin">Admin</option>
                        <option value="editor">Editor</option>
                        <option value="member">Member</option>
                        <option value="viewer">Viewer</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Workflow & Moderation Settings */}
                <div>
                  <h3 className="text-lg font-medium mb-4 text-foreground/90 flex items-center gap-2 mt-8">
                    <Shield className="w-5 h-5 text-primary" /> Workflow & Moderation
                  </h3>
                  <div className="space-y-6">
                    <div className="flex items-start space-x-4">
                      <Checkbox 
                        id="perm-invite" 
                        checked={permissions.allowMemberInvites}
                        onCheckedChange={(c) => updatePermissions({ allowMemberInvites: c as boolean })}
                        className="mt-1"
                      />
                      <div className="grid gap-1.5 leading-none">
                        <Label htmlFor="perm-invite" className="text-base font-semibold">Allow Member Invites</Label>
                        <p className="text-sm text-muted-foreground">
                          Let existing members send registration invites to external users.
                        </p>
                      </div>
                    </div>
                    <Separator />

                    <div className="flex items-start space-x-4">
                      <Checkbox 
                        id="perm-req-evt" 
                        checked={permissions.requireEventApproval}
                        onCheckedChange={(c) => updatePermissions({ requireEventApproval: c as boolean })}
                        className="mt-1"
                      />
                      <div className="grid gap-1.5 leading-none">
                        <Label htmlFor="perm-req-evt" className="text-base font-semibold">Require Event Approval</Label>
                        <p className="text-sm text-muted-foreground">
                          Events created by editors/members require admin approval before going live.
                        </p>
                      </div>
                    </div>
                    <Separator />

                    <div className="flex items-start space-x-4">
                      <Checkbox 
                        id="perm-req-ach" 
                        checked={permissions.requireAchievementApproval}
                        onCheckedChange={(c) => updatePermissions({ requireAchievementApproval: c as boolean })}
                        className="mt-1"
                      />
                      <div className="grid gap-1.5 leading-none">
                        <Label htmlFor="perm-req-ach" className="text-base font-semibold">Require Achievement Approval</Label>
                        <p className="text-sm text-muted-foreground">
                          Achievements submitted by members require admin approval.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

              </CardContent>
            </Card>
          )}
          
        </div>
      </div>
    </div>
  );
}
