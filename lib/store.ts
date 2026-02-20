import { create } from "zustand";
import type { StressPlannerMetaInput } from "@/lib/schema/api";
import type {
  StressRunMetric,
  StressRunStreamEvent,
  StressRunVerdict,
} from "@/lib/stress-runner";
import type { StressScenario } from "@/lib/stress-testing-plan";

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
export type StressRunStatus =
  | "idle"
  | "planning"
  | "running"
  | "paused"
  | "aborted"
  | "completed"
  | "error";

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

export interface StressScenarioPlan {
  assumptions: string[];
  scenarios: StressScenario[];
  markdown: string;
  source?: "ai" | "fallback";
  warning?: string;
  plannerMeta?: StressPlannerMetaInput;
}

export interface StressTimelineItem {
  id: string;
  type: "stage" | "incident" | "message";
  message: string;
  severity?: "low" | "medium" | "high" | "critical";
  nodeIds?: string[];
  edgeIds?: string[];
  timestamp: number;
}

const DEFAULT_SIMULATION_METRICS: SimulationMetrics = {
  availability: 100,
  latency: 45,
  errorRate: 0.1,
  throughput: 1250,
};

function createTimelineItem(
  item: Omit<StressTimelineItem, "id" | "timestamp"> &
    Partial<Pick<StressTimelineItem, "timestamp">>,
): StressTimelineItem {
  return {
    ...item,
    id: `stress-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
    timestamp: item.timestamp ?? Date.now(),
  };
}

interface SimulationState {
  viewMode: ViewMode;
  chaosMode: boolean;
  stressMode: boolean;

  // Chaos maps
  nodeStatus: Record<string, NodeStatus>;
  edgeStatus: Record<string, EdgeStatus>;

  // Chaos history and metrics
  failureEvents: FailureEvent[];
  metrics: SimulationMetrics;

  // Stress mode state
  scenarioPlan: StressScenarioPlan | null;
  plannerMode: "auto" | "manual";
  plannerModelId: string;
  selectedScenarioId: string | null;
  runStatus: StressRunStatus;
  runProgress: number;
  runTimeline: StressTimelineItem[];
  runMetrics: StressRunMetric[];
  runVerdict: StressRunVerdict | null;
  stressHotNodes: string[];
  stressHotEdges: string[];
  nodeSpecOverrides: Record<string, Record<string, unknown>>;

  // Common actions
  setViewMode: (mode: ViewMode) => void;

  // Chaos actions
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

  // Stress actions
  setStressMode: (enabled: boolean) => void;
  setScenarioPlan: (plan: StressScenarioPlan | null) => void;
  setPlannerMode: (mode: "auto" | "manual") => void;
  setPlannerModelId: (modelId: string) => void;
  selectScenario: (scenarioId: string | null) => void;
  setNodeSpecOverride: (nodeId: string, patch: Record<string, unknown>) => void;
  setStressPlanning: () => void;
  startStressRun: () => void;
  pauseStressRun: () => void;
  abortStressRun: () => void;
  resetStressRun: () => void;
  processStressEvent: (event: StressRunStreamEvent) => void;
  addStressTimelineMessage: (
    message: string,
    severity?: "low" | "medium" | "high" | "critical",
  ) => void;
}

export const useSimulationStore = create<SimulationState>((set, get) => ({
  viewMode: "fullstack",
  chaosMode: false,
  stressMode: false,
  nodeStatus: {},
  edgeStatus: {},
  failureEvents: [],
  metrics: DEFAULT_SIMULATION_METRICS,
  scenarioPlan: null,
  plannerMode: "auto",
  plannerModelId: "auto",
  selectedScenarioId: null,
  runStatus: "idle",
  runProgress: 0,
  runTimeline: [],
  runMetrics: [],
  runVerdict: null,
  stressHotNodes: [],
  stressHotEdges: [],
  nodeSpecOverrides: {},

  setViewMode: (mode) => set({ viewMode: mode }),

  setChaosMode: (enabled) => {
    if (!enabled) {
      set({
        chaosMode: false,
        nodeStatus: {},
        edgeStatus: {},
        failureEvents: [],
        metrics: DEFAULT_SIMULATION_METRICS,
      });
      return;
    }

    set({ chaosMode: true, stressMode: false });
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

    const killedCount =
      Object.values(get().nodeStatus).filter((status) => status === "killed")
        .length + 1;
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

    setTimeout(() => {
      set((state) => ({
        nodeStatus: {
          ...state.nodeStatus,
          [nodeId]: "active",
        },
      }));

      const events = get().failureEvents.filter(
        (event) => event.nodeId === nodeId && !event.resolved,
      );
      for (const event of events) {
        get().resolveFailure(event.id);
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
      id: `event-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
      timestamp: Date.now(),
    };

    set((state) => ({
      failureEvents: [newEvent, ...state.failureEvents],
    }));
  },

  resolveFailure: (eventId) => {
    set((state) => ({
      failureEvents: state.failureEvents.map((event) =>
        event.id === eventId ? { ...event, resolved: true } : event,
      ),
    }));
  },

  resetSimulation: () =>
    set({
      chaosMode: false,
      nodeStatus: {},
      edgeStatus: {},
      failureEvents: [],
      metrics: DEFAULT_SIMULATION_METRICS,
      stressMode: false,
      scenarioPlan: null,
      plannerMode: "auto",
      plannerModelId: "auto",
      selectedScenarioId: null,
      runStatus: "idle",
      runProgress: 0,
      runTimeline: [],
      runMetrics: [],
      runVerdict: null,
      stressHotNodes: [],
      stressHotEdges: [],
      nodeSpecOverrides: {},
    }),

  getAffectedNodes: (_nodeId) => {
    return [];
  },

  setStressMode: (enabled) => {
    if (!enabled) {
      set({
        stressMode: false,
        runStatus: "idle",
        runProgress: 0,
        runTimeline: [],
        runMetrics: [],
        runVerdict: null,
        stressHotNodes: [],
        stressHotEdges: [],
        nodeSpecOverrides: {},
        plannerMode: "auto",
        plannerModelId: "auto",
      });
      return;
    }

    set({
      stressMode: true,
      chaosMode: false,
    });
  },

  setScenarioPlan: (plan) =>
    set((state) => ({
      scenarioPlan: plan,
      runStatus: state.runStatus === "planning" ? "idle" : state.runStatus,
      selectedScenarioId: plan?.scenarios.some(
        (scenario) => scenario.id === state.selectedScenarioId,
      )
        ? state.selectedScenarioId
        : (plan?.scenarios[0]?.id ?? null),
      runTimeline: plan
        ? [
            ...state.runTimeline,
            createTimelineItem({
              type: "message",
              message: `Scenario plan ready (${plan.scenarios.length} scenarios).`,
              severity: "low",
            }),
          ]
        : state.runTimeline,
    })),

  setPlannerMode: (mode) =>
    set((state) => ({
      plannerMode: mode,
      plannerModelId:
        mode === "auto"
          ? "auto"
          : state.plannerModelId === "auto"
            ? "qwen:qwen-flash"
             : state.plannerModelId,
    })),

  setPlannerModelId: (modelId) => set({ plannerModelId: modelId }),

  selectScenario: (scenarioId) => set({ selectedScenarioId: scenarioId }),

  setNodeSpecOverride: (nodeId, patch) =>
    set((state) => ({
      nodeSpecOverrides: {
        ...state.nodeSpecOverrides,
        [nodeId]: {
          ...(state.nodeSpecOverrides[nodeId] || {}),
          ...patch,
        },
      },
    })),

  setStressPlanning: () =>
    set((state) => ({
      runStatus: "planning",
      runProgress: 0,
      runVerdict: null,
      runMetrics: [],
      runTimeline: [
        ...state.runTimeline,
        createTimelineItem({
          type: "stage",
          message:
            state.plannerMode === "manual"
              ? `Generating stress scenarios with model ${state.plannerModelId}...`
              : "Generating stress scenarios with AI planner chain...",
          severity: "low",
        }),
      ],
    })),

  startStressRun: () =>
    set((state) => ({
      runStatus: "running",
      runProgress: 0,
      runMetrics: [],
      runVerdict: null,
      stressHotNodes: [],
      stressHotEdges: [],
      runTimeline: [
        ...state.runTimeline,
        createTimelineItem({
          type: "stage",
          message: "Stress run started.",
          severity: "low",
        }),
      ],
    })),

  pauseStressRun: () =>
    set((state) => ({
      runStatus: state.runStatus === "running" ? "paused" : state.runStatus,
      runTimeline:
        state.runStatus === "running"
          ? [
              ...state.runTimeline,
              createTimelineItem({
                type: "stage",
                message: "Stress run paused.",
                severity: "medium",
              }),
            ]
          : state.runTimeline,
    })),

  abortStressRun: () =>
    set((state) => ({
      runStatus: state.runStatus === "running" ? "aborted" : state.runStatus,
      stressHotNodes: [],
      stressHotEdges: [],
      runTimeline:
        state.runStatus === "running"
          ? [
              ...state.runTimeline,
              createTimelineItem({
                type: "stage",
                message: "Stress run aborted by user.",
                severity: "high",
              }),
            ]
          : state.runTimeline,
    })),

  resetStressRun: () =>
    set({
      runStatus: "idle",
      runProgress: 0,
      runTimeline: [],
      runMetrics: [],
      runVerdict: null,
      stressHotNodes: [],
      stressHotEdges: [],
    }),

  processStressEvent: (event) => {
    if (event.type === "progress") {
      set((state) => ({
        runProgress: event.data.progress,
        runStatus:
          event.data.stage === "complete" ? "completed" : state.runStatus,
        runTimeline:
          state.runTimeline.length > 0 &&
          state.runTimeline[state.runTimeline.length - 1].message ===
            `Stage: ${event.data.stage}`
            ? state.runTimeline
            : [
                ...state.runTimeline,
                createTimelineItem({
                  type: "stage",
                  message: `Stage: ${event.data.stage}`,
                  severity: "low",
                }),
              ],
      }));
      return;
    }

    if (event.type === "metric") {
      set((state) => ({
        runMetrics: [...state.runMetrics, event.data],
        runProgress: Math.max(state.runProgress, event.data.progress),
        stressHotNodes: event.data.hotNodes,
        stressHotEdges: event.data.hotEdges,
      }));
      return;
    }

    if (event.type === "event") {
      set((state) => ({
        runTimeline: [
          ...state.runTimeline,
          createTimelineItem({
            type: "incident",
            message: event.data.message,
            severity: event.data.severity,
            nodeIds: event.data.nodeIds,
            edgeIds: event.data.edgeIds,
            timestamp: event.data.timestamp,
          }),
        ],
      }));
      return;
    }

    if (event.type === "verdict") {
      set((state) => ({
        runVerdict: event.data,
        runTimeline: [
          ...state.runTimeline,
          createTimelineItem({
            type: "message",
            message: `Verdict: ${event.data.status.toUpperCase()} (${event.data.score}/100)`,
            severity: event.data.status === "pass" ? "low" : "high",
          }),
        ],
      }));
      return;
    }

    if (event.type === "done") {
      set((state) => ({
        runStatus: "completed",
        runProgress: 100,
        runTimeline: [
          ...state.runTimeline,
          createTimelineItem({
            type: "stage",
            message: `Run complete in ${event.data.durationMs}ms with ${event.data.eventCount} incidents.`,
            severity: "low",
          }),
        ],
      }));
      return;
    }

    if (event.type === "error") {
      set((state) => ({
        runStatus: "error",
        runTimeline: [
          ...state.runTimeline,
          createTimelineItem({
            type: "message",
            message: event.data.message,
            severity: "critical",
          }),
        ],
      }));
    }
  },

  addStressTimelineMessage: (message, severity = "low") =>
    set((state) => ({
      runTimeline: [
        ...state.runTimeline,
        createTimelineItem({
          type: "message",
          message,
          severity,
        }),
      ],
    })),
}));
