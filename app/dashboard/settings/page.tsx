"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { createBrowserClient } from "@supabase/ssr";
import { Icon } from "@iconify/react";
import { getAvatarUrl } from "@/lib/utils/avatar";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

import { Check } from "lucide-react";

export default function SettingsPage() {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [user, setUser] = useState<any>(null);
    const [mounted, setMounted] = useState(false);

    // Form State
    const [fullName, setFullName] = useState("");
    const [cloudProvider, setCloudProvider] = useState("aws");
    const [language, setLanguage] = useState("typescript");
    const [framework, setFramework] = useState("nextjs");

    useEffect(() => {
        setMounted(true);
        const supabase = createBrowserClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
        );

        async function loadProfile() {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                setUser(user);
                setFullName(user.user_metadata?.full_name || "");

                // Load preferences from DB
                const { data: profile } = await supabase
                    .from('users')
                    .select('preferences')
                    .eq('user_id', user.id)
                    .single();

                if (profile?.preferences) {
                    const prefs = profile.preferences as any;
                    if (prefs.cloudProvider) setCloudProvider(prefs.cloudProvider);
                    if (prefs.language) setLanguage(prefs.language);
                    if (prefs.framework) setFramework(prefs.framework);
                }
            }
            setLoading(false);
        }

        loadProfile();
    }, []);

    const handleSave = async () => {
        setSaving(true);
        const supabase = createBrowserClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
        );

        // 1. Update Auth Metadata (Name)
        const { error: authError } = await supabase.auth.updateUser({
            data: { full_name: fullName }
        });

        if (authError) {
            toast.error("Error", { description: "Failed to update profile name." });
            setSaving(false);
            return;
        }

        // 2. Update DB Preferences
        const preferences = { cloudProvider, language, framework };
        const { error: dbError } = await supabase
            .from('users')
            .update({ preferences, updated_at: new Date().toISOString() })
            .eq('user_id', user.id);

        if (dbError) {
            toast.error("Error", { description: "Failed to update preferences." });
        } else {
            toast.success("System Updated", { description: "Configuration parameters saved." });
        }

        setSaving(false);
    };

    if (!mounted) return null;
    if (loading) {
        return (
            <div className="flex items-center justify-center h-full min-h-[50vh]">
                <Icon icon="lucide:loader-2" className="w-8 h-8 animate-spin text-brand-charcoal" />
            </div>
        );
    }

    return (
        <div className="max-w-4xl space-y-12 font-sans selection:bg-brand-orange/20 selection:text-brand-charcoal pb-24">
            {/* Header */}
            <div className="border-b border-brand-charcoal/10 pb-8">
                <div className="flex items-center gap-2 mb-2">
                    <Icon icon="lucide:settings-2" className="w-4 h-4 text-brand-orange" />
                    <span className="font-mono text-xs uppercase tracking-widest text-brand-charcoal/60">
                        Configuration
                    </span>
                </div>
                <h1 className="text-4xl font-poppins font-bold tracking-tight text-brand-charcoal">
                    System Parameters
                </h1>
                <p className="text-xl text-brand-gray-mid font-lora italic mt-4 max-w-2xl">
                    Calibrate your Simulark environment and architectural defaults.
                </p>
            </div>

            <div className="space-y-12">
                {/* Profile Section */}
                <section>
                    <h2 className="font-mono text-xs uppercase tracking-widest text-brand-charcoal/40 mb-6 flex items-center gap-2">
                        <span>// OPERATOR PROFILE</span>
                        <div className="h-px bg-brand-charcoal/10 flex-1" />
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <div className="col-span-1">
                            <div className="bg-white border border-brand-charcoal/10 p-6 flex flex-col items-center text-center">
                                <Avatar className="h-32 w-32 border border-brand-charcoal/10 mb-4">
                                    <AvatarImage src={user?.user_metadata?.avatar_url || getAvatarUrl(user?.email || "User")} alt={fullName} />
                                    <AvatarFallback className="bg-brand-charcoal text-brand-sand-light text-4xl font-serif italic">
                                        {fullName?.charAt(0) || "U"}
                                    </AvatarFallback>
                                </Avatar>
                                <div className="font-mono text-xs text-brand-charcoal/40 uppercase tracking-widest mb-1">ID: {user?.id?.slice(0, 8)}</div>
                                <div className="font-poppins font-bold text-lg text-brand-charcoal">{user?.email}</div>
                            </div>
                        </div>

                        <div className="col-span-1 md:col-span-2 space-y-6">
                            <div className="grid gap-2">
                                <Label htmlFor="fullName" className="font-mono text-[10px] uppercase tracking-widest text-brand-charcoal/60">Operator Name</Label>
                                <Input
                                    id="fullName"
                                    value={fullName}
                                    onChange={(e) => setFullName(e.target.value)}
                                    className="rounded-none border-brand-charcoal/20 bg-white h-12 font-poppins focus-visible:ring-0 focus-visible:border-brand-orange"
                                />
                            </div>
                        </div>
                    </div>
                </section>

                {/* Preferences Section */}
                <section>
                    <h2 className="font-mono text-xs uppercase tracking-widest text-brand-charcoal/40 mb-6 flex items-center gap-2">
                        <span>// GENERATOR DEFAULTS</span>
                        <div className="h-px bg-brand-charcoal/10 flex-1" />
                    </h2>

                    <div className="bg-white border border-brand-charcoal/10 p-8 space-y-8">
                        <div className="grid gap-2">
                            <Label htmlFor="cloud" className="font-mono text-[10px] uppercase tracking-widest text-brand-charcoal/60">Target Cloud Provider</Label>
                            <Select value={cloudProvider} onValueChange={setCloudProvider}>
                                <SelectTrigger id="cloud" className="rounded-none border-brand-charcoal/20 bg-[#faf9f5] h-12 focus:ring-0">
                                    <SelectValue placeholder="Select Cloud" />
                                </SelectTrigger>
                                <SelectContent className="rounded-none border-brand-charcoal font-sans">
                                    <SelectItem value="aws">Amazon Web Services (AWS)</SelectItem>
                                    <SelectItem value="gcp">Google Cloud Platform (GCP)</SelectItem>
                                    <SelectItem value="azure">Microsoft Azure</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="grid grid-cols-2 gap-6">
                            <div className="grid gap-2">
                                <Label htmlFor="language" className="font-mono text-[10px] uppercase tracking-widest text-brand-charcoal/60">Runtime Language</Label>
                                <Select value={language} onValueChange={setLanguage}>
                                    <SelectTrigger id="language" className="rounded-none border-brand-charcoal/20 bg-[#faf9f5] h-12 focus:ring-0">
                                        <SelectValue placeholder="Select Language" />
                                    </SelectTrigger>
                                    <SelectContent className="rounded-none border-brand-charcoal font-sans">
                                        <SelectItem value="typescript">TypeScript / Node.js</SelectItem>
                                        <SelectItem value="python">Python</SelectItem>
                                        <SelectItem value="go">Go (Golang)</SelectItem>
                                        <SelectItem value="java">Java</SelectItem>
                                        <SelectItem value="csharp">C# / .NET</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="framework" className="font-mono text-[10px] uppercase tracking-widest text-brand-charcoal/60">Core Framework</Label>
                                <Select value={framework} onValueChange={setFramework}>
                                    <SelectTrigger id="framework" className="rounded-none border-brand-charcoal/20 bg-[#faf9f5] h-12 focus:ring-0">
                                        <SelectValue placeholder="Select Framework" />
                                    </SelectTrigger>
                                    <SelectContent className="rounded-none border-brand-charcoal font-sans">
                                        <SelectItem value="nextjs">Next.js</SelectItem>
                                        <SelectItem value="express">Express</SelectItem>
                                        <SelectItem value="fastapi">FastAPI</SelectItem>
                                        <SelectItem value="django">Django</SelectItem>
                                        <SelectItem value="gin">Gin</SelectItem>
                                        <SelectItem value="spring">Spring Boot</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Subscription Plans Section Removed - Moved to UpgradeModal */}

                <div className="flex justify-end pt-8 border-t border-brand-charcoal/10">
                    <Button
                        onClick={handleSave}
                        disabled={saving}
                        className="bg-brand-charcoal text-white hover:bg-brand-orange rounded-none h-14 px-8 font-mono text-xs uppercase tracking-widest transition-all"
                    >
                        {saving ? (
                            <>
                                <Icon icon="lucide:loader-2" className="mr-2 h-4 w-4 animate-spin" />
                                PROCESSING...
                            </>
                        ) : (
                            "SAVE CONFIGURATION"
                        )}
                    </Button>
                </div>
            </div>
        </div>
    );
}
