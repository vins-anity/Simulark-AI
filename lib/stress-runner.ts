import type { Edge, Node } from "@xyflow/react";
import { getDefaultValuesForType } from "@/lib/node-schemas";
import type { StressScenario } from "@/lib/stress-testing-plan";

export type StressRunEventType =
  | "progress"
  | "metric"
  | "event"
  | "verdict"
  | "done"
  | "error";

export interface StressRunMetric {
  step: number;
  progress: number;
  availability: number;
  latency: number;
  errorRate: number;
  throughput: number;
  hotNodes: string[];
  hotEdges: string[];
}

export interface StressRunIncident {
  id: string;
  message: string;
  severity: "low" | "medium" | "high" | "critical";
  nodeIds?: string[];
  edgeIds?: string[];
  timestamp: number;
}

export interface StressRunVerdict {
  status: "pass" | "fail";
  score: number;
  violatedCriteria: string[];
  bottlenecks: string[];
  recommendations: string[];
  summary: string;
}

export type StressRunStreamEvent =
  | {
      type: "progress";
      data: {
        progress: number;
        stage: "initializing" | "running" | "evaluating" | "complete";
      };
    }
  | { type: "metric"; data: StressRunMetric }
  | { type: "event"; data: StressRunIncident }
  | { type: "verdict"; data: StressRunVerdict }
  | {
      type: "done";
      data: {
        durationMs: number;
        eventCount: number;
      };
    }
  | {
      type: "error";
      data: {
        message: string;
      };
    };

export interface StressRunInput {
  nodes: Node[];
  edges: Edge[];
  scenario: StressScenario;
  seed: number;
  nodeSpecOverrides?: Record<string, Record<string, unknown>>;
}

interface StressRunOptions {
  delayMs?: number;
}

function createRng(seed: number): () => number {
  let t = seed >>> 0;
  return () => {
    t += 0x6d2b79f5;
    let x = Math.imul(t ^ (t >>> 15), 1 | t);
    x ^= x + Math.imul(x ^ (x >>> 7), 61 | x);
    return ((x ^ (x >>> 14)) >>> 0) / 4294967296;
  };
}

function parseCpu(cpu: unknown): number {
  if (typeof cpu === "number" && Number.isFinite(cpu)) {
    return Math.max(0.25, cpu);
  }

  if (typeof cpu === "string") {
    const parsed = Number.parseFloat(cpu);
    if (Number.isFinite(parsed)) {
      return Math.max(0.25, parsed);
    }
  }

  return 1;
}

function parseMemoryGb(memory: unknown): number {
  if (typeof memory === "number" && Number.isFinite(memory)) {
    return Math.max(0.25, memory);
  }

  if (typeof memory === "string") {
    const lower = memory.toLowerCase();
    const parsed = Number.parseFloat(lower);
    if (!Number.isFinite(parsed)) return 1;
    if (lower.includes("gb")) return Math.max(0.25, parsed);
    if (lower.includes("mb")) return Math.max(0.25, parsed / 1024);
    return Math.max(0.25, parsed);
  }

  return 1;
}

function getNodeType(node: Node): string {
  return (
    (typeof node.data?.serviceType === "string" && node.data.serviceType) ||
    node.type ||
    "service"
  );
}

function getNodeLabel(node: Node): string {
  return (typeof node.data?.label === "string" && node.data.label) || node.id;
}

function getMergedSpec(
  node: Node,
  overrides: Record<string, Record<string, unknown>>,
): Record<string, unknown> {
  const nodeType = getNodeType(node);
  const defaults = getDefaultValuesForType(nodeType);
  return {
    ...defaults,
    ...(overrides[node.id] || {}),
  };
}

function estimateNodeCapacity(
  node: Node,
  overrides: Record<string, Record<string, unknown>>,
): number {
  const nodeType = getNodeType(node);
  const spec = getMergedSpec(node, overrides);

  switch (nodeType) {
    case "service":
    case "backend":
    case "frontend": {
      const replicas = Number(spec.replicas || 1);
      const cpu = parseCpu(spec.cpu || "1");
      const memory = parseMemoryGb(spec.memory || "512 MB");
      return Math.max(0.5, replicas * cpu * (0.6 + memory * 0.4));
    }
    case "function": {
      const memoryMb = Number(spec.memory || 128);
      return Math.max(0.4, memoryMb / 256);
    }
    case "database": {
      const storageGb = Number(spec.storage_gb || 20);
      const sizeFactor = Math.min(2.5, Math.max(0.7, storageGb / 40));
      return sizeFactor;
    }
    case "cache": {
      return 1.8;
    }
    case "queue":
    case "messaging": {
      return 1.6;
    }
    case "gateway":
    case "loadbalancer": {
      return 1.9;
    }
    case "ai":
    case "ai-model": {
      const window = Number(spec.context_window || 16000);
      return Math.min(2.2, Math.max(0.8, window / 64000));
    }
    default:
      return 1.1;
  }
}

