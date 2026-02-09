import { Node, Edge } from '@xyflow/react';

export interface SkillGenerationOptions {
    projectName: string;
    projectDescription?: string;
    nodes: Node[];
    edges: Edge[];
}

export interface GeneratedSkill {
    skillMd: string;
    schemasMd?: string;
    metadata: {
        name: string;
        description: string;
        createdAt: string;
    };
}

/**
 * Analyzes diagram nodes to detect architecture patterns
 */
function analyzeArchitecture(nodes: Node[], edges: Edge[]) {
    // Detect entry points (Gateway, LoadBalancer)
    const entryPoints = nodes.filter(n =>
        n.type === 'gateway' || n.type === 'loadbalancer'
    );

    // Detect databases
    const databases = nodes.filter(n => n.type === 'database');

    // Detect services
    const services = nodes.filter(n => n.type === 'service');

    // Detect caches/queues
    const infrastructure = nodes.filter(n =>
        n.type === 'cache' || n.type === 'queue'
    );

    // Detect anti-patterns (direct client->database connections)
    const antiPatterns: string[] = [];

    // Check for direct database access (no gateway in between)
    const dbConnections = edges.filter(e => {
        const target = nodes.find(n => n.id === e.target);
        return target?.type === 'database';
    });

    dbConnections.forEach(edge => {
        const source = nodes.find(n => n.id === edge.source);
        if (source && source.type !== 'service') {
            antiPatterns.push(
                `Direct connection from ${source.data.label || source.type} to database detected`
            );
        }
    });

    return {
        entryPoints,
        databases,
        services,
        infrastructure,
        antiPatterns,
    };
}

/**
 * Generates architecture rules based on diagram patterns
 */
function generateArchitectureRules(nodes: Node[], edges: Edge[]): string[] {
    const { entryPoints, databases, services } = analyzeArchitecture(nodes, edges);
    const rules: string[] = [];

    // Rule: Always use gateway for external access
    if (entryPoints.length > 0) {
        const gatewayNames = entryPoints.map(n => n.data?.label || 'API Gateway').join(' or ');
        rules.push(`ALWAYS route external requests through ${gatewayNames}`);
    }

    // Rule: Never access database directly from clients
    if (databases.length > 0) {
        rules.push('NEVER access databases directly from client applications');
    }

    // Rule: Use services for business logic
    if (services.length > 0) {
        rules.push('ALWAYS implement business logic within dedicated services');
    }

    return rules;
}

/**
 * Generates service catalog from nodes
 */
function generateServiceCatalog(nodes: Node[]): string {
    const servicesByType: Record<string, Node[]> = {};

    nodes.forEach(node => {
        if (!servicesByType[node.type || 'unknown']) {
            servicesByType[node.type || 'unknown'] = [];
        }
        servicesByType[node.type || 'unknown'].push(node);
    });

    let catalog = '';

    // Organize by type priority
    const typeOrder = ['gateway', 'loadbalancer', 'service', 'database', 'cache', 'queue'];

    typeOrder.forEach(type => {
        const nodes = servicesByType[type];
        if (!nodes || nodes.length === 0) return;

        const typeLabel = type.charAt(0).toUpperCase() + type.slice(1);
        catalog += `\n### ${typeLabel}${nodes.length > 1 ? 's' : ''}\n\n`;

        nodes.forEach(node => {
            const name = node.data?.label || `Unnamed ${type}`;
            const desc = node.data?.description || `${typeLabel} component`;
            catalog += `- **${name}**: ${desc}\n`;
        });
    });

    return catalog;
}

/**
 * Traces data flow patterns through the architecture
 */
