import type { Edge, Node } from "@xyflow/react";
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function generateMermaidCode(nodes: Node[], edges: Edge[]): string {
  let mermaid = "graph TD\n";

  // Add nodes
  nodes.forEach((node) => {
    const label = (node.data?.label as string) || node.id;
    // Sanitize label for Mermaid
    const sanitizedLabel = label.replace(/["\n]/g, "");
    mermaid += `  ${node.id}["${sanitizedLabel}"]\n`;
  });

  // Add edges
  edges.forEach((edge) => {
    const label =
      (edge.data?.label as string) || (edge.data?.protocol as string) || "";
    const sanitizedLabel = label.replace(/["\n]/g, "");
    if (sanitizedLabel) {
      mermaid += `  ${edge.source} -->|"${sanitizedLabel}"| ${edge.target} \n`;
    } else {
      mermaid += `  ${edge.source} --> ${edge.target} \n`;
    }
  });

  return mermaid;
}