function resolveTargetNodes(nodes: Node[], scenario: StressScenario): string[] {
  if (scenario.targets.length === 0) return [];

  const byLabel = new Map(
    nodes.map((node) => [getNodeLabel(node).toLowerCase(), node.id]),
  );

  const resolved = new Set<string>();
  for (const target of scenario.targets) {
    const normalized = target.toLowerCase().trim();
    if (byLabel.has(normalized)) {
      resolved.add(byLabel.get(normalized)!);
      continue;
    }

    for (const node of nodes) {
      if (
        node.id.toLowerCase() === normalized ||
        getNodeLabel(node).toLowerCase().includes(normalized)
      ) {
        resolved.add(node.id);
      }
    }
  }

  return Array.from(resolved);
}

function resolveTargetEdges(edges: Edge[], scenario: StressScenario): string[] {
  const targets = scenario.targets.map((target) => target.toLowerCase());
  return edges
    .filter((edge) => {
      const route = `${edge.source} -> ${edge.target}`.toLowerCase();
      return targets.some((target) => route.includes(target));
    })
    .map((edge) => edge.id);
}

function deriveRecommendations(
  bottleneckNodes: string[],
  bottleneckEdges: string[],
): string[] {
  const recommendations: string[] = [];

  if (bottleneckNodes.length > 0) {
    recommendations.push(
      "Increase redundancy for bottleneck services (replicas, failover, or partitioning).",
    );
  }

  if (bottleneckEdges.length > 0) {
    recommendations.push(
      "Add timeout, retry, and circuit-breaker safeguards on stressed dependencies.",
    );
  }

  recommendations.push(
    "Use caching and queue buffering to decouple peak traffic from core services.",
  );
  recommendations.push(
    "Track p95 latency and error-rate SLOs before and after architecture changes.",
  );

  return recommendations;
}

