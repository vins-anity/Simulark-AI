import { create } from "zustand";

export type ViewMode = "fullstack";
export type NodeStatus = "active" | "killed" | "degraded" | "recovering";
export type EdgeStatus = "active" | "blocked" | "degraded" | "high_latency";
export type FailureType =
  | "node_failure"
  | "network_partition"
  | "high_latency"
  | "packet_loss"
  | "cascade_failure"
  | "resource_exhaustion";

export interface FailureEvent {
  id: string;
  nodeId?: string;
  edgeId?: string;
  type: FailureType;
  timestamp: number;
  description: string;
  severity: "low" | "medium" | "high" | "critical";
  resolved: boolean;
}

interface SimulationMetrics {
  availability: number; // 0-100%
  latency: number; // ms
  errorRate: number; // 0-100%
  throughput: number; // req/s
}

interface SimulationState {
  viewMode: ViewMode;
  chaosMode: boolean;

  // Map of node ID to status
  nodeStatus: Record<string, NodeStatus>;

  // Map of edge ID to status
  edgeStatus: Record<string, EdgeStatus>;

  // Failure history
  failureEvents: FailureEvent[];

  // Current metrics
  metrics: SimulationMetrics;

  // Actions
  setViewMode: (mode: ViewMode) => void;
  setChaosMode: (enabled: boolean) => void;
  toggleNodeStatus: (nodeId: string) => void;
  killNode: (nodeId: string) => void;
  resurrectNode: (nodeId: string) => void;
  degradeNode: (nodeId: string) => void;
  blockEdge: (edgeId: string) => void;
  degradeEdge: (edgeId: string) => void;
  addFailureEvent: (event: Omit<FailureEvent, "id" | "timestamp">) => void;
  resolveFailure: (eventId: string) => void;
  resetSimulation: () => void;
  getAffectedNodes: (nodeId: string) => string[];
}

export const useSimulationStore = create<SimulationState>((set, get) => ({
  viewMode: "fullstack",
  chaosMode: false,
  nodeStatus: {},
  edgeStatus: {},
  failureEvents: [],
  metrics: {
    availability: 100,
    latency: 45,
    errorRate: 0.1,
    throughput: 1250,
  },

  setViewMode: (mode) => set({ viewMode: mode }),

  setChaosMode: (enabled) => {
    if (!enabled) {
      // Reset everything when disabling chaos mode
      set({
        chaosMode: false,
        nodeStatus: {},
        edgeStatus: {},
        failureEvents: [],
        metrics: {
          availability: 100,
          latency: 45,
          errorRate: 0.1,
          throughput: 1250,
        },
      });
    } else {
      set({ chaosMode: true });
    }
  },

  toggleNodeStatus: (nodeId) => {
    const currentStatus = get().nodeStatus[nodeId] || "active";
    const newStatus = currentStatus === "active" ? "killed" : "active";

    set((state) => ({
      nodeStatus: {
        ...state.nodeStatus,
        [nodeId]: newStatus,
      },
    }));

    // Add failure event if node is killed
    if (newStatus === "killed") {
      get().addFailureEvent({
        nodeId,
        type: "node_failure",
        description: `Node ${nodeId} terminated unexpectedly`,
        severity: "high",
        resolved: false,
      });
    }
  },

  killNode: (nodeId) => {
    set((state) => ({
      nodeStatus: {
        ...state.nodeStatus,
        [nodeId]: "killed",
      },
    }));

    get().addFailureEvent({
      nodeId,
      type: "node_failure",
      description: `Service ${nodeId} crashed - Out of memory`,
      severity: "critical",
      resolved: false,
    });

    // Update metrics
    const killedCount =
      Object.values(get().nodeStatus).filter((s) => s === "killed").length + 1;
    const totalNodes = Object.keys(get().nodeStatus).length || 1;
    const availability = Math.max(0, 100 - (killedCount / totalNodes) * 100);

    set((state) => ({
      metrics: {
        ...state.metrics,
        availability: Math.round(availability),
        errorRate: Math.min(100, state.metrics.errorRate + 5),
      },
    }));
  },

  resurrectNode: (nodeId) => {
    set((state) => ({
      nodeStatus: {
        ...state.nodeStatus,
        [nodeId]: "recovering",
      },
    }));

    // Simulate recovery time
    setTimeout(() => {
      set((state) => ({
        nodeStatus: {
          ...state.nodeStatus,
          [nodeId]: "active",
        },
      }));

      // Resolve related failure events
      const events = get().failureEvents.filter(
        (e) => e.nodeId === nodeId && !e.resolved,
      );
      for (const e of events) {
        get().resolveFailure(e.id);
      }
    }, 2000);
  },

  degradeNode: (nodeId) => {
    set((state) => ({
      nodeStatus: {
        ...state.nodeStatus,
        [nodeId]: "degraded",
      },
    }));

    get().addFailureEvent({
      nodeId,
      type: "resource_exhaustion",
      description: `Node ${nodeId} experiencing high CPU utilization`,
      severity: "medium",
      resolved: false,
    });

    set((state) => ({
      metrics: {
        ...state.metrics,
        latency: state.metrics.latency + 50,
        errorRate: state.metrics.errorRate + 2,
      },
    }));
  },

  blockEdge: (edgeId) => {
    set((state) => ({
      edgeStatus: {
        ...state.edgeStatus,
        [edgeId]: "blocked",
      },
    }));

    get().addFailureEvent({
      edgeId,
      type: "network_partition",
      description: `Connection ${edgeId} dropped - Network timeout`,
      severity: "high",
      resolved: false,
    });
  },

  degradeEdge: (edgeId) => {
    set((state) => ({
      edgeStatus: {
        ...state.edgeStatus,
        [edgeId]: "high_latency",
      },
    }));

    get().addFailureEvent({
      edgeId,
      type: "high_latency",
      description: `Connection ${edgeId} experiencing packet loss`,
      severity: "medium",
      resolved: false,
    });

    set((state) => ({
      metrics: {
        ...state.metrics,
        latency: state.metrics.latency + 100,
      },
    }));
  },

  addFailureEvent: (event) => {
    const newEvent: FailureEvent = {
      ...event,
      id: `event-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: Date.now(),
    };

    set((state) => ({
      failureEvents: [newEvent, ...state.failureEvents],
    }));
  },

  resolveFailure: (eventId) => {
    set((state) => ({
      failureEvents: state.failureEvents.map((e) =>
        e.id === eventId ? { ...e, resolved: true } : e,
      ),
    }));
  },

  resetSimulation: () =>
    set({
      chaosMode: false,
      nodeStatus: {},
      edgeStatus: {},
      failureEvents: [],
      metrics: {
        availability: 100,
        latency: 45,
        errorRate: 0.1,
        throughput: 1250,
      },
    }),

  getAffectedNodes: (_nodeId) => {
    // Simple cascade detection - return nodes that would be affected
    // In a real implementation, this would use the graph structure
    return [];
  },
}));
