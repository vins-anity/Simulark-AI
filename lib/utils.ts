import type { Edge, Node } from "@xyflow/react";
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { generateMermaidCode as generateMermaidExport } from "@/lib/mermaid-export";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function generateMermaidCode(nodes: Node[], edges: Edge[]): string {
  return generateMermaidExport(nodes, edges);
}