function sleep(ms: number): Promise<void> {
  if (ms <= 0) return Promise.resolve();
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function* runStressSimulation(
  input: StressRunInput,
  options: StressRunOptions = {},
): AsyncGenerator<StressRunStreamEvent> {
  const delayMs = options.delayMs ?? 120;
  const rng = createRng(input.seed);
  const overrides = input.nodeSpecOverrides || {};
  const syntheticBaseTimestamp = 1700000000000 + input.seed * 1000;

  const targetNodes = resolveTargetNodes(input.nodes, input.scenario);
  const targetEdges = resolveTargetEdges(input.edges, input.scenario);

  const targetedNodeCapacity =
    targetNodes.length > 0
      ? targetNodes
          .map((nodeId) => {
            const node = input.nodes.find((item) => item.id === nodeId);
            return node ? estimateNodeCapacity(node, overrides) : 1;
          })
          .reduce((sum, value) => sum + value, 0) / targetNodes.length
      : 1.1;

  const loadRatio =
    input.scenario.loadProfile.peakRps / input.scenario.loadProfile.baselineRps;
  const severityBase = Math.max(
    0.7,
    Math.min(3.5, loadRatio / targetedNodeCapacity),
  );

  const totalSteps = 20;
  const incidents: StressRunIncident[] = [];
  const metricHistory: StressRunMetric[] = [];

  yield {
    type: "progress",
    data: {
      progress: 5,
      stage: "initializing",
    },
  };

  await sleep(delayMs);

  for (let step = 1; step <= totalSteps; step++) {
    const progress = Math.round((step / totalSteps) * 90);
    const stressLevel = step / totalSteps;

    const latency =
      55 *
      (1 +
        severityBase * stressLevel * 0.8 +
        (rng() - 0.5) * 0.08 +
        (targetEdges.length > 0 ? 0.12 : 0));

    const errorRate = Math.max(
      0.05,
      0.2 + severityBase * stressLevel * 0.9 + (rng() - 0.5) * 0.15,
    );

    const availability = Math.max(
      85,
      100 - errorRate * 1.2 - severityBase * stressLevel * 1.7,
    );

    const throughput = Math.min(
      input.scenario.loadProfile.peakRps,
      input.scenario.loadProfile.baselineRps +
        (input.scenario.loadProfile.peakRps -
          input.scenario.loadProfile.baselineRps) *
          stressLevel *
          Math.max(0.55, Math.min(1.1, targetedNodeCapacity / severityBase)),
    );

    const hotNodes =
      stressLevel > 0.35
        ? targetNodes.slice(0, Math.max(1, Math.ceil(targetNodes.length * 0.7)))
        : targetNodes.slice(0, 1);

    const hotEdges =
      stressLevel > 0.45
        ? targetEdges.slice(0, Math.max(1, Math.ceil(targetEdges.length * 0.7)))
        : targetEdges.slice(0, 1);

    if (stressLevel > 0.55 && rng() > 0.7) {
      incidents.push({
        id: `stress-incident-${step}`,
        message: `Bottleneck detected at step ${step}: elevated latency on critical path`,
        severity: stressLevel > 0.8 ? "high" : "medium",
        nodeIds: hotNodes,
        edgeIds: hotEdges,
        timestamp: syntheticBaseTimestamp + step * 1000,
      });

      yield {
        type: "event",
        data: incidents[incidents.length - 1],
      };

      await sleep(delayMs);
    }

    const metricPoint: StressRunMetric = {
      step,
      progress,
      availability: Number(availability.toFixed(2)),
      latency: Number(latency.toFixed(2)),
      errorRate: Number(errorRate.toFixed(2)),
      throughput: Number(throughput.toFixed(2)),
      hotNodes,
      hotEdges,
    };

    metricHistory.push(metricPoint);

    yield {
      type: "progress",
      data: {
        progress,
        stage: "running",
      },
    };

    yield {
      type: "metric",
      data: metricPoint,
    };

    await sleep(delayMs);
  }

  const avgLatency =
    metricHistory.reduce((sum, metric) => sum + metric.latency, 0) /
    metricHistory.length;
  const avgErrorRate =
    metricHistory.reduce((sum, metric) => sum + metric.errorRate, 0) /
    metricHistory.length;
  const avgAvailability =
    metricHistory.reduce((sum, metric) => sum + metric.availability, 0) /
    metricHistory.length;

  const latencyPenalty = Math.max(0, (avgLatency - 55) / 55) * 28;
  const errorPenalty = Math.max(0, avgErrorRate - 0.5) * 9;
  const availabilityPenalty = Math.max(0, 99 - avgAvailability) * 4;

  const score = Math.max(
    0,
    Math.min(
      100,
      Math.round(100 - latencyPenalty - errorPenalty - availabilityPenalty),
    ),
  );

  const violatedCriteria: string[] = [];
  if (avgLatency > 165) {
    violatedCriteria.push("Latency exceeded 3x baseline threshold");
  }
  if (avgErrorRate > 2.5) {
    violatedCriteria.push("Error rate exceeded 2.5% threshold");
  }
  if (avgAvailability < 96) {
    violatedCriteria.push("Availability dropped below 96%");
  }

  const bottleneckNodeLabels = Array.from(
    new Set(
      metricHistory
        .flatMap((metric) => metric.hotNodes)
        .map((nodeId) => {
          const node = input.nodes.find((item) => item.id === nodeId);
          return node ? getNodeLabel(node) : nodeId;
        }),
    ),
  ).slice(0, 5);

  const bottleneckEdges = Array.from(
    new Set(metricHistory.flatMap((metric) => metric.hotEdges)),
  ).slice(0, 5);

  const verdict: StressRunVerdict = {
    status: violatedCriteria.length === 0 && score >= 70 ? "pass" : "fail",
    score,
    violatedCriteria,
    bottlenecks: [...bottleneckNodeLabels, ...bottleneckEdges],
    recommendations: deriveRecommendations(
      bottleneckNodeLabels,
      bottleneckEdges,
    ),
    summary:
      violatedCriteria.length === 0
        ? "Architecture remained resilient under simulated stress."
        : "Architecture showed stress-related weaknesses requiring hardening.",
  };

  yield {
    type: "progress",
    data: {
      progress: 98,
      stage: "evaluating",
    },
  };

  await sleep(delayMs);

  yield {
    type: "verdict",
    data: verdict,
  };

  yield {
    type: "progress",
    data: {
      progress: 100,
      stage: "complete",
    },
  };

  yield {
    type: "done",
    data: {
      durationMs: (totalSteps + incidents.length + 2) * delayMs,
      eventCount: incidents.length,
    },
  };
}
