export type SubscriptionTier = 'free' | 'starter' | 'pro';

export const SUBSCRIPTION_PLANS = {
    free: {
        id: 'free',
        name: 'Doodle',
        label: 'Doodle (Free)',
        price: 0,
        description: 'For experimental prototyping.',
        features: [
            'Up to 3 Projects',
            'Standard Node Library',
            'Community Support',
            'Public Exports (PDF, PNG, SVG, Mermaid, Agent Skills)',
            'GLM-4.7-Flash (10x Daily Limit)'
        ],
    },
    starter: {
        id: 'starter',
        name: 'Sketch',
        label: 'Sketch (Starter)',
        price: 5,
        description: 'For professional architects.',
        features: [
            'Unlimited Projects',
            'Advanced Chaos Engineering & Stress Testing',
            'Sophisticated Auto-Layouts (Elkjs/Radial)',
            'Smarter Algorithms (Kimi k2.5, Gemini 3.0, Minimax)',
            'Quick Mode',
            'Enterprise Mode (Corporate Archetype)',
            'Advance node library',
            'Priority Email Support'
        ],
    },
    pro: {
        id: 'pro',
        name: 'Blueprint',
        label: 'Blueprint (Lifetime)',
        price: 10,
        description: 'Forever access for mission-critical scale.',
        features: [
            'Everything in Sketch, Forever',
            'Commercial Usage Rights',
            'Priority Generation Queue',
            'Private Mode (Zero Data Retention)',
            'Early Access to Beta Features',
            'Claude Opus 4.5',
            'Code Generation/Export (coming soon)'
        ],
    },
};

export function getPlanDetails(tier: string) {
    return SUBSCRIPTION_PLANS[tier as SubscriptionTier] || SUBSCRIPTION_PLANS.free;
}
