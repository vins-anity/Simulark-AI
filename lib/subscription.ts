export type SubscriptionTier = 'free' | 'starter' | 'pro' | 'business';

export const SUBSCRIPTION_PLANS = {
    free: {
        id: 'free',
        name: 'Sandbox',
        label: 'Sandbox (Free)',
        price: 0,
        description: 'Perfect for hobbyists and experimentation.',
        features: ['Up to 3 Projects', 'Standard Node Library', 'Community Support'],
    },
    starter: {
        id: 'starter',
        name: 'Sketch',
        label: 'Sketch (Starter)',
        price: 29,
        description: 'For individual creators building serious prototypes.',
        features: ['Unlimited Projects', 'Advanced Chaos Engineering', 'Priority Email Support', 'Export to Terraform'],
    },
    pro: {
        id: 'pro',
        name: 'Blueprint',
        label: 'Blueprint (Pro)',
        price: 100,
        description: 'For teams and professional architects.',
        features: ['Team Shared Workspaces', 'SSO & Audit Trails', 'Global Component Sync', 'Priority 24/7 Support'],
    },
    business: {
        id: 'business',
        name: 'Launch',
        label: 'Launch (Business)',
        price: null, // Contact Sales
        description: 'Custom solutions for large-scale enterprises.',
        features: ['Dedicated Account Manager', 'Custom SLAs', 'On-premise Deployment Options', 'White-labeling'],
    },
};

export function getPlanDetails(tier: string) {
    return SUBSCRIPTION_PLANS[tier as SubscriptionTier] || SUBSCRIPTION_PLANS.free;
}
