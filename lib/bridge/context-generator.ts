import { Edge, Node } from "@xyflow/react";

/**
 * Generates a .cursorrules file content based on the current architecture.
 * This allows the user's IDE AI (Cursor) to understand the project structure.
 */
export function generateCursorRules(nodes: Node[], edges: Edge[]) {
    const services = nodes.filter(n => n.type === 'service').map(n => n.data.label).join(', ');
    const dbs = nodes.filter(n => n.type === 'database').map(n => n.data.label).join(', ');

    return `# Simulark Generated Context
# Architecture Overview

This project consists of the following components:
- Services: ${services}
- Databases: ${dbs}

## Connectivity Graph
${edges.map(e => `- ${e.source} connects to ${e.target} via ${e.data?.protocol || 'http'}`).join('\n')}

## Tech Stack
- Frontend: Next.js 16, React Flow, Tailwind CSS
- Backend: Supabase, Edge Functions
- AI: GLM-4.7 (Zhipu) via Simulark SDK

## Coding Guidelines
- Use Functional Components.
- Use Tailwind CSS for styling.
- Prefer Server Actions for backend logic.
`;
}

/**
 * Generates a Mermaid diagram string for documentation.
 */
export function generateMermaid(nodes: Node[], edges: Edge[]) {
    let mermaid = 'graph TD;\n';

    // Add Nodes
    nodes.forEach(node => {
        const label = (node.data.label as string) || node.id;
        // Sanitize label
        const cleanLabel = label.replace(/"/g, "'");
        mermaid += `    ${node.id}["${cleanLabel}"]\n`;
    });

    // Add Edges
    edges.forEach(edge => {
        const protocol = (edge.data?.protocol as string) || '';
        const label = protocol ? `|${protocol}|` : '';
        mermaid += `    ${edge.source} -->${label} ${edge.target}\n`;
    });

    return mermaid;
}

/**
 * Generates a full context object for live API.
 */
export function generateLiveContext(nodes: Node[], edges: Edge[]) {
    return {
        timestamp: new Date().toISOString(),
        architecture: {
            nodes: nodes.map(n => ({ id: n.id, type: n.type, label: n.data.label })),
            edges: edges.map(e => ({ source: e.source, target: e.target, protocol: e.data?.protocol }))
        },
        cursorRules: generateCursorRules(nodes, edges),
        mermaid: generateMermaid(nodes, edges)
    };
}
