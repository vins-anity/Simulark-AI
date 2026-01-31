import { type Node, type Edge } from '@xyflow/react';

export const SAAS_STARTER_NODES: Node[] = [
    {
        id: '1',
        type: 'service', // Using 'service' as a custom node type placeholder
        position: { x: 250, y: 0 },
        data: {
            label: 'Next.js App',
            techStack: 'Next.js 14',
            description: 'Full-stack framework handling API routes and UI.',
            icon: 'nextjs'
        },
    },
    {
        id: '2',
        type: 'database',
        position: { x: 100, y: 200 },
        data: {
            label: 'Supabase',
            techStack: 'PostgreSQL',
            description: 'Primary database with Row Level Security.',
            icon: 'supabase'
        },
    },
    {
        id: '3',
        type: 'service',
        position: { x: 400, y: 200 },
        data: {
            label: 'Stripe',
            techStack: 'Stripe API',
            description: 'Billing and subscription management.',
            icon: 'stripe'
        },
    },
    {
        id: '4',
        type: 'service',
        position: { x: 250, y: -150 },
        data: {
            label: 'Clerk Auth',
            techStack: 'Clerk',
            description: 'User authentication and management.',
            icon: 'clerk'
        },
    },
];

export const SAAS_STARTER_EDGES: Edge[] = [
    { id: 'e1-2', source: '1', target: '2', animated: true, label: 'Reads/Writes' },
    { id: 'e1-3', source: '1', target: '3', animated: true, label: 'Webhooks' },
    { id: 'e4-1', source: '4', target: '1', animated: true, label: 'Authenticates' },
];

export const TEMPLATE_GRAPHS: Record<string, { nodes: Node[], edges: Edge[] }> = {
    'saas-starter': {
        nodes: SAAS_STARTER_NODES,
        edges: SAAS_STARTER_EDGES,
    },
    // Placeholders for others
    'e-commerce': {
        nodes: [],
        edges: [],
    },
    'iot-dashboard': {
        nodes: [],
        edges: [],
    },
};
