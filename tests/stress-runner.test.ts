import type { Edge, Node } from "@xyflow/react";
import * as v from "valibot";
import { describe, expect, it } from "vitest";
import { StressTestRunEventSchema } from "../lib/schema/api";
import { runStressSimulation } from "../lib/stress-runner";
import type { StressScenario } from "../lib/stress-testing-plan";

const nodes: Node[] = [
  {
    id: "gateway-1",
    type: "gateway",
    position: { x: 0, y: 0 },
    data: { label: "Gateway", serviceType: "gateway" },
  },
  {
    id: "service-1",
    type: "service",
    position: { x: 200, y: 0 },
    data: { label: "API", serviceType: "service" },
  },
  {
    id: "database-1",
    type: "database",
    position: { x: 400, y: 0 },
    data: { label: "Postgres", serviceType: "database" },
  },
];

const edges: Edge[] = [
  { id: "edge-1", source: "gateway-1", target: "service-1" },
  { id: "edge-2", source: "service-1", target: "database-1" },
];

const scenario: StressScenario = {
  id: "traffic-spike",
  type: "traffic-spike",
  name: "Traffic Spike",
  objective: "Validate resilience under peak traffic",
  targets: ["Gateway", "API"],
  loadProfile: {
    baselineRps: 120,
    peakRps: 600,
    rampSeconds: 120,
    holdSeconds: 300,
  },
  passCriteria: ["Latency remains within acceptable threshold"],
};

async function collectRun(seed: number) {
  const events = [];
  for await (const event of runStressSimulation(
    { nodes, edges, scenario, seed },
    { delayMs: 0 },
  )) {
    events.push(event);
  }
  return events;
}

describe("stress-runner", () => {
  it("is deterministic with same graph, scenario, and seed", async () => {
    const first = await collectRun(42);
    const second = await collectRun(42);
    expect(first).toEqual(second);
  });

  it("changes output when seed changes", async () => {
    const first = await collectRun(42);
    const second = await collectRun(7);
    expect(first).not.toEqual(second);
  });

  it("emits events that conform to API streaming schema", async () => {
    const events = await collectRun(42);
    for (const event of events) {
      const parsed = v.safeParse(StressTestRunEventSchema, event);
      expect(parsed.success).toBe(true);
    }
  });
});
