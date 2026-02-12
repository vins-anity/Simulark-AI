"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { createBrowserClient } from "@supabase/ssr";
import { Icon } from "@iconify/react";
import { getAvatarUrl } from "@/lib/utils/avatar";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Check, Info } from "lucide-react";

// Explicit lists for strict categorization
const TECH_CATEGORIES = {
  LANGUAGES: [
    "nodejs", "python", "go", "rust", "java", "dotnet", "php", "ruby", "bun", "deno", "elixir",
    "swift", "kotlin", "csharp"
  ],
  FRAMEWORKS: [
    "nextjs", "react", "vue", "angular", "svelte", "sveltekit", "remix", "astro", "vite",
    "express", "nestjs", "fastapi", "django", "flask", "spring", "laravel", "rails", 
    "gin", "fiber", "hono", "elysia", "adonisjs", "phoenix", "actix", "axum",
    "flutter", "react-native", "electron", "tauri", "blazor", "htmx"
  ],
  ARCHITECTURES: [
    { id: "monolith", label: "Monolithic", icon: "ph:cube-fill" },
    { id: "microservices", label: "Microservices", icon: "ph:squares-four-fill" },
    { id: "serverless", label: "Serverless", icon: "ph:lightning-fill" },
    { id: "event-driven", label: "Event Driven", icon: "ph:arrows-left-right-bold" },
    { id: "jamstack", label: "Jamstack", icon: "ph:layers-fill" },
    { id: "clean-arch", label: "Clean Arch", icon: "ph:circle-wavy-check-fill" },
    { id: "mach", label: "MACH", icon: "ph:lego-fill" },
    { id: "soa", label: "SOA", icon: "ph:network-fill" }
  ],
  APPLICATION_TYPES: [
    { id: "web-app", label: "Web App", icon: "ph:globe-simple-fill" },
    { id: "mobile-app", label: "Mobile App", icon: "ph:device-mobile-camera-fill" },
    { id: "desktop-app", label: "Desktop App", icon: "ph:desktop-fill" },
    { id: "api", label: "API / Backend", icon: "ph:hard-drives-fill" },
    { id: "cli", label: "CLI Tool", icon: "ph:terminal-window-fill" },
    { id: "library", label: "Library / SDK", icon: "ph:books-fill" }
  ]
};

