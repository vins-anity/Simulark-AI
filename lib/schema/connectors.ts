// Neutral monochrome palette per design guide
export const CONNECTOR_COLORS = {
  default: "var(--brand-charcoal)", // brand-charcoal
  active: "var(--brand-orange)", // brand-orange (for selection)
  inactive: "var(--brand-gray-mid)", // Neutral gray
  error: "var(--color-error)", // Keep error red
} as const;

export type AnimationSpeed = "fast" | "medium" | "slow";

export const ANIMATION_DURATIONS: Record<AnimationSpeed, number> = {
  fast: 500, // WebSocket, Stream
  medium: 1200, // HTTP, HTTPS, gRPC
  slow: 2500, // Database, Queue
};

export const PROTOCOL_CONFIG = {
  http: {
    label: "REST API",
    style: { strokeDasharray: null as unknown as string | null },
    animationSpeed: "medium" as AnimationSpeed,
    color: "var(--brand-charcoal)",
  },
  https: {
    label: "HTTPS",
    style: { strokeDasharray: null as unknown as string | null },
    animationSpeed: "medium" as AnimationSpeed,
    color: "var(--brand-charcoal)",
  },
  graphql: {
    label: "GraphQL",
    style: { strokeDasharray: "5,5" },
    animationSpeed: "medium" as AnimationSpeed,
    color: "var(--brand-charcoal)",
  },
  websocket: {
    label: "Real-Time",
    style: { strokeDasharray: "3,3" },
    animationSpeed: "fast" as AnimationSpeed,
    color: "var(--brand-charcoal)",
  },
  queue: {
    label: "Async Queue",
    style: { strokeDasharray: "8,4" },
    animationSpeed: "slow" as AnimationSpeed,
    color: "var(--brand-charcoal)",
  },
  stream: {
    label: "Data Stream",
    style: { strokeDasharray: "2,2" },
    animationSpeed: "fast" as AnimationSpeed,
    color: "var(--brand-charcoal)",
  },
  database: {
    label: "Query Layer",
    style: {
      strokeDasharray: null as unknown as string | null,
      strokeWidth: 2,
    },
    animationSpeed: "slow" as AnimationSpeed,
    color: "var(--brand-charcoal)",
  },
  cache: {
    label: "Cache Hit",
    style: { strokeDasharray: "4,2" },
    animationSpeed: "fast" as AnimationSpeed,
    color: "var(--brand-charcoal)",
  },
  oauth: {
    label: "OAuth 2.0",
    style: { strokeDasharray: "6,3" },
    animationSpeed: "medium" as AnimationSpeed,
    color: "var(--brand-charcoal)",
  },
  grpc: {
    label: "gRPC",
    style: { strokeDasharray: "4,2" },
    animationSpeed: "medium" as AnimationSpeed,
    color: "var(--brand-charcoal)",
  },
} as const;

export type ProtocolType = keyof typeof PROTOCOL_CONFIG;

/**
 * Get protocol configuration for a given protocol string
 */
export function getProtocolConfig(protocol: string) {
  return PROTOCOL_CONFIG[protocol as ProtocolType] || PROTOCOL_CONFIG.http;
}

/**
 * Get the label to display for a given protocol
 */
export function getProtocolLabel(protocol: string): string {
  return getProtocolConfig(protocol).label;
}

/**
 * Get animation duration in ms for a protocol
 */
export function getAnimationDuration(protocol: string): number {
  const config = getProtocolConfig(protocol);
  return ANIMATION_DURATIONS[config.animationSpeed];
}
