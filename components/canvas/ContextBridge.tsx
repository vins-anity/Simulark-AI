"use client";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Share2, FileCode, Link as LinkIcon, Download } from "lucide-react";
import { toast } from "sonner";
import { generateCursorRules, generateMermaid } from "@/lib/bridge/context-generator";
import { useNodes, useEdges } from "@xyflow/react";
import { JSX } from "react";

interface ContextBridgeProps {
  projectId: string;
}

export function ContextBridge({ projectId }: ContextBridgeProps): JSX.Element {
  const nodes = useNodes();
  const edges = useEdges();

  const handleCopyCursorRules = () => {
    const content = generateCursorRules(nodes, edges);
    navigator.clipboard.writeText(content);
    toast.success("Cursor Rules copied to clipboard!", {
      description: "Paste this into .cursorrules to guide your AI."
    });
  };

  const handleCopyMermaid = () => {
    const content = generateMermaid(nodes, edges);
    navigator.clipboard.writeText(content);
    toast.success("Mermaid diagram copied!", {
      description: "Paste into GitHub or Notion."
    });
  };

  const handleCopyLiveURL = () => {
    // Construct the live URL 
    const url = `${window.location.origin}/api/simulark/context?projectId=${projectId}`;
    navigator.clipboard.writeText(url);
    toast.success("Live Context URL copied!", {
      description: "Feed this URL to external tools."
    });
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="flex items-center gap-2 bg-white/80 backdrop-blur-md border-white/20 shadow-sm hover:bg-white/90">
          <Share2 size={16} />
          <span>Bridge</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56 glass-card" align="end">
        <DropdownMenuLabel>Export Context</DropdownMenuLabel>
        <DropdownMenuSeparator />

        <DropdownMenuItem onClick={handleCopyCursorRules} className="focus:bg-brand-orange/10 cursor-pointer">
          <FileCode size={16} className="mr-2" />
          <span>Copy .cursorrules</span>
        </DropdownMenuItem>

        <DropdownMenuItem onClick={handleCopyMermaid} className="focus:bg-brand-orange/10 cursor-pointer">
          <Download size={16} className="mr-2" />
          <span>Copy Mermaid</span>
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        <DropdownMenuItem onClick={handleCopyLiveURL} className="focus:bg-brand-orange/10 cursor-pointer">
          <LinkIcon size={16} className="mr-2" />
          <span>Copy Live Context URL</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
