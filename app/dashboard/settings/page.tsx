"use client";

import { Icon } from "@iconify/react";
import { createBrowserClient } from "@supabase/ssr";
import { AnimatePresence, motion } from "framer-motion";
import {
  Check,
  ChevronDown,
  Cpu,
  FileText,
  Info,
  LayoutGrid,
  Pencil,
  Rocket,
  Save,
  User,
  TriangleAlert,
  RotateCcw,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { MarketingThemeToggle } from "@/components/marketing/MarketingThemeToggle";
import { resetOnboarding } from "@/actions/onboarding";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { getAvatarUrl } from "@/lib/utils/avatar";

// Module configuration with IDs
const CONFIG_MODULES = [
  {
    id: "CFG-01",
    key: "stack",
    title: "Technology Stack",
    subtitle: "Cloud providers, languages & frameworks",
    icon: Cpu,
    color: "blue",
  },
  {
    id: "CFG-02",
    key: "app-type",
    title: "Application Type",
    subtitle: "Web, mobile, API, CLI, or library",
    icon: LayoutGrid,
    color: "green",
  },
  {
    id: "CFG-03",
    key: "architecture",
    title: "Architecture Patterns",
    subtitle: "Monolith, microservices, serverless",
    icon: FileText,
    color: "purple",
  },
  {
    id: "CFG-04",
    key: "instructions",
    title: "Custom Instructions",
    subtitle: "System prompt guidance & constraints",
    icon: Pencil,
    color: "amber",
  },
  {
    id: "CFG-05",
    key: "generator-defaults",
    title: "Generator Defaults",
    subtitle: "Default constraints & architecture mode",
    icon: Rocket,
    color: "indigo",
  },
] as const;

const ARCHITECTURE_MODES = [
  {
    id: "default",
    label: "Default (Balanced)",
    description: "Balanced approach for most use cases",
    icon: "ph:scales-fill",
  },
  {
    id: "startup",
    label: "Startup (MVP)",
    description: "Cost-optimized, speed to market",
    icon: "ph:rocket-launch-fill",
  },
  {
    id: "corporate",
    label: "Enterprise",
    description: "High availability, security, compliance",
    icon: "ph:buildings-fill",
  },
];

const TECH_CATEGORIES = {
  LANGUAGES: [
    "nodejs",
    "python",
    "go",
    "rust",
    "java",
    "dotnet",
    "php",
    "ruby",
    "bun",
    "deno",
    "elixir",
    "swift",
    "kotlin",
    "csharp",
  ],
  FRAMEWORKS: [
    "nextjs",
    "react",
    "vue",
    "angular",
    "svelte",
    "sveltekit",
    "remix",
    "astro",
    "vite",
    "express",
    "nestjs",
    "fastapi",
    "django",
    "flask",
    "spring",
    "laravel",
    "rails",
    "gin",
    "fiber",
    "hono",
    "elysia",
  ],
  ARCHITECTURES: [
    { id: "monolith", label: "Monolithic", icon: "ph:cube-fill" },
    {
      id: "microservices",
      label: "Microservices",
      icon: "ph:squares-four-fill",
    },
    { id: "serverless", label: "Serverless", icon: "ph:lightning-fill" },
    {
      id: "event-driven",
      label: "Event Driven",
      icon: "ph:arrows-left-right-bold",
    },
    { id: "jamstack", label: "Jamstack", icon: "ph:layers-fill" },
    {
      id: "clean-arch",
      label: "Clean Arch",
      icon: "ph:circle-wavy-check-fill",
    },
  ],
  APPLICATION_TYPES: [
    { id: "web-app", label: "Web App", icon: "ph:globe-simple-fill" },
    {
      id: "mobile-app",
      label: "Mobile App",
      icon: "ph:device-mobile-camera-fill",
    },
    { id: "api", label: "API / Backend", icon: "ph:hard-drives-fill" },
    { id: "cli", label: "CLI Tool", icon: "ph:terminal-window-fill" },
    { id: "library", label: "Library / SDK", icon: "ph:books-fill" },
  ],
};

// Color configurations
const MODULE_COLORS: Record<
  string,
  { bg: string; border: string; text: string; icon: string }
> = {
  blue: {
    bg: "bg-blue-500/5",
    border: "border-blue-500/20",
    text: "text-blue-600",
    icon: "text-blue-500",
  },
  green: {
    bg: "bg-green-500/5",
    border: "border-green-500/20",
    text: "text-green-600",
    icon: "text-green-500",
  },
  purple: {
    bg: "bg-purple-500/5",
    border: "border-purple-500/20",
    text: "text-purple-600",
    icon: "text-purple-500",
  },
  amber: {
    bg: "bg-amber-500/5",
    border: "border-amber-500/20",
    text: "text-amber-600",
    icon: "text-amber-500",
  },
  indigo: {
    bg: "bg-indigo-500/5",
    border: "border-indigo-500/20",
    text: "text-indigo-600",
    icon: "text-indigo-500",
  },
};

// Module Card Component
function ModuleCard({
  module,
  isExpanded,
  onToggle,
  children,
  selectionCount,
}: {
  module: (typeof CONFIG_MODULES)[number];
  isExpanded: boolean;
  onToggle: () => void;
  children: React.ReactNode;
  selectionCount?: number;
}) {
  const colors = MODULE_COLORS[module.color];
  const IconComponent = module.icon;

  return (
    <div
      className={cn(
        "border border-border-primary bg-bg-secondary transition-all duration-300",
        isExpanded && "shadow-md",
      )}
    >
      {/* Card Header */}
      <button
        type="button"
        onClick={onToggle}
        className="w-full flex items-center justify-between p-4 hover:bg-bg-tertiary transition-colors"
      >
        <div className="flex items-center gap-4">
          {/* Icon Container */}
          <div
            className={cn(
              "w-11 h-11 flex items-center justify-center border",
              colors.bg,
              colors.border,
            )}
          >
            <IconComponent className={cn("w-5 h-5", colors.icon)} />
          </div>

          {/* Title Section */}
          <div className="flex flex-col items-start text-left">
            <div className="flex items-center gap-2">
              <h3 className="font-poppins font-semibold text-sm text-text-primary">
                {module.title}
              </h3>
              {/* ID Badge */}
              <span className="font-mono text-[9px] uppercase tracking-wider text-text-muted px-1.5 py-0.5 bg-bg-tertiary border border-border-secondary">
                {module.id}
              </span>
            </div>
            <p className="text-xs text-text-muted mt-0.5">{module.subtitle}</p>
          </div>
        </div>

        {/* Right Side: Selection Count + Chevron */}
        <div className="flex items-center gap-3">
          {selectionCount !== undefined && selectionCount > 0 && (
            <span
              className={cn(
                "font-mono text-[10px] px-2 py-0.5 border",
                colors.bg,
                colors.border,
                colors.text,
              )}
            >
              {selectionCount} selected
            </span>
          )}
          <motion.div
            animate={{ rotate: isExpanded ? 180 : 0 }}
            transition={{ duration: 0.2 }}
          >
            <ChevronDown className="w-4 h-4 text-text-muted" />
          </motion.div>
        </div>
      </button>

      {/* Expandable Content */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="overflow-hidden"
          >
            <div className="border-t border-border-primary px-4 pb-5">
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Tech Grid Component
function TechGrid({
  items,
  selected,
  onToggle,
}: {
  items: any[];
  selected: string[];
  onToggle: (id: string) => void;
}) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2 pt-4">
      {items.map((item) => {
        const isSelected = selected.includes(item.id);
        return (
          <button
            type="button"
            key={item.id}
            onClick={() => onToggle(item.id)}
            className={cn(
              "flex flex-col items-center justify-center p-3 h-[72px] border transition-all duration-200 gap-1.5 relative group",
              isSelected
                ? "bg-brand-orange/5 border-brand-orange"
                : "bg-bg-primary border-border-primary hover:border-border-secondary",
            )}
          >
            <div
              className={cn(
                "text-xl transition-transform duration-200 group-hover:scale-110",
                isSelected ? "scale-110" : "",
              )}
            >
              <Icon icon={item.icon || "ph:placeholder"} />
            </div>
            <span
              className={cn(
                "text-[10px] font-medium text-center truncate w-full px-1 uppercase tracking-wide",
                isSelected ? "text-brand-orange" : "text-text-secondary",
              )}
            >
              {item.label}
            </span>
            {isSelected && (
              <div className="absolute top-1.5 right-1.5">
                <Check className="w-3 h-3 text-brand-orange" />
              </div>
            )}
          </button>
        );
      })}
    </div>
  );
}

export default function SettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [mounted, setMounted] = useState(false);
  const [expandedModule, setExpandedModule] = useState<string | null>("CFG-01");
  const router = useRouter();
  const [resetting, setResetting] = useState(false);

  // Form State
  const [fullName, setFullName] = useState("");
  const [cloudProviders, setCloudProviders] = useState<string[]>([]);
  const [languages, setLanguages] = useState<string[]>([]);
  const [frameworks, setFrameworks] = useState<string[]>([]);
  const [architectureTypes, setArchitectureTypes] = useState<string[]>([]);
  const [applicationType, setApplicationType] = useState<string[]>([]);
  const [customInstructions, setCustomInstructions] = useState("");
  const [defaultArchitectureMode, setDefaultArchitectureMode] =
    useState<string>("default");

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

        const { data: profile } = await supabase
          .from("users")
          .select("preferences")
          .eq("user_id", user.id)
          .single();

        if (profile?.preferences) {
          const prefs = profile.preferences as any;
          if (Array.isArray(prefs.cloudProviders))
            setCloudProviders(prefs.cloudProviders);
          else if (prefs.cloudProvider)
            setCloudProviders([prefs.cloudProvider]);
          if (Array.isArray(prefs.languages)) setLanguages(prefs.languages);
          if (Array.isArray(prefs.frameworks)) setFrameworks(prefs.frameworks);
          if (Array.isArray(prefs.architectureTypes))
            setArchitectureTypes(prefs.architectureTypes);
          if (Array.isArray(prefs.applicationType))
            setApplicationType(prefs.applicationType);
          if (typeof prefs.customInstructions === "string")
            setCustomInstructions(prefs.customInstructions);
          if (typeof prefs.defaultArchitectureMode === "string")
            setDefaultArchitectureMode(prefs.defaultArchitectureMode);
        }
      }
      setLoading(false);
    }

    loadProfile();
  }, []);

  const handleSave = async () => {
    if (!fullName.trim()) {
      toast.error("Validation Error", {
        description: "Full Name cannot be empty.",
      });
      return;
    }

    setSaving(true);
    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    );

    const { error: authError } = await supabase.auth.updateUser({
      data: { full_name: fullName },
    });

    if (authError) {
      toast.error("Error", { description: "Failed to update profile name." });
      setSaving(false);
      return;
    }

    const preferences = {
      cloudProviders,
      languages,
      frameworks,
      architectureTypes,
      applicationType,
      customInstructions,
      defaultArchitectureMode,
    };

    const { error: dbError } = await supabase
      .from("users")
      .update({ preferences, updated_at: new Date().toISOString() })
      .eq("user_id", user.id);

    if (dbError) {
      toast.error("Error", { description: "Failed to update preferences." });
    } else {
      toast.success("Configuration Saved", {
        description: "System parameters updated.",
      });
    }

    setSaving(false);
  };

  const handleReset = async () => {
    if (
      !confirm(
        "Are you sure you want to reset your onboarding progress? This will clear your current settings and take you back to the beginning.",
      )
    ) {
      return;
    }

    setResetting(true);
    const result = await resetOnboarding();

    if (result.success) {
      toast.success("Onboarding Reset", {
        description: "Redirecting to onboarding flow...",
      });
      router.push("/onboarding");
    } else {
      toast.error("Error", {
        description: result.error || "Failed to reset onboarding.",
      });
      setResetting(false);
    }
  };

  const toggleSelection = (
    id: string,
    list: string[],
    setList: (l: string[]) => void,
  ) => {
    if (list.includes(id)) {
      setList(list.filter((i) => i !== id));
    } else {
      setList([...list, id]);
    }
  };

  const cloudItems = TECH_ECOSYSTEM.filter((i: any) => i.category === "cloud");
  const languageItems = TECH_ECOSYSTEM.filter((i: any) =>
    TECH_CATEGORIES.LANGUAGES.includes(i.id),
  );
  const frameworkItems = TECH_ECOSYSTEM.filter((i: any) =>
    TECH_CATEGORIES.FRAMEWORKS.includes(i.id),
  );

  if (!mounted) return null;
  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-bg-primary">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-text-muted border-t-brand-orange animate-spin" />
          <span className="font-mono text-[10px] uppercase tracking-widest text-text-muted">
            Loading Configuration...
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg-primary pb-20">
      {/* Header */}
      <header className="border-b border-border-primary bg-bg-secondary">
        <div className="max-w-4xl mx-auto px-6 py-8">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="font-mono text-[10px] uppercase tracking-widest text-text-muted">
                  {"// SYSTEM_CONFIG"}
                </span>
              </div>
              <h1 className="text-3xl font-poppins font-bold tracking-tight text-text-primary">
                Configuration
              </h1>
              <p className="text-text-secondary mt-2 font-lora">
                Manage profile and AI generator defaults
              </p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 pt-8">
        {/* Profile Module */}
        <section className="mb-8">
          <div className="border border-border-primary bg-bg-secondary">
            <div className="flex items-center gap-3 px-4 py-3 border-b border-border-primary bg-bg-tertiary">
              <User className="w-4 h-4 text-text-muted" />
              <h2 className="font-poppins font-semibold text-sm text-text-primary">
                Profile Information
              </h2>
              <span className="font-mono text-[9px] uppercase tracking-wider text-text-muted px-1.5 py-0.5 bg-bg-secondary border border-border-secondary ml-auto">
                PRF-00
              </span>
            </div>

            <div className="p-5">
              <div className="flex flex-col md:flex-row items-start md:items-center gap-5">
                <Avatar className="h-16 w-16 border-2 border-bg-primary shadow-md">
                  <AvatarImage 
                    src={user?.user_metadata?.avatar_url || getAvatarUrl(user?.email || "")} 
                  />
                  <AvatarFallback className="bg-brand-charcoal text-white text-lg font-poppins">
                    {(fullName || user?.email || "U").charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>

                <div className="grid gap-2 w-full max-w-sm">
                  <Label
                    htmlFor="name"
                    className="text-[10px] font-mono uppercase tracking-widest text-text-muted"
                  >
                    Full Name
                  </Label>
                  <Input
                    id="name"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="bg-bg-primary border-border-primary focus-visible:ring-brand-orange/20 rounded-none"
                  />
                </div>

                <div className="w-full md:w-auto md:ml-auto">
                  <Button
                    type="button"
                    onClick={handleSave}
                    disabled={saving}
                    className="w-full md:w-auto bg-transparent border border-brand-charcoal text-brand-charcoal hover:bg-brand-orange hover:border-brand-orange hover:text-white transition-all duration-200 rounded-none px-5 h-10"
                  >
                    {saving ? (
                      <span className="flex items-center gap-2">
                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-brand-charcoal/20 border-t-brand-charcoal" />
                        Saving
                      </span>
                    ) : (
                      <span className="flex items-center gap-2">
                        <Save className="w-4 h-4" />
                        Save Changes
                      </span>
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Onboarding Settings */}
        <section className="mb-8">
          <div className="border border-border-primary bg-bg-secondary">
            <div className="flex items-center gap-3 px-4 py-3 border-b border-border-primary bg-bg-tertiary">
              <Rocket className="w-4 h-4 text-text-muted" />
              <h2 className="font-poppins font-semibold text-sm text-text-primary">
                Onboarding
              </h2>
              <span className="font-mono text-[9px] uppercase tracking-wider text-text-muted px-1.5 py-0.5 bg-bg-secondary border border-border-secondary ml-auto">
                ONB-00
              </span>
            </div>

            <div className="p-5">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <h3 className="font-medium text-sm text-text-primary mb-1">
                    Getting Started Guide
                  </h3>
                  <p className="text-xs text-text-muted">
                    Complete the onboarding flow to personalize your AI
                    architecture recommendations
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <Link
                    href="/onboarding"
                    className="inline-flex items-center gap-2 px-4 py-2 bg-brand-orange/10 border border-brand-orange/30 text-brand-orange hover:bg-brand-orange hover:text-white transition-colors font-mono text-xs uppercase tracking-wider"
                  >
                    <Rocket className="w-4 h-4" />
                    Restart Onboarding
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Generator Defaults Label */}
        <div className="flex items-center justify-between gap-2 mb-4 px-1">
          <div className="flex items-center gap-2">
            <span className="font-mono text-[10px] uppercase tracking-widest text-text-muted">
              {"// GENERATOR_DEFAULTS"}
            </span>
            <div className="w-12 h-px bg-border-secondary" />
          </div>

          <div className="flex items-center gap-3">
            <span className="font-mono text-[10px] uppercase tracking-widest text-text-muted">
              INTERFACE THEME
            </span>
            <MarketingThemeToggle />
          </div>
        </div>

        {/* Configuration Modules */}
        <section className="space-y-3">
          {/* Tech Stack Module */}
          <ModuleCard
            module={CONFIG_MODULES[0]}
            isExpanded={expandedModule === "CFG-01"}
            onToggle={() =>
              setExpandedModule(expandedModule === "CFG-01" ? null : "CFG-01")
            }
            selectionCount={
              cloudProviders.length + languages.length + frameworks.length
            }
          >
            <div className="pt-4 space-y-6">
              <div>
                <Label className="text-[10px] font-mono uppercase tracking-widest text-text-muted mb-3 block">
                  Cloud Providers
                </Label>
                <TechGrid
                  items={cloudItems}
                  selected={cloudProviders}
                  onToggle={(id) =>
                    toggleSelection(id, cloudProviders, setCloudProviders)
                  }
                />
              </div>

              <div className="h-px bg-border-secondary" />

              <div>
                <Label className="text-[10px] font-mono uppercase tracking-widest text-text-muted mb-3 block">
                  Programming Languages
                </Label>
                <TechGrid
                  items={languageItems}
                  selected={languages}
                  onToggle={(id) =>
                    toggleSelection(id, languages, setLanguages)
                  }
                />
              </div>

              <div className="h-px bg-border-secondary" />

              <div>
                <Label className="text-[10px] font-mono uppercase tracking-widest text-text-muted mb-3 block">
                  Frameworks
                </Label>
                <TechGrid
                  items={frameworkItems}
                  selected={frameworks}
                  onToggle={(id) =>
                    toggleSelection(id, frameworks, setFrameworks)
                  }
                />
              </div>
            </div>
          </ModuleCard>

          {/* Application Type Module */}
          <ModuleCard
            module={CONFIG_MODULES[1]}
            isExpanded={expandedModule === "CFG-02"}
            onToggle={() =>
              setExpandedModule(expandedModule === "CFG-02" ? null : "CFG-02")
            }
            selectionCount={applicationType.length}
          >
            <div className="pt-4">
              <Label className="text-[10px] font-mono uppercase tracking-widest text-text-muted mb-3 block">
                Target Application Type
              </Label>
              <TechGrid
                items={TECH_CATEGORIES.APPLICATION_TYPES}
                selected={applicationType}
                onToggle={(id) =>
                  toggleSelection(id, applicationType, setApplicationType)
                }
              />
            </div>
          </ModuleCard>

          {/* Architecture Patterns Module */}
          <ModuleCard
            module={CONFIG_MODULES[2]}
            isExpanded={expandedModule === "CFG-03"}
            onToggle={() =>
              setExpandedModule(expandedModule === "CFG-03" ? null : "CFG-03")
            }
            selectionCount={architectureTypes.length}
          >
            <div className="pt-4">
              <Label className="text-[10px] font-mono uppercase tracking-widest text-text-muted mb-3 block">
                Architecture Patterns
              </Label>
              <TechGrid
                items={TECH_CATEGORIES.ARCHITECTURES}
                selected={architectureTypes}
                onToggle={(id) =>
                  toggleSelection(id, architectureTypes, setArchitectureTypes)
                }
              />
            </div>
          </ModuleCard>

          {/* Custom Instructions Module */}
          <ModuleCard
            module={CONFIG_MODULES[3]}
            isExpanded={expandedModule === "CFG-04"}
            onToggle={() =>
              setExpandedModule(expandedModule === "CFG-04" ? null : "CFG-04")
            }
            selectionCount={customInstructions ? 1 : 0}
          >
            <div className="pt-4 space-y-3">
              <Label className="text-[10px] font-mono uppercase tracking-widest text-text-muted block">
                System Prompt Instructions
              </Label>
              <div className="bg-amber-50/50 border border-amber-200 p-3 text-xs text-amber-800 flex gap-2">
                <Info className="w-4 h-4 shrink-0 text-amber-600" />
                <span>
                  These instructions will be appended to the system prompt for
                  every generation.
                </span>
              </div>
              <Textarea
                placeholder="e.g. Always use hexagonal architecture, prefer serverless functions..."
                className="min-h-[120px] bg-bg-primary border-border-primary focus-visible:ring-brand-orange/20 rounded-none font-mono text-sm"
                value={customInstructions}
                onChange={(e) => setCustomInstructions(e.target.value)}
              />
            </div>
          </ModuleCard>

          {/* Generator Defaults Module */}
          <ModuleCard
            module={CONFIG_MODULES[4]}
            isExpanded={expandedModule === "CFG-05"}
            onToggle={() =>
              setExpandedModule(expandedModule === "CFG-05" ? null : "CFG-05")
            }
            selectionCount={1}
          >
            <div className="pt-4 space-y-4">
              <div>
                <Label className="text-[10px] font-mono uppercase tracking-widest text-text-muted mb-3 block">
                  Default Architecture Mode
                </Label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {ARCHITECTURE_MODES.map((mode) => {
                    const isSelected = defaultArchitectureMode === mode.id;
                    return (
                      <button
                        key={mode.id}
                        type="button"
                        onClick={() => setDefaultArchitectureMode(mode.id)}
                        className={cn(
                          "flex flex-col items-start p-3 border text-left transition-all duration-200 relative",
                          isSelected
                            ? "bg-brand-orange/5 border-brand-orange"
                            : "bg-bg-primary border-border-primary hover:border-border-secondary",
                        )}
                      >
                        <div className="flex items-center gap-2 mb-1">
                          <Icon
                            icon={mode.icon}
                            className={cn(
                              "text-lg",
                              isSelected
                                ? "text-brand-orange"
                                : "text-text-secondary",
                            )}
                          />
                          <span
                            className={cn(
                              "text-xs font-semibold uppercase tracking-wide",
                              isSelected
                                ? "text-brand-orange"
                                : "text-text-primary",
                            )}
                          >
                            {mode.label}
                          </span>
                        </div>
                        <p className="text-[10px] text-text-secondary">
                          {mode.description}
                        </p>
                        {isSelected && (
                          <div className="absolute top-2 right-2">
                            <Check className="w-3 h-3 text-brand-orange" />
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </ModuleCard>
        </section>

        {/* Danger Zone */}
        <section className="mb-8 border border-red-200 dark:border-red-900/30 bg-red-50/10 dark:bg-red-900/5">
          <div className="flex items-center gap-3 px-4 py-3 border-b border-red-200 dark:border-red-900/30 bg-red-50/20 dark:bg-red-900/10">
            <TriangleAlert className="w-4 h-4 text-red-600 dark:text-red-400" />
            <h2 className="font-poppins font-semibold text-sm text-red-700 dark:text-red-400">
              Danger Zone
            </h2>
          </div>

          <div className="p-5">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <div>
                <h3 className="font-medium text-sm text-text-primary mb-1">
                  Reset Onboarding Progress
                </h3>
                <p className="text-xs text-text-muted">
                  This will clear your architecture preferences and restart the
                  onboarding flow.
                </p>
              </div>
              <Button
                type="button"
                variant="destructive"
                onClick={handleReset}
                disabled={resetting}
                className="bg-red-600 hover:bg-red-700 text-white rounded-none h-9 px-4 text-xs uppercase tracking-wider font-mono"
              >
                {resetting ? (
                  <span className="flex items-center gap-2">
                    <div className="h-3 w-3 animate-spin rounded-full border-2 border-white/20 border-t-white" />
                    Resetting...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <RotateCcw className="w-3 h-3" />
                    Reset Onboarding
                  </span>
                )}
              </Button>
            </div>
          </div>
        </section>

        {/* Save Button - Fixed at bottom on mobile */}
        <div className="mt-8 flex justify-end">
          <Button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="bg-transparent border border-brand-charcoal text-brand-charcoal hover:bg-brand-charcoal hover:text-white transition-all duration-200 rounded-none px-6 h-11"
          >
            {saving ? (
              <span className="flex items-center gap-2">
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-brand-charcoal/20 border-t-brand-charcoal" />
                Saving Configuration...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <Save className="w-4 h-4" />
                Save All Changes
              </span>
            )}
          </Button>
        </div>
      </main>
    </div>
  );
}
