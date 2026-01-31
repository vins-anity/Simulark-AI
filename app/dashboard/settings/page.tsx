"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { createBrowserClient } from "@supabase/ssr";
import { Icon } from "@iconify/react";
import { getAvatarUrl } from "@/lib/utils/avatar";
import { toast } from "sonner";

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
            toast.success("Success", { description: "Settings saved successfully." });
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
        <div className="max-w-3xl mx-auto space-y-8 font-sans selection:bg-brand-orange/20 selection:text-brand-charcoal">
            <div className="space-y-2">
                <h1 className="text-3xl font-poppins font-bold text-brand-charcoal">Account Settings</h1>
                <p className="text-brand-gray-mid font-lora italic">Manage your profile and architectural preferences.</p>
            </div>

            <div className="space-y-6">
                {/* Profile Card */}
                <Card className="border-brand-charcoal/5 shadow-sm bg-white/50 backdrop-blur-sm">
                    <CardHeader>
                        <CardTitle className="text-xl font-poppins">Profile Information</CardTitle>
                        <CardDescription>Manage your public profile details.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center gap-4 mb-4">
                            <Avatar className="h-20 w-20 border border-brand-charcoal/10">
                                <AvatarImage src={user?.user_metadata?.avatar_url || getAvatarUrl(user?.email || "User")} alt={fullName} />
                                <AvatarFallback className="bg-brand-charcoal text-brand-sand-light text-2xl font-serif italic">
                                    {fullName?.charAt(0) || "U"}
                                </AvatarFallback>
                            </Avatar>
                            <div>
                                <p className="font-medium">{user?.email}</p>
                                <p className="text-sm text-muted-foreground capitalize">{user?.app_metadata?.provider || "Email"} Account</p>
                            </div>
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="fullName">Full Name</Label>
                            <Input id="fullName" value={fullName} onChange={(e) => setFullName(e.target.value)} />
                        </div>
                    </CardContent>
                </Card>

                {/* Preferences Card */}
                <Card className="border-brand-charcoal/5 shadow-sm bg-white/50 backdrop-blur-sm">
                    <CardHeader>
                        <CardTitle className="text-xl font-poppins flex items-center gap-2">
                            <Icon icon="lucide:wand-2" className="w-5 h-5 text-brand-orange" />
                            AI & Generator Preferences
                        </CardTitle>
                        <CardDescription>Customize how Simulark generates your architecture by default.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid gap-2">
                            <Label htmlFor="cloud">Default Cloud Provider</Label>
                            <Select value={cloudProvider} onValueChange={setCloudProvider}>
                                <SelectTrigger id="cloud" className="bg-white">
                                    <SelectValue placeholder="Select Cloud" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="aws">Amazon Web Services (AWS)</SelectItem>
                                    <SelectItem value="gcp">Google Cloud Platform (GCP)</SelectItem>
                                    <SelectItem value="azure">Microsoft Azure</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <Label htmlFor="language">Preferred Language</Label>
                                <Select value={language} onValueChange={setLanguage}>
                                    <SelectTrigger id="language" className="bg-white">
                                        <SelectValue placeholder="Select Language" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="typescript">TypeScript / Node.js</SelectItem>
                                        <SelectItem value="python">Python</SelectItem>
                                        <SelectItem value="go">Go (Golang)</SelectItem>
                                        <SelectItem value="java">Java</SelectItem>
                                        <SelectItem value="csharp">C# / .NET</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="framework">Preferred Framework</Label>
                                <Select value={framework} onValueChange={setFramework}>
                                    <SelectTrigger id="framework" className="bg-white">
                                        <SelectValue placeholder="Select Framework" />
                                    </SelectTrigger>
                                    <SelectContent>
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
                    </CardContent>
                    <CardFooter className="bg-brand-charcoal/5 p-4 flex justify-between items-center rounded-b-lg">
                        <p className="text-xs text-muted-foreground">These settings will be applied to all new projects.</p>
                        <Button onClick={handleSave} disabled={saving} className="bg-brand-charcoal text-brand-sand-light hover:bg-brand-charcoal/90">
                            {saving ? (
                                <>
                                    <Icon icon="lucide:loader-2" className="mr-2 h-4 w-4 animate-spin" />
                                    Saving...
                                </>
                            ) : (
                                "Save Changes"
                            )}
                        </Button>
                    </CardFooter>
                </Card>
            </div>
        </div>
    );
}
