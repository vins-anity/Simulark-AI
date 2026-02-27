"use client";

import type { Node } from "@xyflow/react";
import { useReactFlow } from "@xyflow/react";
import { AnimatePresence, motion } from "framer-motion";
import {
  AlertTriangle,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  CircleHelp,
  Loader2,
  Pause,
  Play,
  ShieldAlert,
  Square,
  X,
  XCircle,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { getDefaultValuesForType } from "@/lib/node-schemas";
import type { StressPlannerMetaInput } from "@/lib/schema/api";
import { useSimulationStore } from "@/lib/store";
import { STRESS_PLANNER_MODEL_OPTIONS } from "@/lib/stress-planner-models";
import {
  runStressSimulation,
  type StressRunStreamEvent,
} from "@/lib/stress-runner";
import { buildStressTestPlan } from "@/lib/stress-testing-plan";
import { cn } from "@/lib/utils";

const PROFILE_DEFAULTS: Record<string, Record<string, unknown>> = {
  gateway: { replicas: 2, cpu: "1 vCPU", memory: "512 MB", timeout_ms: 250 },
  auth: { replicas: 2, token_ttl_seconds: 3600, cpu: "0.5 vCPU" },
  payment: { replicas: 2, timeout_ms: 1200, retry_budget: 3 },
  monitoring: { scrape_interval_seconds: 15, retention_days: 30 },
  security: { waf: true, rate_limit_rps: 300, audit_log_days: 90 },
  cache: { engine: "redis", memory: "1 GB", eviction: "allkeys-lru" },
  messaging: {
    visibility_timeout: 30,
    retention_seconds: 345600,
    fifo: false,
  },
  cicd: { pipeline_timeout_minutes: 45, concurrent_jobs: 4 },
  service: { replicas: 2, cpu: "0.5 vCPU", memory: "512 MB" },
};

function getNodeType(node: Node): string {
  const serviceType = node.data?.serviceType;
  if (typeof serviceType === "string" && serviceType.length > 0) {
    return serviceType;
  }
  return node.type || "service";
}

function getNodeLabel(node: Node): string {
  const label = node.data?.label;
  if (typeof label === "string" && label.trim().length > 0) {
    return label.trim();
  }
  return node.id;
}

function resolveSpecDefaults(node: Node): Record<string, unknown> {
  const nodeType = getNodeType(node);
  const typedDefaults = getDefaultValuesForType(nodeType);
  if (typedDefaults && Object.keys(typedDefaults).length > 0) {
    return typedDefaults;
  }

  const tech = typeof node.data?.tech === "string" ? node.data.tech : "";
  if (tech.toLowerCase().includes("redis")) {
    return PROFILE_DEFAULTS.cache;
  }

  return PROFILE_DEFAULTS[nodeType] || PROFILE_DEFAULTS.service;
}

function convertInputValue(raw: string, template: unknown): unknown {
  if (typeof template === "number") {
    const parsed = Number(raw);
    return Number.isFinite(parsed) ? parsed : template;
  }

  if (typeof template === "boolean") {
    return raw === "true";
  }

  return raw;
}

export function getPlannerRequestConfig(
  plannerMode: "auto" | "manual",
  plannerModelId: string,
): { mode: "auto" | "manual"; modelId?: string } {
  if (plannerMode === "manual") {
    return {
      mode: "manual",
      modelId: plannerModelId === "auto" ? "qwen:qwen-flash" : plannerModelId,
    };
  }
  return { mode: "auto" };
}

export function getPlannerStatusMessage(
  meta?: StressPlannerMetaInput,
): string | null {
  if (!meta) return null;

  const toName = (modelId: string) =>
    STRESS_PLANNER_MODEL_OPTIONS.find((item) => item.id === modelId)?.label ||
    modelId;

  const failed = meta.attempts.filter((attempt) => !attempt.ok);
  if (meta.providerUsed === "fallback") {
    if (failed.length === 0) {
      return "Deterministic planner used.";
    }
    return `AI planner unavailable (${failed.length} failed attempt${failed.length === 1 ? "" : "s"}). Deterministic planner used.`;
  }

  if (failed.length > 0 && meta.modelUsed) {
    const firstFailed = failed[0];
    return `${toName(firstFailed.modelId)} failed, switched to ${toName(meta.modelUsed)}.`;
  }

  return meta.modelUsed ? `Planned with ${toName(meta.modelUsed)}.` : null;
}

function createStableSeed(
  nodes: Node[],
  edges: { id: string }[],
  scenarioId: string,
): number {
  const source = `${scenarioId}:${nodes.length}:${edges.length}:${nodes
    .map((node) => node.id)
    .sort()
    .join("|")}:${edges
    .map((edge) => edge.id)
    .sort()
    .join("|")}`;

  let hash = 2166136261;
  for (let index = 0; index < source.length; index++) {
    hash ^= source.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }

  return Math.abs(hash >>> 0);
}

export function StressTestPanel() {
  const { getNodes, getEdges } = useReactFlow();
  const [isExpanded, setIsExpanded] = useState(true);
  const [showHowTo, setShowHowTo] = useState(true);
  const [seedInput, setSeedInput] = useState<string>("42");
  const [statusNote, setStatusNote] = useState<string>("");
  const abortRef = useRef<AbortController | null>(null);

  const {
    stressMode,
    setStressMode,
    scenarioPlan,
    selectedScenarioId,
    runStatus,
    runProgress,
    runTimeline,
    runMetrics,
    runVerdict,
    plannerMode,
    plannerModelId,
    nodeSpecOverrides,
    setScenarioPlan,
    setPlannerMode,
    setPlannerModelId,
    selectScenario,
    setNodeSpecOverride,
    setStressPlanning,
    startStressRun,
    pauseStressRun,
    abortStressRun,
    resetStressRun,
    processStressEvent,
    addStressTimelineMessage,
  } = useSimulationStore();

  useEffect(() => {
    return () => {
      if (abortRef.current) {
        abortRef.current.abort();
      }
    };
  }, []);

  const selectedScenario = useMemo(() => {
    if (!scenarioPlan || !selectedScenarioId) return null;
    return (
      scenarioPlan.scenarios.find((item) => item.id === selectedScenarioId) ||
      null
    );
  }, [scenarioPlan, selectedScenarioId]);

  const targetedNodes = useMemo(() => {
    if (!selectedScenario) return [];
    const nodes = getNodes();
    const targets = selectedScenario.targets.map((target) =>
      target.toLowerCase().trim(),
    );

    return nodes.filter((node) => {
      const label = getNodeLabel(node).toLowerCase();
      const id = node.id.toLowerCase();
      return targets.some(
        (target) =>
          label === target ||
          id === target ||
          label.includes(target) ||
          target.includes(label),
      );
    });
  }, [getNodes, selectedScenario]);

  const latestMetric =
    runMetrics.length > 0 ? runMetrics[runMetrics.length - 1] : null;

  const plannerStatus = useMemo(
    () => getPlannerStatusMessage(scenarioPlan?.plannerMeta),
    [scenarioPlan?.plannerMeta],
  );

  const runNarrative = useMemo(() => {
    if (!selectedScenario || !runVerdict || !latestMetric) return null;
    const resultTone = runVerdict.status === "pass" ? "stable" : "at risk";
    return `Simulated estimate: "${selectedScenario.name}" is ${resultTone}. Score ${runVerdict.score}/100, latency ${latestMetric.latency}ms, availability ${latestMetric.availability}%.`;
  }, [latestMetric, runVerdict, selectedScenario]);

  if (!stressMode) return null;

  const isRunning = runStatus === "running";
  const isPlanning = runStatus === "planning";

  const handleClose = () => {
    if (abortRef.current) {
      abortRef.current.abort();
      abortRef.current = null;
    }
    setStressMode(false);
  };

  const handleGeneratePlan = async () => {
    const nodes = getNodes();
    const edges = getEdges();

    if (nodes.length === 0) {
      const message =
        "Plan generation blocked: add at least one node on the canvas.";
      setStatusNote(message);
      addStressTimelineMessage(message, "medium");
      return;
    }

    setStressPlanning();
    setStatusNote("Generating scenario plan...");

    const applyDeterministicPlan = (reason?: string) => {
      const deterministicPlan = buildStressTestPlan(nodes, edges);
      const warning = reason
        ? `AI planner unavailable (${reason}). Deterministic planner applied.`
        : "AI planner unavailable. Deterministic planner applied.";

      setScenarioPlan({
        assumptions: deterministicPlan.assumptions,
        scenarios: deterministicPlan.scenarios,
        markdown: deterministicPlan.markdown,
        source: "fallback",
        warning,
        plannerMeta: {
          providerUsed: "fallback",
          attempts: [],
          warningCode: "ai_unavailable",
          warning,
        },
      });

      setStatusNote("Scenario plan ready (deterministic fallback).");
      addStressTimelineMessage(
        "Planner API unavailable. Used deterministic fallback plan.",
        "medium",
      );
    };

    try {
      const response = await fetch("/api/stress-tests/plan", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          nodes,
          edges,
          plannerConfig: getPlannerRequestConfig(plannerMode, plannerModelId),
        }),
      });

      if (!response.ok) {
        const errorData = await response
          .json()
          .catch(() => ({ error: "Failed to generate stress plan" }));

        if (response.status === 401 || response.status === 403) {
          const message = errorData.error || "Stress planning is unavailable";
          setStatusNote(message);
          processStressEvent({
            type: "error",
            data: { message },
          });
          return;
        }

        applyDeterministicPlan(errorData.error || "planner API error");
        return;
      }

      const payload = await response.json();
      const data = payload?.data;
      setScenarioPlan({
        assumptions: data.assumptions || [],
        scenarios: data.scenarios || [],
        markdown: data.markdown || "",
        source: data.source,
        warning: data.warning,
        plannerMeta: data.plannerMeta,
      });

      if (data?.warning) {
        addStressTimelineMessage(`Planner warning: ${data.warning}`, "medium");
      }

      const source = data?.source || "deterministic";
      const provider = data?.plannerMeta?.providerUsed;
      const modelUsed = data?.plannerMeta?.modelUsed;
      const plannerText =
        provider === "fallback"
          ? "deterministic"
          : modelUsed || provider || source;
      setStatusNote(`Scenario plan ready (${plannerText}).`);
      addStressTimelineMessage(
        `Scenario plan generated using ${source} planner.`,
        "low",
      );
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Failed to generate stress scenarios";
      applyDeterministicPlan(message);
    }
  };

  const handleStart = async () => {
    const scenario = selectedScenario;
    if (!scenario) {
      const message = "Select a scenario before starting a run.";
      setStatusNote(message);
      addStressTimelineMessage(message, "medium");
      return;
    }

    const nodes = getNodes();
    const edges = getEdges();
    if (nodes.length === 0) {
      const message = "Run blocked: canvas is empty.";
      setStatusNote(message);
      addStressTimelineMessage(message, "high");
      return;
    }

    if (abortRef.current) {
      abortRef.current.abort();
      abortRef.current = null;
    }

    startStressRun();
    setStatusNote(`Running "${scenario.name}"...`);
    const abortController = new AbortController();
    abortRef.current = abortController;
    const parsedSeed = Number(seedInput);
    const runSeed = Number.isFinite(parsedSeed)
      ? parsedSeed
      : createStableSeed(nodes, edges, scenario.id);

    const runLocally = async (reason: string) => {
      addStressTimelineMessage(
        `Realtime stream unavailable (${reason}). Running local deterministic simulation.`,
        "medium",
      );

      try {
        for await (const event of runStressSimulation(
          {
            nodes,
            edges,
            scenario,
            seed: runSeed,
            nodeSpecOverrides,
          },
          { delayMs: 60 },
        )) {
          if (abortController.signal.aborted) {
            return;
          }
          processStressEvent(event);
        }

        setStatusNote("Run completed (local deterministic fallback).");
      } catch (error) {
        const message =
          error instanceof Error
            ? error.message
            : "Local deterministic run failed";
        setStatusNote(message);
        processStressEvent({
          type: "error",
          data: { message },
        });
      }
    };

    try {
      const response = await fetch("/api/stress-tests/run", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          nodes,
          edges,
          scenario,
          seed: runSeed,
          nodeSpecOverrides,
        }),
        signal: abortController.signal,
      });

      if (!response.ok || !response.body) {
        const errorData = await response
          .json()
          .catch(() => ({ error: "Stress run failed to start" }));

        if (response.status === 401 || response.status === 403) {
          const message =
            errorData.error || "Stress run is unavailable for this account";
          setStatusNote(message);
          processStressEvent({
            type: "error",
            data: { message },
          });
          return;
        }

        await runLocally(errorData.error || "stress run API unavailable");
        return;
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() || "";

        for (const line of lines) {
          if (!line.trim()) continue;
          try {
            const event = JSON.parse(line) as StressRunStreamEvent;
            processStressEvent(event);
          } catch {
            addStressTimelineMessage(
              "Stream parse warning: skipped event.",
              "low",
            );
          }
        }
      }

      if (buffer.trim()) {
        try {
          const event = JSON.parse(buffer) as StressRunStreamEvent;
          processStressEvent(event);
        } catch {
          addStressTimelineMessage(
            "Stream parse warning: final event skipped.",
            "low",
          );
        }
      }
      setStatusNote("Run completed.");
    } catch (error) {
      if (abortController.signal.aborted) {
        return;
      }
      await runLocally(
        error instanceof Error ? error.message : "Stress run failed",
      );
    } finally {
      abortRef.current = null;
    }
  };

  const handlePause = () => {
    if (abortRef.current) {
      abortRef.current.abort();
      abortRef.current = null;
    }
    pauseStressRun();
    setStatusNote("Run paused. Press [ START ] to replay deterministically.");
  };

  const handleAbort = () => {
    if (abortRef.current) {
      abortRef.current.abort();
      abortRef.current = null;
    }
    abortStressRun();
    setStatusNote("Run aborted.");
  };

  const handleReset = () => {
    if (abortRef.current) {
      abortRef.current.abort();
      abortRef.current = null;
    }
    resetStressRun();
    setStatusNote("Run state reset.");
  };

  return (
    <div className="fixed left-4 right-4 md:right-auto top-20 z-50 md:w-[460px] max-h-[calc(100vh-6rem)] border-2 border-brand-charcoal bg-[#faf9f5] shadow-[6px_6px_0px_0px_rgba(26,26,26,1)] overflow-hidden">
      <div className="h-2 bg-brand-charcoal" />

      <div className="border-b-2 border-brand-charcoal bg-brand-charcoal text-[#faf9f5] px-3 py-2">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-brand-orange" />
            <div>
              <h3 className="font-mono text-[11px] tracking-wider uppercase font-bold">
                Module: Stress Test
              </h3>
              <p className="font-mono text-[10px] text-white/60 uppercase tracking-wider">
                Simulated estimates only
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <button
              type="button"
              title={showHowTo ? "Hide quick guide" : "Show quick guide"}
              className="h-7 w-7 border border-white/20 flex items-center justify-center hover:bg-white/10"
              onClick={() => setShowHowTo((current) => !current)}
            >
              <CircleHelp className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              title={isExpanded ? "Collapse panel" : "Expand panel"}
              className="h-7 w-7 border border-white/20 flex items-center justify-center hover:bg-white/10"
              onClick={() => setIsExpanded((current) => !current)}
            >
              {isExpanded ? (
                <ChevronUp className="w-3.5 h-3.5" />
              ) : (
                <ChevronDown className="w-3.5 h-3.5" />
              )}
            </button>
            <button
              type="button"
              onClick={handleClose}
              className="h-7 w-7 border border-white/20 flex items-center justify-center hover:bg-white/10"
              title="Close"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {showHowTo && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="border-b border-brand-charcoal/20 bg-brand-charcoal/5 px-3 py-2"
          >
            <p className="font-mono text-[10px] uppercase tracking-wider text-brand-charcoal/70 mb-1">
              What This Feature Does
            </p>
            <div className="space-y-1.5 text-xs text-brand-charcoal/85">
              <p>
                Stress Test simulates failure/load scenarios on your diagram to
                estimate resilience risk before you deploy.
              </p>
              <p>
                Planning: AI proposes scenarios first. If AI is unavailable, it
                falls back to deterministic built-in planning.
              </p>
              <p>
                Auto model chain: GLM-5 -&gt; Kimi -&gt; MiniMax -&gt; Zhipu
                -&gt; deterministic fallback.
              </p>
              <p>
                Run engine: deterministic simulation computes timeline, metrics,
                bottlenecks, and pass/fail verdict.
              </p>
              <p>
                <span className="font-semibold">Seed</span>: controls simulation
                randomness. Same graph + scenario + seed = same output.
              </p>
              <p>
                Metrics are{" "}
                <span className="font-semibold">simulated estimates</span>,
                useful for architecture comparison, not production-true latency.
              </p>
              <p>
                Score guide: 0-39 critical risk, 40-69 weak resilience, 70+
                resilient baseline.
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-y-auto max-h-[calc(100vh-11rem)]"
          >
            <div className="border-b border-brand-charcoal/20 px-3 py-3 space-y-3">
              <div className="flex items-center justify-between">
                <p className="font-mono text-[10px] uppercase tracking-wider text-brand-charcoal/60">
                  Step 1: Plan
                </p>
                <span className="font-mono text-[10px] uppercase tracking-wider text-brand-charcoal/50">
                  status: {runStatus}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  size="sm"
                  title="Generate stress scenarios for current diagram"
                  onClick={handleGeneratePlan}
                  disabled={isPlanning}
                  className="h-8 rounded-none border border-brand-charcoal bg-brand-charcoal text-white hover:bg-brand-charcoal/90 text-[10px] font-mono uppercase tracking-wider"
                >
                  {isPlanning && (
                    <Loader2 className="w-3.5 h-3.5 animate-spin mr-1" />
                  )}
                  [ Generate Plan ]
                </Button>

                <label className="flex items-center gap-1 text-[10px] font-mono uppercase tracking-wider text-brand-charcoal/70">
                  Seed
                  <input
                    type="number"
                    value={seedInput}
                    onChange={(event) => setSeedInput(event.target.value)}
                    className="h-8 w-24 px-2 border border-brand-charcoal/30 bg-white text-xs font-mono"
                    placeholder="42"
                    title="Same seed + same graph = same deterministic result"
                  />
                </label>

                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={handleReset}
                  className="h-8 rounded-none ml-auto text-[10px] font-mono uppercase tracking-wider"
                >
                  [ Reset ]
                </Button>
              </div>

              <div className="flex flex-col gap-2 border border-brand-charcoal/20 bg-white p-2">
                <p className="font-mono text-[10px] uppercase tracking-wider text-brand-charcoal/60">
                  Planner Model
                </p>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setPlannerMode("auto")}
                    className={cn(
                      "h-7 px-2 text-[10px] font-mono uppercase tracking-wider border",
                      plannerMode === "auto"
                        ? "bg-brand-charcoal text-white border-brand-charcoal"
                        : "bg-white text-brand-charcoal border-brand-charcoal/30",
                    )}
                    title="Auto failover chain: GLM-5 -> Kimi -> MiniMax -> Zhipu"
                  >
                    Auto
                  </button>
                  <button
                    type="button"
                    onClick={() => setPlannerMode("manual")}
                    className={cn(
                      "h-7 px-2 text-[10px] font-mono uppercase tracking-wider border",
                      plannerMode === "manual"
                        ? "bg-brand-charcoal text-white border-brand-charcoal"
                        : "bg-white text-brand-charcoal border-brand-charcoal/30",
                    )}
                    title="Manual single-model planning with deterministic fallback"
                  >
                    Manual
                  </button>
                  <select
                    value={plannerMode === "auto" ? "auto" : plannerModelId}
                    onChange={(event) => {
                      const value = event.target.value;
                      if (value === "auto") {
                        setPlannerMode("auto");
                        setPlannerModelId("auto");
                        return;
                      }
                      setPlannerMode("manual");
                      setPlannerModelId(value);
                    }}
                    className="h-7 min-w-56 border border-brand-charcoal/30 bg-white px-2 text-[10px] font-mono uppercase tracking-wider"
                    title="Planner model selection"
                  >
                    <option value="auto">Auto (Chain)</option>
                    {STRESS_PLANNER_MODEL_OPTIONS.map((model) => (
                      <option key={model.id} value={model.id}>
                        {model.label}
                      </option>
                    ))}
                  </select>
                </div>
                <p className="text-[11px] text-brand-charcoal/60">
                  Auto tries backup models in order. Manual tries one model, and
                  still falls back to deterministic planning if needed.
                </p>
              </div>
              <p className="text-[11px] text-brand-charcoal/70">
                Seed locks randomness. Keep it fixed to compare architecture
                changes fairly.
              </p>

              <div>
                <div className="h-2 w-full border border-brand-charcoal/30 bg-white">
                  <div
                    className="h-full bg-brand-orange transition-all duration-300"
                    style={{
                      width: `${Math.min(100, Math.max(0, runProgress))}%`,
                    }}
                  />
                </div>
                <p className="mt-1 font-mono text-[10px] uppercase tracking-wider text-brand-charcoal/60">
                  {Math.round(runProgress)}% complete
                </p>
              </div>
            </div>

            {plannerStatus && (
              <div className="border-b border-brand-charcoal/20 px-3 py-2 bg-brand-charcoal/5">
                <p className="text-xs text-brand-charcoal">
                  <span className="font-mono text-[10px] uppercase tracking-wider text-brand-charcoal/60">
                    Planner Status
                  </span>
                  <br />
                  {plannerStatus}
                </p>
              </div>
            )}

            <div className="border-b border-brand-charcoal/20 px-3 py-3">
              <p className="font-mono text-[10px] uppercase tracking-wider text-brand-charcoal/60 mb-2">
                Step 2: Choose Scenario
              </p>
              <div className="space-y-2 max-h-44 overflow-y-auto">
                {(scenarioPlan?.scenarios || []).map((scenario) => (
                  <button
                    key={scenario.id}
                    type="button"
                    title={scenario.objective}
                    onClick={() => selectScenario(scenario.id)}
                    className={cn(
                      "w-full text-left border px-2 py-2 bg-white hover:border-brand-orange transition-colors",
                      selectedScenarioId === scenario.id
                        ? "border-brand-orange"
                        : "border-brand-charcoal/20",
                    )}
                  >
                    <p className="font-mono text-[11px] uppercase tracking-wider text-brand-charcoal">
                      {scenario.name}
                    </p>
                    <p className="text-[11px] text-brand-charcoal/70 mt-0.5">
                      {scenario.objective}
                    </p>
                    <p className="font-mono text-[10px] uppercase text-brand-charcoal/50 mt-1">
                      {scenario.type}
                    </p>
                  </button>
                ))}
                {(!scenarioPlan || scenarioPlan.scenarios.length === 0) && (
                  <p className="text-xs text-brand-charcoal/60 bg-white border border-brand-charcoal/20 px-2 py-2">
                    No scenarios yet. Click [ Generate Plan ] first.
                  </p>
                )}
              </div>
            </div>

            {targetedNodes.length > 0 && (
              <div className="border-b border-brand-charcoal/20 px-3 py-3">
                <p className="font-mono text-[10px] uppercase tracking-wider text-brand-charcoal/60 mb-2">
                  Step 3: Optional Spec Overrides
                </p>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {targetedNodes.map((node) => {
                    const defaults = resolveSpecDefaults(node);
                    const override = nodeSpecOverrides[node.id] || {};
                    const fields = Object.keys(defaults);

                    return (
                      <details
                        key={node.id}
                        className="border border-brand-charcoal/20 bg-white px-2 py-1"
                      >
                        <summary className="cursor-pointer font-mono text-[11px] uppercase tracking-wider text-brand-charcoal">
                          {getNodeLabel(node)}
                        </summary>
                        <div className="space-y-2 pt-2">
                          {fields.map((field) => {
                            const defaultValue = defaults[field];
                            const currentValue =
                              override[field] !== undefined
                                ? override[field]
                                : defaultValue;

                            if (typeof defaultValue === "boolean") {
                              return (
                                <label
                                  key={field}
                                  className="flex items-center justify-between text-xs"
                                >
                                  <span className="font-mono text-[10px] uppercase tracking-wider">
                                    {field}
                                  </span>
                                  <input
                                    type="checkbox"
                                    checked={Boolean(currentValue)}
                                    onChange={(event) =>
                                      setNodeSpecOverride(node.id, {
                                        [field]: event.target.checked,
                                      })
                                    }
                                  />
                                </label>
                              );
                            }

                            return (
                              <label
                                key={field}
                                className="flex flex-col gap-1 text-xs"
                              >
                                <span className="font-mono text-[10px] uppercase tracking-wider text-brand-charcoal/60">
                                  {field}
                                </span>
                                <input
                                  type={
                                    typeof defaultValue === "number"
                                      ? "number"
                                      : "text"
                                  }
                                  value={String(currentValue)}
                                  onChange={(event) =>
                                    setNodeSpecOverride(node.id, {
                                      [field]: convertInputValue(
                                        event.target.value,
                                        defaultValue,
                                      ),
                                    })
                                  }
                                  className="h-8 px-2 border border-brand-charcoal/20 bg-[#faf9f5]"
                                />
                              </label>
                            );
                          })}
                        </div>
                      </details>
                    );
                  })}
                </div>
              </div>
            )}

            <div className="border-b border-brand-charcoal/20 px-3 py-3">
              <p className="font-mono text-[10px] uppercase tracking-wider text-brand-charcoal/60 mb-2">
                Step 4: Run Controls
              </p>
              <div className="flex gap-2">
                <Button
                  type="button"
                  size="sm"
                  title="Start stress simulation stream"
                  onClick={handleStart}
                  disabled={isRunning || !selectedScenario}
                  className="h-8 rounded-none border border-brand-charcoal bg-brand-charcoal text-white hover:bg-brand-charcoal/90 text-[10px] font-mono uppercase tracking-wider"
                >
                  <Play className="w-3.5 h-3.5 mr-1" />[ Start ]
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  title="Pause current run stream"
                  onClick={handlePause}
                  disabled={!isRunning}
                  className="h-8 rounded-none text-[10px] font-mono uppercase tracking-wider"
                >
                  <Pause className="w-3.5 h-3.5 mr-1" />[ Pause ]
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant="destructive"
                  title="Abort current run"
                  onClick={handleAbort}
                  disabled={!isRunning}
                  className="h-8 rounded-none text-[10px] font-mono uppercase tracking-wider"
                >
                  <Square className="w-3.5 h-3.5 mr-1" />[ Abort ]
                </Button>
              </div>
              <p className="mt-2 text-xs text-brand-charcoal/70">
                {statusNote ||
                  "Generate plan, select scenario, then press [ Start ]."}
              </p>
            </div>

            <div className="grid grid-cols-3 gap-2 px-3 py-3 border-b border-brand-charcoal/20">
              <div className="border border-brand-charcoal/20 bg-white p-2">
                <p className="font-mono text-[10px] uppercase tracking-wider text-brand-charcoal/50">
                  Availability
                </p>
                <p className="text-sm font-semibold text-brand-charcoal">
                  {latestMetric ? `${latestMetric.availability}%` : "--"}
                </p>
              </div>
              <div className="border border-brand-charcoal/20 bg-white p-2">
                <p className="font-mono text-[10px] uppercase tracking-wider text-brand-charcoal/50">
                  Latency
                </p>
                <p className="text-sm font-semibold text-brand-charcoal">
                  {latestMetric ? `${latestMetric.latency}ms` : "--"}
                </p>
              </div>
              <div className="border border-brand-charcoal/20 bg-white p-2">
                <p className="font-mono text-[10px] uppercase tracking-wider text-brand-charcoal/50">
                  Error Rate
                </p>
                <p className="text-sm font-semibold text-brand-charcoal">
                  {latestMetric ? `${latestMetric.errorRate}%` : "--"}
                </p>
              </div>
            </div>

            {runVerdict && (
              <div className="px-3 py-3 border-b border-brand-charcoal/20">
                <div className="flex items-center gap-2 text-sm font-semibold text-brand-charcoal">
                  {runVerdict.status === "pass" ? (
                    <CheckCircle2 className="w-4 h-4 text-green-600" />
                  ) : (
                    <XCircle className="w-4 h-4 text-red-600" />
                  )}
                  Verdict: {runVerdict.status.toUpperCase()} ({runVerdict.score}
                  /100)
                </div>
                <p className="text-xs text-brand-charcoal/80 mt-2">
                  {runVerdict.summary}
                </p>
                {runVerdict.violatedCriteria.length > 0 && (
                  <div className="mt-2 text-xs">
                    <p className="font-mono text-[10px] uppercase tracking-wider text-brand-charcoal/60 mb-1">
                      Violated Criteria
                    </p>
                    {runVerdict.violatedCriteria.map((item) => (
                      <p key={item} className="text-brand-charcoal/80">
                        - {item}
                      </p>
                    ))}
                  </div>
                )}
                {runNarrative && (
                  <div className="mt-2 border border-brand-orange/40 bg-brand-orange/10 p-2 text-xs text-brand-charcoal">
                    <p className="font-mono text-[10px] uppercase tracking-wider mb-1">
                      Dynamic Explanation
                    </p>
                    {runNarrative}
                  </div>
                )}
              </div>
            )}

            <div className="px-3 py-3 border-b border-brand-charcoal/20 bg-brand-charcoal/5">
              <p className="font-mono text-[10px] uppercase tracking-wider text-brand-charcoal/60 mb-1">
                How To Read Results
              </p>
              <p className="text-xs text-brand-charcoal/80">
                0-39 = critical risk, 40-69 = weak resilience, 70+ = resilient
                baseline. Use score trends across architecture variants with the
                same seed for fair comparison.
              </p>
            </div>

            <div className="max-h-52 overflow-y-auto">
              <div className="px-3 py-2 bg-brand-charcoal/5 border-b border-brand-charcoal/20 font-mono text-[10px] uppercase tracking-wider text-brand-charcoal/60">
                Timeline
              </div>
              {runTimeline.length === 0 ? (
                <div className="p-3 text-xs text-brand-charcoal/60">
                  No events yet.
                </div>
              ) : (
                <div className="p-2 space-y-2">
                  {runTimeline
                    .slice(-20)
                    .reverse()
                    .map((item) => (
                      <div
                        key={item.id}
                        className={cn(
                          "border p-2 text-xs bg-white",
                          item.severity === "critical" ||
                            item.severity === "high"
                            ? "border-red-500/40"
                            : item.severity === "medium"
                              ? "border-brand-orange/40"
                              : "border-brand-charcoal/20",
                        )}
                      >
                        <div className="flex items-center gap-1 text-[10px] font-mono uppercase tracking-wider text-brand-charcoal/50 mb-1">
                          {item.type === "incident" ? (
                            <AlertTriangle className="w-3 h-3" />
                          ) : (
                            <ShieldAlert className="w-3 h-3" />
                          )}
                          {new Date(item.timestamp).toLocaleTimeString()}
                        </div>
                        <p>{item.message}</p>
                      </div>
                    ))}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
