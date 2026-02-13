"use client";

import { Icon } from "@iconify/react";
import { useEdges, useNodes } from "@xyflow/react";
import { Download, FileCode, Link as LinkIcon } from "lucide-react";
import type { JSX } from "react";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  generateCursorRules,
  generateMermaid,
} from "@/lib/bridge/context-generator";

interface ContextBridgeProps {
  projectId: string;
}

export function ContextBridge({ projectId }: ContextBridgeProps): JSX.Element {
  const nodes = useNodes();
  const edges = useEdges();

  const handleCopyCursorRules = () => {
    const content = generateCursorRules(nodes, edges);
    navigator.clipboard.writeText(content);
    toast.success("Cursor Rules copied");
  };

  const handleCopyMermaid = () => {
    const content = generateMermaid(nodes, edges);
    navigator.clipboard.writeText(content);
    toast.success("Mermaid diagram copied");
  };

  const handleCopyLiveURL = () => {
    const url = `${window.location.origin}/api/simulark/context?projectId=${projectId}`;
    navigator.clipboard.writeText(url);
    toast.success("Live Context URL copied");
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          className="h-8 px-3 bg-white border border-brand-charcoal/10 flex items-center gap-2 text-brand-charcoal/60 hover:text-brand-orange hover:border-brand-orange transition-all shadow-sm font-mono text-[10px] uppercase tracking-widest"
          title="Export Context"
        >
          <Icon icon="lucide:share-2" className="w-3 h-3" />
          <span>Export</span>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        className="w-56 rounded-none border border-brand-charcoal bg-white shadow-xl"
        align="end"
      >
        <DropdownMenuLabel className="font-mono text-[10px] uppercase tracking-widest text-brand-charcoal/40 bg-[#faf9f5]">
          Export Protocol
        </DropdownMenuLabel>
        <DropdownMenuSeparator className="bg-brand-charcoal/10" />

        <DropdownMenuItem
          onClick={handleCopyCursorRules}
          className="focus:bg-brand-charcoal focus:text-white cursor-pointer rounded-none font-mono text-xs"
        >
          <FileCode size={14} className="mr-2" />
          <span>.cursorrules</span>
        </DropdownMenuItem>

        <DropdownMenuItem
          onClick={handleCopyMermaid}
          className="focus:bg-brand-charcoal focus:text-white cursor-pointer rounded-none font-mono text-xs"
        >
          <Download size={14} className="mr-2" />
          <span>Mermaid.js</span>
        </DropdownMenuItem>

        <DropdownMenuSeparator className="bg-brand-charcoal/10" />

        <DropdownMenuItem
          onClick={handleCopyLiveURL}
          className="focus:bg-brand-charcoal focus:text-white cursor-pointer rounded-none font-mono text-xs"
        >
          <LinkIcon size={14} className="mr-2" />
          <span>Live Context Link</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
