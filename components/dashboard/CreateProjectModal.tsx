"use client";

import { Icon } from "@iconify/react";
import { createBrowserClient } from "@supabase/ssr";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface CreateProjectModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreateProjectModal({
  open,
  onOpenChange,
}: CreateProjectModalProps) {
  const [projectName, setProjectName] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleCreate = async () => {
    if (!projectName.trim()) return;

    setLoading(true);
    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    );

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      const { data, error } = await supabase
        .from("projects")
        .insert({
          name: projectName,
          user_id: user?.id,
          nodes: [],
          edges: [],
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) throw error;

      toast.success("Project Created", {
        description: `Project "${projectName}" ready.`,
      });
      // Close modal and navigate
      onOpenChange(false);
      setProjectName("");
      router.push(`/projects/${data.id}`);
    } catch (error) {
      console.error("Failed to create project:", error);
      toast.error("Error", { description: "Failed to create project." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px] bg-bg-primary dark:bg-zinc-950 border-brand-charcoal dark:border-zinc-800 gap-0 p-0 overflow-hidden text-brand-charcoal dark:text-gray-100">
        <DialogHeader className="px-6 py-6 border-b border-brand-charcoal/10 dark:border-white/10 bg-bg-secondary dark:bg-zinc-900">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 bg-brand-orange/10 flex items-center justify-center rounded-sm">
              <Icon
                icon="ph:blueprint-fill"
                className="h-6 w-6 text-brand-orange"
              />
            </div>
            <div>
              <DialogTitle className="text-lg font-bold font-poppins text-brand-charcoal dark:text-white">
                New Architecture
              </DialogTitle>
              <p className="text-xs text-brand-charcoal/60 dark:text-gray-400 font-mono mt-1 uppercase tracking-wide">
                Initialize Project Canvas
              </p>
            </div>
          </div>
        </DialogHeader>

        <div className="p-6 space-y-4">
          <div className="space-y-2">
            <Label
              htmlFor="name"
              className="text-xs font-mono uppercase tracking-widest text-brand-charcoal/60 dark:text-gray-400"
            >
              Project Name
            </Label>
            <Input
              id="name"
              placeholder="e.g. E-Commerce Microservices"
              className="bg-bg-secondary dark:bg-zinc-900 border-brand-charcoal/20 dark:border-white/20 focus-visible:ring-brand-orange/20 h-10 font-medium text-brand-charcoal dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-600"
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleCreate()}
              autoFocus
            />
          </div>
        </div>

        <DialogFooter className="px-6 py-4 bg-gray-50/50 dark:bg-zinc-900/50 border-t border-brand-charcoal/5 dark:border-white/5 flex justify-end gap-2">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="border-brand-charcoal/20 dark:border-white/20 hover:bg-gray-100 dark:hover:bg-zinc-800 text-brand-charcoal dark:text-gray-200"
          >
            Cancel
          </Button>
          <Button
            onClick={handleCreate}
            disabled={!projectName.trim() || loading}
            className="bg-brand-charcoal hover:bg-brand-orange text-white min-w-[100px]"
          >
            {loading ? "Creating..." : "Create Project"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
