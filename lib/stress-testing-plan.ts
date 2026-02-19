import type { Edge, Node } from "@xyflow/react";

export type StressScenarioType =
  | "traffic-spike"
  | "node-failure"
  | "dependency-latency"
  | "queue-backlog"
  | "data-store-hotspot";

export interface StressScenario {
  id: string;
  type: StressScenarioType;
  name: string;
  objective: string;
  targets: string[];
  loadProfile: {
    baselineRps: number;
    peakRps: number;
    rampSeconds: number;
    holdSeconds: number;
  };
  passCriteria: string[];
}

export interface StressTestPlan {
  assumptions: string[];
  scenarios: StressScenario[];
  markdown: string;
}

const BASELINE_RPS = 120;

function getLabel(node: Node): string {
  const label = node.data?.label;
  if (typeof label === "string" && label.trim().length > 0) {
    return label.trim();
  }
  return node.id;
}

function pickTargets(
  nodes: Node[],
  allowedTypes: Set<string>,
  max = 3,
): string[] {
  return nodes
    .filter((node) => (node.type ? allowedTypes.has(node.type) : false))
    .slice(0, max)
    .map(getLabel);
}

function buildScenarios(nodes: Node[], edges: Edge[]): StressScenario[] {
  const scenarios: StressScenario[] = [];

  const gatewayTargets = pickTargets(
    nodes,
    new Set(["gateway", "loadbalancer", "client"]),
  );

  const serviceTargets = pickTargets(
    nodes,
    new Set(["service", "backend", "frontend", "function", "ai"]),
  );

  const queueTargets = pickTargets(nodes, new Set(["queue", "messaging"]));

  const dataTargets = pickTargets(
    nodes,
    new Set(["database", "cache", "storage", "vector-db"]),
  );

  if (gatewayTargets.length > 0) {
    scenarios.push({
      id: "traffic-spike",
      type: "traffic-spike",
      name: "North-South Traffic Spike",
      objective:
        "Verify ingress and autoscaling behavior during sharp traffic growth.",
      targets: gatewayTargets,
      loadProfile: {
        baselineRps: BASELINE_RPS,
        peakRps: BASELINE_RPS * 8,
        rampSeconds: 120,
        holdSeconds: 600,
      },
      passCriteria: [
        "P95 latency remains under 2.5x baseline",
        "Error rate remains below 2% during hold period",
        "System returns to baseline within 5 minutes after spike",
      ],
    });
  }

  if (serviceTargets.length > 0) {
    scenarios.push({
      id: "node-failure",
      type: "node-failure",
      name: "Critical Service Failure",
      objective:
        "Validate graceful degradation and recovery when a core service fails.",
      targets: serviceTargets,
      loadProfile: {
        baselineRps: BASELINE_RPS * 2,
        peakRps: BASELINE_RPS * 3,
        rampSeconds: 60,
        holdSeconds: 420,
      },
      passCriteria: [
        "No complete outage of user-facing flows",
        "Circuit breakers and retries prevent cascade failures",
        "Failed component is recovered or isolated in under 3 minutes",
      ],
    });
  }

  if (edges.length > 0) {
    scenarios.push({
      id: "dependency-latency",
      type: "dependency-latency",
      name: "Dependency Latency Injection",
      objective: "Measure resilience when downstream dependencies slow down.",
      targets: edges
        .slice(0, 3)
        .map((edge) => `${edge.source} -> ${edge.target}`),
      loadProfile: {
        baselineRps: BASELINE_RPS,
        peakRps: BASELINE_RPS * 4,
        rampSeconds: 90,
        holdSeconds: 480,
      },
      passCriteria: [
        "Timeout and fallback policies activate correctly",
        "P99 latency bounded under predefined SLO threshold",
        "No unbounded queue growth in downstream services",
      ],
    });
  }

  if (queueTargets.length > 0) {
    scenarios.push({
      id: "queue-backlog",
      type: "queue-backlog",
      name: "Queue Backlog Saturation",
      objective:
        "Verify worker autoscaling and dead-letter handling under backlog pressure.",
      targets: queueTargets,
      loadProfile: {
        baselineRps: BASELINE_RPS,
        peakRps: BASELINE_RPS * 6,
        rampSeconds: 180,
        holdSeconds: 720,
      },
      passCriteria: [
        "Backlog does not grow unbounded after peak",
        "DLQ rate remains below 1%",
        "Consumer lag recovers to baseline in under 10 minutes",
      ],
    });
  }

  if (dataTargets.length > 0) {
    scenarios.push({
      id: "data-store-hotspot",
      type: "data-store-hotspot",
      name: "Data Store Hotspot",
      objective:
        "Validate behavior during uneven key/query distribution and cache misses.",
      targets: dataTargets,
      loadProfile: {
        baselineRps: BASELINE_RPS,
        peakRps: BASELINE_RPS * 5,
        rampSeconds: 120,
        holdSeconds: 540,
      },
      passCriteria: [
        "Read/write latency remains within agreed SLO band",
        "Cache hit ratio recovers above 80% after warm-up",
        "No data integrity or consistency violations",
      ],
    });
  }

  return scenarios;
}

function toMarkdown(
  scenarios: StressScenario[],
  assumptions: string[],
): string {
  const lines: string[] = [];

  lines.push("# Stress Testing Plan");
  lines.push("");
  lines.push("## Assumptions");
  lines.push("");
  for (const assumption of assumptions) {
    lines.push(`- ${assumption}`);
  }

  lines.push("");
  lines.push("## Scenarios");
  lines.push("");

  for (const scenario of scenarios) {
    lines.push(`### ${scenario.name}`);
    lines.push("");
    lines.push(`- **Type**: ${scenario.type}`);
    lines.push(`- **Objective**: ${scenario.objective}`);
    lines.push(
      `- **Targets**: ${scenario.targets.length > 0 ? scenario.targets.join(", ") : "N/A"}`,
    );
    lines.push(
      `- **Load Profile**: ${scenario.loadProfile.baselineRps} -> ${scenario.loadProfile.peakRps} RPS, ramp ${scenario.loadProfile.rampSeconds}s, hold ${scenario.loadProfile.holdSeconds}s`,
    );
    lines.push("- **Pass Criteria**:");
    for (const criterion of scenario.passCriteria) {
      lines.push(`  - ${criterion}`);
    }
    lines.push("");
  }

  lines.push("## Execution Notes");
  lines.push("");
  lines.push("- Run each scenario independently before combined chaos runs.");
  lines.push(
    "- Capture baseline metrics for latency, error rate, and throughput.",
  );
  lines.push("- Export findings with timestamps and remediation actions.");

  return lines.join("\n");
}

export function buildStressTestPlan(
  nodes: Node[],
  edges: Edge[],
): StressTestPlan {
  const assumptions = [
    "Synthetic traffic reflects production-like request mix.",
    "Monitoring captures P50/P95/P99 latency, throughput, and error-rate.",
    "Rollback or kill-switch exists for each destructive scenario.",
  ];

  const scenarios = buildScenarios(nodes, edges);

  return {
    assumptions,
    scenarios,
    markdown: toMarkdown(scenarios, assumptions),
  };
}
