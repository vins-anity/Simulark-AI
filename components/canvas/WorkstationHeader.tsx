"use client";

import { Icon } from "@iconify/react";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowDown,
  ArrowRight,
  ChevronDown,
  ChevronLeft,
  Circle,
  Download,
  FileCode,
  FileDown,
  GitBranch,
  Grid3X3,
  Image as ImageIcon,
  LayoutGrid,
  List,
  Move,
  RotateCcw,
  Zap,
} from "lucide-react";
import Link from "next/link";
import { useCallback, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { updateProjectName } from "@/actions/projects";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { LayoutAlgorithm } from "@/lib/layout";
import type { Project } from "@/lib/schema/graph";
import { useSimulationStore } from "@/lib/store";
import { cn } from "@/lib/utils";

interface WorkstationHeaderProps {
  project: Project | null;
  saving: boolean;
  onExport: (format: "mermaid" | "png" | "pdf" | "svg") => void;
  onExportSkill: () => void;
  onAutolayout: (direction: "DOWN" | "RIGHT") => void;
  onLayoutAlgorithm: (algorithm: LayoutAlgorithm) => void;
}

const LAYOUT_ALGORITHMS: {
  id: LayoutAlgorithm;
  label: string;
  icon: React.ElementType;
}[] = [
  { id: "arch-pattern", label: "Architecture", icon: GitBranch },
  { id: "dagre-hierarchy", label: "Hierarchical", icon: List },
  { id: "radial", label: "Radial", icon: Circle },
  { id: "force", label: "Force", icon: Move },
  { id: "grid", label: "Grid", icon: Grid3X3 },
];

export function WorkstationHeader({
  project,
  saving,
  onExport,
  onExportSkill,
  onAutolayout,
  onLayoutAlgorithm,
}: WorkstationHeaderProps) {
  const { chaosMode, setChaosMode } = useSimulationStore();
  const [currentLayoutIndex, setCurrentLayoutIndex] = useState(0);
  const [isLayoutAnimating, setIsLayoutAnimating] = useState(false);

  // Editable Name State
  const [isEditingName, setIsEditingName] = useState(false);
  const [projectName, setProjectName] = useState(project?.name || "");

  const handleNameSave = async () => {
    if (!project || !projectName.trim() || projectName === project.name) {
      setIsEditingName(false);
      setProjectName(project?.name || "");
      return;
    }

    const result = await updateProjectName(project.id, projectName.trim());
    if (result.success) {
      setIsEditingName(false);
    } else {
      // Revert on error (could also show toast)
      setProjectName(project.name);
      setIsEditingName(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleNameSave();
    } else if (e.key === "Escape") {
      setProjectName(project?.name || "");
      setIsEditingName(false);
    }
  };

  const handleLayoutRotate = useCallback(() => {
    if (isLayoutAnimating) return;

    setIsLayoutAnimating(true);
    const nextIndex = (currentLayoutIndex + 1) % LAYOUT_ALGORITHMS.length;
    const nextAlgorithm = LAYOUT_ALGORITHMS[nextIndex];

    onLayoutAlgorithm(nextAlgorithm.id);
    setCurrentLayoutIndex(nextIndex);

    setTimeout(() => setIsLayoutAnimating(false), 300);
  }, [currentLayoutIndex, isLayoutAnimating, onLayoutAlgorithm]);

  const currentLayout = LAYOUT_ALGORITHMS[currentLayoutIndex];
  const LayoutIcon = currentLayout.icon;

  if (!project) {
    return (
      <header className="h-14 border-b border-border-primary bg-bg-primary" />
    );
  }

  return (
    <header className="h-14 border-b border-border-primary bg-bg-primary/95 backdrop-blur-md flex items-center justify-between px-4 shrink-0 z-20 relative">
      {/* Left Section - Navigation & Identity */}
      <div className="flex items-center gap-2">
        {/* Back Navigation */}
        <Link
          href="/dashboard"
          className="flex items-center justify-center w-9 h-9 text-text-muted hover:text-text-primary hover:bg-bg-tertiary transition-all rounded-none"
          title="[ ESC ] Return to Dashboard"
        >
          <ChevronLeft className="w-4 h-4" />
        </Link>

        <div className="h-6 w-px bg-border-primary" />

        {/* Project Identity - Minimal */}
        <div className="flex items-center gap-2.5">
          <div className="flex items-center gap-2">
            <Icon icon="lucide:box" className="w-4 h-4 text-brand-orange" />

            {isEditingName ? (
              <Input
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                onBlur={handleNameSave}
                onKeyDown={handleKeyDown}
                autoFocus
                className="h-7 w-[200px] text-sm px-2 py-1 font-poppins font-semibold text-text-primary bg-bg-secondary border-brand-orange/50 focus-visible:ring-0 focus-visible:border-brand-orange"
              />
            ) : (
              <span
                onClick={() => setIsEditingName(true)}
                className="font-poppins font-semibold text-sm text-text-primary tracking-tight cursor-text hover:text-brand-orange transition-colors truncate max-w-[300px]"
                title="Click to rename"
              >
                {project.name}
              </span>
            )}
          </div>
          <Badge
            variant="outline"
            className="rounded-none border-border-primary text-[9px] h-5 px-1.5 font-mono uppercase tracking-widest text-text-muted bg-transparent"
          >
            DRAFT
          </Badge>
        </div>

        <div className="h-6 w-px bg-border-primary mx-2" />

        {/* HUD Menu Bar - Technical/Minimal */}
        <nav className="flex items-center gap-0.5">
          {/* File Operations */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 px-3 text-[11px] font-mono uppercase tracking-wider text-text-secondary hover:text-text-primary hover:bg-bg-tertiary rounded-none"
              >
                / File
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="start"
              className="w-52 font-mono text-xs rounded-none border-border-primary shadow-xl"
            >
              <div className="px-3 py-2 text-[9px] uppercase tracking-widest text-text-muted border-b border-border-secondary">
                {"// EXPORT_OPS"}
              </div>

              <DropdownMenuItem
                onClick={onExportSkill}
                className="cursor-pointer rounded-none hover:bg-bg-tertiary focus:bg-bg-tertiary py-2.5"
              >
                <FileCode className="w-3.5 h-3.5 mr-2.5 text-brand-orange" />
                <span>Export Skill</span>
                <span className="ml-auto text-[9px] text-text-muted">.zip</span>
              </DropdownMenuItem>

              <DropdownMenuSeparator className="bg-border-secondary" />

              <DropdownMenuItem
                onClick={() => onExport("mermaid")}
                className="cursor-pointer rounded-none hover:bg-bg-tertiary focus:bg-bg-tertiary py-2.5"
              >
                <Download className="w-3.5 h-3.5 mr-2.5" />
                <span>Mermaid Diagram</span>
              </DropdownMenuItem>

              <DropdownMenuItem
                onClick={() => onExport("png")}
                className="cursor-pointer rounded-none hover:bg-bg-tertiary focus:bg-bg-tertiary py-2.5"
              >
                <ImageIcon className="w-3.5 h-3.5 mr-2.5" />
                <span>PNG Image</span>
              </DropdownMenuItem>

              <DropdownMenuItem
                onClick={() => onExport("pdf")}
                className="cursor-pointer rounded-none hover:bg-bg-tertiary focus:bg-bg-tertiary py-2.5"
              >
                <FileDown className="w-3.5 h-3.5 mr-2.5" />
                <span>PDF Document</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Layout - Primary Action */}
          <div className="flex items-center">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLayoutRotate}
              disabled={isLayoutAnimating}
              className="h-8 px-3 text-[11px] font-mono uppercase tracking-wider text-text-secondary hover:text-text-primary hover:bg-bg-tertiary rounded-none gap-2"
              title="[ L ] Cycle Layout Algorithm"
            >
              <motion.div
                animate={{ rotate: isLayoutAnimating ? 180 : 0 }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
              >
                <LayoutIcon className="w-3.5 h-3.5" />
              </motion.div>
              <span className="hidden sm:inline">{currentLayout.label}</span>
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-7 text-text-muted hover:text-text-primary hover:bg-bg-tertiary rounded-none"
                >
                  <ChevronDown className="w-3 h-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="start"
                className="w-48 font-mono text-xs rounded-none border-border-primary shadow-xl"
              >
                <div className="px-3 py-2 text-[9px] uppercase tracking-widest text-text-muted border-b border-border-secondary">
                  {"// LAYOUT_ALGOS"}
                </div>

                {LAYOUT_ALGORITHMS.map((algo, index) => {
                  const AlgoIcon = algo.icon;
                  return (
                    <DropdownMenuItem
                      key={algo.id}
                      onClick={() => {
                        onLayoutAlgorithm(algo.id);
                        setCurrentLayoutIndex(index);
                      }}
                      className={cn(
                        "cursor-pointer rounded-none hover:bg-bg-tertiary focus:bg-bg-tertiary py-2.5 justify-between",
                        currentLayoutIndex === index && "bg-bg-tertiary",
                      )}
                    >
                      <span className="flex items-center">
                        <AlgoIcon className="w-3.5 h-3.5 mr-2.5" />
                        {algo.label}
                      </span>
                      {currentLayoutIndex === index && (
                        <span className="text-brand-orange text-[10px]">●</span>
                      )}
                    </DropdownMenuItem>
                  );
                })}

                <DropdownMenuSeparator className="bg-border-secondary" />

                <div className="px-3 py-2 text-[9px] uppercase tracking-widest text-text-muted border-b border-border-secondary">
                  {"// DIRECTION"}
                </div>

                <DropdownMenuItem
                  onClick={() => onAutolayout("DOWN")}
                  className="cursor-pointer rounded-none hover:bg-bg-tertiary focus:bg-bg-tertiary py-2.5"
                >
                  <ArrowDown className="w-3.5 h-3.5 mr-2.5" />
                  Vertical (TB)
                </DropdownMenuItem>

                <DropdownMenuItem
                  onClick={() => onAutolayout("RIGHT")}
                  className="cursor-pointer rounded-none hover:bg-bg-tertiary focus:bg-bg-tertiary py-2.5"
                >
                  <ArrowRight className="w-3.5 h-3.5 mr-2.5" />
                  Horizontal (LR)
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Chaos Mode - Direct Toggle */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setChaosMode(!chaosMode)}
            className={cn(
              "h-8 px-3 text-[11px] font-mono uppercase tracking-wider rounded-none gap-2 transition-all",
              chaosMode
                ? "bg-red-500/10 text-red-500 hover:bg-red-500/20 hover:text-red-600"
                : "text-text-secondary hover:text-text-primary hover:bg-bg-tertiary",
            )}
            title="[ C ] Toggle Chaos Engineering"
          >
            <AnimatePresence mode="wait">
              {chaosMode ? (
                <motion.div
                  key="active"
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  exit={{ scale: 0, rotate: 180 }}
                  transition={{ duration: 0.2 }}
                >
                  <Zap className="w-3.5 h-3.5 fill-current" />
                </motion.div>
              ) : (
                <motion.div
                  key="inactive"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <Zap className="w-3.5 h-3.5" />
                </motion.div>
              )}
            </AnimatePresence>
            <span className="hidden sm:inline">
              {chaosMode ? "CHAOS" : "SIM"}
            </span>
          </Button>
        </nav>
      </div>

      {/* Right Section - System Status */}
      <div className="flex items-center gap-3">
        {/* System Status HUD */}
        <div className="hidden md:flex items-center gap-3 text-[10px] font-mono uppercase tracking-widest">
          {/* Connection Status */}
          <div
            className={cn(
              "flex items-center gap-1.5 px-2.5 py-1 border rounded-none",
              saving
                ? "bg-amber-500/10 border-amber-500/30 text-amber-600"
                : "bg-brand-green/10 border-brand-green/30 text-brand-green",
            )}
          >
            <span
              className={cn(
                "w-1.5 h-1.5 rounded-full animate-pulse",
                saving ? "bg-amber-500" : "bg-brand-green",
              )}
            />
            <span>{saving ? "SYNC" : "ONLINE"}</span>
          </div>

          {/* Latency Indicator */}
          <div className="flex items-center gap-1.5 px-2.5 py-1 border border-border-primary text-text-muted">
            <span>LAT:</span>
            <span className="text-text-secondary">12ms</span>
          </div>
        </div>
      </div>
    </header>
  );
}