function generateDataFlowPatterns(nodes: Node[], edges: Edge[]): string {
    const { entryPoints } = analyzeArchitecture(nodes, edges);

    if (entryPoints.length === 0) {
        return 'No clear entry points detected. Components interact peer-to-peer.';
    }

    let flows = '';

    // Trace from each entry point
    entryPoints.forEach(entry => {
        const entryName: string = (entry.data?.label as string) || 'Gateway';
        flows += `\n**From ${entryName}:**\n`;

        const visited = new Set<string>();
        const queue: Array<{ id: string; path: string[] }> = [{ id: entry.id, path: [entryName] }];

        while (queue.length > 0) {
            const current = queue.shift()!;
            if (visited.has(current.id)) continue;
            visited.add(current.id);

            const outgoingEdges = edges.filter(e => e.source === current.id);

            outgoingEdges.forEach(edge => {
                const target = nodes.find(n => n.id === edge.target);
                if (!target) return;

                const targetName: string = (target.data?.label as string) || target.type || 'Unknown';
                const newPath = [...current.path, targetName];

                if (outgoingEdges.length === 1 || target.type === 'database') {
                    flows += `- ${newPath.join(' → ')}\n`;
                }

                queue.push({ id: target.id, path: newPath });
            });
        }
    });


    return flows;
}

/**
 * Main function to generate SKILL.md content
 */
export function generateSkillContent(options: SkillGenerationOptions): GeneratedSkill {
    const { projectName, projectDescription, nodes, edges } = options;

    const analysis = analyzeArchitecture(nodes, edges);
    const rules = generateArchitectureRules(nodes, edges);
    const catalog = generateServiceCatalog(nodes);
    const dataFlows = generateDataFlowPatterns(nodes, edges);

    // Generate skill name (kebab-case)
    const skillName = projectName.toLowerCase().replace(/\s+/g, '-');

    // Generate description
    const componentTypes = new Set(nodes.map(n => n.type).filter((t): t is string => t !== undefined));
    const componentList = Array.from(componentTypes)
        .map(t => t.charAt(0).toUpperCase() + t.slice(1))
        .join(', ');

    const description = `Expert on the ${projectName} architecture. Use when building services, understanding data flows, or validating code against the approved system design. Covers ${componentList}.`;

    // Build SKILL.md content
    const systemOverview = projectDescription ||
        `${projectName} is a ${componentTypes.has('gateway') ? 'microservices-based' : 'distributed'} architecture with ${nodes.length} components.`;

    let skillMd = `---
name: ${skillName}
description: ${description}
---

# ${projectName} Architecture

## System Overview

${systemOverview}

## Architecture Rules

${rules.length > 0 ? rules.map(r => `- ${r}`).join('\n') : 'No specific rules detected.'}

## Service Catalog
${catalog}

## Data Flow Patterns
${dataFlows}

## When to Use This Skill

Load this skill when:
- Implementing new services for ${projectName}
- Validating code changes against architecture patterns
- Understanding component interactions and data flows
- Onboarding new developers to the ${projectName} system
`;

    // Generate schemas.md if databases exist
    let schemasMd: string | undefined;
    if (analysis.databases.length > 0) {
        schemasMd = `# Database Schemas\n\n`;
        analysis.databases.forEach(db => {
            const name = db.data?.label || 'Database';
            const desc = db.data?.description || 'No schema description provided';
            schemasMd += `## ${name}\n\n${desc}\n\n`;
        });
    }

    return {
        skillMd,
        schemasMd,
        metadata: {
            name: skillName,
            description,
            createdAt: new Date().toISOString(),
        },
    };
}

/**
 * Creates a downloadable ZIP file with the skill package
 */
export async function packageSkill(skill: GeneratedSkill): Promise<Blob> {
    // Use JSZip for browser-side ZIP creation
    const JSZip = (await import('jszip')).default;
    const zip = new JSZip();

    // Add SKILL.md
    zip.file('SKILL.md', skill.skillMd);

    // Add schemas.md if it exists
    if (skill.schemasMd) {
        const referencesFolder = zip.folder('references');
        referencesFolder?.file('schemas.md', skill.schemasMd);
    }

    // Generate ZIP blob
    return await zip.generateAsync({ type: 'blob' });
}