export default function SettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [mounted, setMounted] = useState(false);

  // Form State
  const [fullName, setFullName] = useState("");
  const [cloudProviders, setCloudProviders] = useState<string[]>([]);
  const [languages, setLanguages] = useState<string[]>([]);
  const [frameworks, setFrameworks] = useState<string[]>([]);
  const [architectureTypes, setArchitectureTypes] = useState<string[]>([]);
  const [applicationType, setApplicationType] = useState<string[]>([]);
  const [customInstructions, setCustomInstructions] = useState("");
  
  // Tech Ecosystem Data
  const { TECH_ECOSYSTEM } = require("@/lib/tech-ecosystem");

  useEffect(() => {
    setMounted(true);
    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    );

    async function loadProfile() {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        setUser(user);
        setFullName(user.user_metadata?.full_name || "");

        // Load preferences from DB
        const { data: profile } = await supabase
          .from("users")
          .select("preferences")
          .eq("user_id", user.id)
          .single();

        if (profile?.preferences) {
          const prefs = profile.preferences as any;
          // Robust handling of legacy strings vs new arrays
          if (Array.isArray(prefs.cloudProviders)) setCloudProviders(prefs.cloudProviders);
          else if (prefs.cloudProvider) setCloudProviders([prefs.cloudProvider]);
          
          if (Array.isArray(prefs.languages)) setLanguages(prefs.languages);
          else if (prefs.language) setLanguages([prefs.language]);
          
          if (Array.isArray(prefs.frameworks)) setFrameworks(prefs.frameworks);
          else if (prefs.framework) setFrameworks([prefs.framework]);

          if (Array.isArray(prefs.architectureTypes)) setArchitectureTypes(prefs.architectureTypes);
          if (Array.isArray(prefs.applicationType)) setApplicationType(prefs.applicationType);
          if (typeof prefs.customInstructions === "string") setCustomInstructions(prefs.customInstructions);
        }
      }
      setLoading(false);
    }

    loadProfile();
  }, []);

  const handleSave = async () => {
    if (!fullName.trim()) {
      toast.error("Validation Error", { description: "Full Name cannot be empty." });
      return;
    }

    setSaving(true);
    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    );

    // 1. Update Auth Metadata (Name)
    const { error: authError } = await supabase.auth.updateUser({
      data: { full_name: fullName },
    });

    if (authError) {
      toast.error("Error", { description: "Failed to update profile name." });
      setSaving(false);
      return;
    }

    // 2. Update DB Preferences
    const preferences = { 
      cloudProviders, 
      languages, 
      frameworks,
      architectureTypes,
      applicationType,
      customInstructions
    };
    
    const { error: dbError } = await supabase
      .from("users")
      .update({ preferences, updated_at: new Date().toISOString() })
      .eq("user_id", user.id);

    if (dbError) {
      toast.error("Error", { description: "Failed to update preferences." });
    } else {
      toast.success("System Updated", {
        description: "Configuration parameters saved.",
      });
    }

    setSaving(false);
  };

  const toggleSelection = (id: string, list: string[], setList: (l: string[]) => void) => {
    if (list.includes(id)) {
      setList(list.filter((i) => i !== id));
    } else {
      setList([...list, id]);
    }
  };

  const TechGrid = ({ 
    items, 
    selected, 
    setSelected 
  }: { 
    items: any[]; 
    selected: string[]; 
    setSelected: (l: string[]) => void; 
  }) => {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 pt-2">
        {items.map((item: any) => {
          const isSelected = selected.includes(item.id);
          return (
            <button
              key={item.id}
              onClick={() => toggleSelection(item.id, selected, setSelected)}
              className={cn(
                "flex flex-col items-center justify-center p-3 h-20 border transition-all duration-200 gap-2 hover:shadow-sm relative rounded-sm group",
                isSelected 
                  ? "bg-brand-orange/5 border-brand-orange shadow-sm" 
                  : "bg-white border-brand-charcoal/10 hover:border-brand-charcoal/30"
              )}
            >
              <div className={cn("text-2xl transition-transform duration-200 group-hover:scale-110", isSelected && "scale-110")}>
                <Icon icon={item.icon || "ph:placeholder"} />
              </div>
              <span className={cn(
                "text-[10px] font-medium text-center truncate w-full px-1 uppercase tracking-wide",
                isSelected ? "text-brand-orange" : "text-brand-charcoal/70"
              )}>
                {item.label}
              </span>
              {isSelected && (
                <div className="absolute top-1.5 right-1.5 animate-in fade-in zoom-in duration-200">
                  <Check className="w-3 h-3 text-brand-orange" />
                </div>
              )}
            </button>
          );
        })}
      </div>
    );
  };

  // Filter Tech Ecosystem for strictly separated lists
  const cloudItems = TECH_ECOSYSTEM.filter((i: any) => i.category === "cloud");
  const languageItems = TECH_ECOSYSTEM.filter((i: any) => TECH_CATEGORIES.LANGUAGES.includes(i.id));
  const frameworkItems = TECH_ECOSYSTEM.filter((i: any) => TECH_CATEGORIES.FRAMEWORKS.includes(i.id));

  if (!mounted) return null;
  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#faf9f5]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-charcoal" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#faf9f5] font-sans text-brand-charcoal pb-20">
      <div className="max-w-4xl mx-auto pt-12 px-6">
        <header className="mb-12">
          <h1 className="text-3xl font-bold tracking-tight mb-2">
            Settings
          </h1>
          <p className="text-brand-charcoal/60">
            Manage your profile and configure AI generator defaults.
          </p>
        </header>

        <section className="space-y-8">
          {/* Profile Section */}
          <div className="bg-white border border-brand-charcoal/10 p-6 md:p-8 rounded-sm shadow-sm">
            <h2 className="text-lg font-semibold mb-6 flex items-center gap-2">
              <Icon icon="ph:user-circle" className="w-5 h-5 opacity-70" />
              Profile Information
            </h2>
            
            <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
              <Avatar className="h-20 w-20 border-2 border-white shadow-md">
                <AvatarImage src={getAvatarUrl(user?.email || "")} />
                <AvatarFallback className="bg-brand-charcoal text-white text-xl">
                  {(fullName || user?.email || "U").charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>

              <div className="grid gap-2 w-full max-w-sm">
                <Label htmlFor="name" className="text-xs font-mono uppercase tracking-widest text-brand-charcoal/60">
                  Full Name
                </Label>
                <Input
                  id="name"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="bg-[#faf9f5] border-brand-charcoal/20 focus-visible:ring-brand-orange/20"
                />
              </div>
              
              <div className="w-full md:w-auto md:ml-auto pt-4 md:pt-0">
                <Button
                  onClick={handleSave}
                  disabled={saving}
                  className="w-full md:w-auto bg-brand-charcoal text-white rounded-none hover:bg-brand-charcoal/90 px-6 h-10"
                >
                  {saving ? (
                    <span className="flex items-center gap-2">
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/20 border-t-white" />
                      Saving
                    </span>
                  ) : (
                    "Save Changes"
                  )}
                </Button>
              </div>
            </div>
          </div>

          {/* Generator Defaults - Minimalist Accordion */}
          <div className="space-y-2">
            <h2 className="text-lg font-semibold mb-4 px-1 flex items-center gap-2">
              <Icon icon="ph:sliders-horizontal" className="w-5 h-5 opacity-70" />
              Generator Defaults
            </h2>
            
            <Accordion type="single" collapsible className="w-full space-y-2" defaultValue="stack">
              
              {/* Tech Stack */}
              <AccordionItem value="stack" className="bg-white border border-brand-charcoal/10 px-6 rounded-sm">
                <AccordionTrigger className="hover:no-underline py-4">
                  <div className="flex items-center gap-3">
                    <div className="bg-blue-50 p-2 rounded-md">
                       <Icon icon="ph:stack" className="w-5 h-5 text-blue-600" />
                    </div>
                    <div className="text-left">
                      <div className="font-semibold text-sm">Tech Stack</div>
                      <div className="text-xs text-brand-charcoal/50 font-normal">
                        Cloud, Languages & Frameworks
                      </div>
                    </div>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="pb-6 pt-2 space-y-8">
                  <div>
                    <Label className="text-xs font-mono uppercase tracking-widest text-brand-charcoal/50 mb-3 block">
                      Preferred Cloud Providers
                    </Label>
                    <TechGrid items={cloudItems} selected={cloudProviders} setSelected={setCloudProviders} />
                  </div>
                  
                  <div className="h-px bg-slate-100 w-full" />
                  
                  <div>
                    <Label className="text-xs font-mono uppercase tracking-widest text-brand-charcoal/50 mb-3 block">
                      Preferred Languages
                    </Label>
                    <TechGrid items={languageItems} selected={languages} setSelected={setLanguages} />
                  </div>
                  
                  <div className="h-px bg-slate-100 w-full" />
                  
                  <div>
                    <Label className="text-xs font-mono uppercase tracking-widest text-brand-charcoal/50 mb-3 block">
                      Preferred Frameworks
                    </Label>
                    <TechGrid items={frameworkItems} selected={frameworks} setSelected={setFrameworks} />
                  </div>
                </AccordionContent>
              </AccordionItem>
              
               {/* Application Types */}
              <AccordionItem value="app-type" className="bg-white border border-brand-charcoal/10 px-6 rounded-sm">
                <AccordionTrigger className="hover:no-underline py-4">
                  <div className="flex items-center gap-3">
                    <div className="bg-green-50 p-2 rounded-md">
                       <Icon icon="ph:app-window" className="w-5 h-5 text-green-600" />
                    </div>
                    <div className="text-left">
                      <div className="font-semibold text-sm">Application Type</div>
                      <div className="text-xs text-brand-charcoal/50 font-normal">
                        Web App, Mobile, API, etc. (Optional)
                      </div>
                    </div>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="pb-6 pt-2">
                   <Label className="text-xs font-mono uppercase tracking-widest text-brand-charcoal/50 mb-3 block">
                      Target Application
                    </Label>
                   <TechGrid 
                      items={TECH_CATEGORIES.APPLICATION_TYPES} 
                      selected={applicationType} 
                      setSelected={setApplicationType} 
                    />
                </AccordionContent>
              </AccordionItem>

              {/* Architecture Patterns */}
              <AccordionItem value="architecture" className="bg-white border border-brand-charcoal/10 px-6 rounded-sm">
                <AccordionTrigger className="hover:no-underline py-4">
                  <div className="flex items-center gap-3">
                    <div className="bg-purple-50 p-2 rounded-md">
                       <Icon icon="ph:strategy" className="w-5 h-5 text-purple-600" />
                    </div>
                    <div className="text-left">
                      <div className="font-semibold text-sm">Architecture Patterns</div>
                      <div className="text-xs text-brand-charcoal/50 font-normal">
                        Monolith, Microservices, etc. (Optional)
                      </div>
                    </div>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="pb-6 pt-2">
                   <Label className="text-xs font-mono uppercase tracking-widest text-brand-charcoal/50 mb-3 block">
                      Architecture Types
                    </Label>
                   <TechGrid 
                      items={TECH_CATEGORIES.ARCHITECTURES} 
                      selected={architectureTypes} 
                      setSelected={setArchitectureTypes} 
                    />
                </AccordionContent>
              </AccordionItem>
              
              {/* Custom Instructions */}
              <AccordionItem value="instructions" className="bg-white border border-brand-charcoal/10 px-6 rounded-sm">
                <AccordionTrigger className="hover:no-underline py-4">
                  <div className="flex items-center gap-3">
                    <div className="bg-amber-50 p-2 rounded-md">
                       <Icon icon="ph:pencil-simple-line" className="w-5 h-5 text-amber-600" />
                    </div>
                    <div className="text-left">
                      <div className="font-semibold text-sm">Custom Instructions</div>
                      <div className="text-xs text-brand-charcoal/50 font-normal">
                        Natural language guidance
                      </div>
                    </div>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="pb-6 pt-2">
                   <div className="space-y-3">
                     <Label className="text-xs font-mono uppercase tracking-widest text-brand-charcoal/50 block">
                        System Prompt Instructions
                      </Label>
                      <div className="bg-amber-50/50 border border-amber-100 rounded-md p-3 text-xs text-amber-800 flex gap-2 mb-2">
                        <Info className="w-4 h-4 shrink-0" />
                        These instructions will be appended to the system prompt for every generation.
                      </div>
                      <Textarea 
                        placeholder="e.g. Always use hexagonal architecture, prefer serverless functions over containers, avoid complex unnecessary layering..."
                        className="min-h-[120px] bg-[#faf9f5] border-brand-charcoal/20 focus-visible:ring-brand-orange/20 font-mono text-sm"
                        value={customInstructions}
                        onChange={(e) => setCustomInstructions(e.target.value)}
                      />
                   </div>
                </AccordionContent>
              </AccordionItem>

            </Accordion>
          </div>

        </section>

      </div>
    </div>
  );
}
