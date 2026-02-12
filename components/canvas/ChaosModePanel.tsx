"use client";

import { AnimatePresence, motion } from "framer-motion";
import {
  Activity,
  AlertTriangle,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Clock,
  Network,
  RotateCcw,
  Server,
  TrendingDown,
  X,
  Zap,
} from "lucide-react";
import { useState } from "react";
import {
  type FailureEvent,
  type FailureType,
  useSimulationStore,
} from "@/lib/store";
import { cn } from "@/lib/utils";

const failureIcons: Record<FailureType, React.ElementType> = {
  node_failure: Server,
  network_partition: Network,
  high_latency: Clock,
  packet_loss: TrendingDown,
  cascade_failure: Zap,
  resource_exhaustion: Activity,
};

const severityColors: Record<"low" | "medium" | "high" | "critical", string> = {
  low: "text-brand-green",
  medium: "text-brand-orange",
  high: "text-red-500",
  critical: "text-red-600",
};

const severityBgColors: Record<"low" | "medium" | "high" | "critical", string> =
  {
    low: "bg-brand-green/10",
    medium: "bg-brand-orange/10",
    high: "bg-red-500/10",
    critical: "bg-red-600/10",
  };

function MetricCard({
  label,
  value,
  unit,
  status,
}: {
  label: string;
  value: string | number;
  unit?: string;
  status?: "good" | "warning" | "critical";
}) {
  const statusColors: Record<"good" | "warning" | "critical", string> = {
    good: "text-brand-green",
    warning: "text-brand-orange",
    critical: "text-red-500",
  };

  return (
    <div className="bg-bg-secondary border border-border-primary p-3">
      <p className="text-[10px] font-mono uppercase tracking-wider text-text-muted mb-1">
        {label}
      </p>
      <div className="flex items-baseline gap-1">
        <span
          className={cn(
            "text-2xl font-poppins font-bold",
            status && statusColors[status],
          )}
        >
          {value}
        </span>
        {unit && <span className="text-xs text-text-muted">{unit}</span>}
      </div>
    </div>
  );
}

function FailureEventItem({ event }: { event: FailureEvent }) {
  const Icon = failureIcons[event.type];
  const severityColor = severityColors[event.severity];
  const severityBg = severityBgColors[event.severity];
  const time = new Date(event.timestamp).toLocaleTimeString();

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      className={cn(
        "flex items-start gap-3 p-3 border-l-2 text-sm",
        event.resolved
          ? "border-brand-green bg-brand-green/5 opacity-60"
          : cn(severityBg),
        !event.resolved &&
          severityColor.includes("orange") &&
          "border-brand-orange",
        !event.resolved &&
          severityColor.includes("green") &&
          "border-brand-green",
        !event.resolved &&
          severityColor.includes("red-500") &&
          "border-red-500",
        !event.resolved &&
          severityColor.includes("red-600") &&
          "border-red-600",
      )}
    >
      <div className={cn("mt-0.5", severityColor)}>
        <Icon className="w-4 h-4" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span
            className={cn(
              "font-mono text-[10px] uppercase tracking-wider",
              severityColor,
            )}
          >
            {event.severity}
          </span>
          <span className="text-[10px] text-text-muted">{time}</span>
          {event.resolved && (
            <span className="flex items-center gap-1 text-[10px] text-brand-green">
              <CheckCircle2 className="w-3 h-3" /> Resolved
            </span>
          )}
        </div>
        <p className="text-text-secondary mt-1">{event.description}</p>
      </div>
    </motion.div>
  );
}

export function ChaosModePanel() {
  const { chaosMode, setChaosMode, metrics, failureEvents, resetSimulation } =
    useSimulationStore();

  const [isExpanded, setIsExpanded] = useState(true);
  const [showResolved, setShowResolved] = useState(false);

  const activeEvents = failureEvents.filter((e) => !e.resolved);
  const displayedEvents = showResolved ? failureEvents : activeEvents;

  const getAvailabilityStatus = (): "good" | "warning" | "critical" => {
    if (metrics.availability >= 95) return "good";
    if (metrics.availability >= 80) return "warning";
    return "critical";
  };

  const getLatencyStatus = (): "good" | "warning" | "critical" => {
    if (metrics.latency < 100) return "good";
    if (metrics.latency < 300) return "warning";
    return "critical";
  };

  const getErrorRateStatus = (): "good" | "warning" | "critical" => {
    if (metrics.errorRate < 1) return "good";
    if (metrics.errorRate < 5) return "warning";
    return "critical";
  };

  if (!chaosMode) return null;

  return (
    <div className="fixed right-4 left-4 md:left-auto top-20 z-50 md:w-80 bg-bg-primary border border-red-500/30 shadow-2xl">
      {/* Header */}
      <div className="bg-red-950/90 text-red-100 p-3 border-b border-red-500/30">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-red-500 animate-pulse" />
            <div>
              <h3 className="font-mono text-xs uppercase tracking-widest font-bold">
                Chaos Engineering
              </h3>
              <p className="text-[10px] text-red-300">
                Failure Simulation Active
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-1 hover:bg-red-900/50 transition-colors"
            >
              {isExpanded ? (
                <ChevronDown className="w-4 h-4" />
              ) : (
                <ChevronUp className="w-4 h-4" />
              )}
            </button>
            <button
              type="button"
              onClick={resetSimulation}
              className="p-1 hover:bg-red-900/50 transition-colors"
              title="Reset Simulation"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => setChaosMode(false)}
              className="p-1 hover:bg-red-900/50 transition-colors"
              title="Close"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            {/* Metrics Grid */}
            <div className="grid grid-cols-3 gap-2 p-3 border-b border-border-primary">
              <MetricCard
                label="Availability"
                value={`${metrics.availability}%`}
                status={getAvailabilityStatus()}
              />
              <MetricCard
                label="Latency"
                value={metrics.latency}
                unit="ms"
                status={getLatencyStatus()}
              />
              <MetricCard
                label="Error Rate"
                value={`${metrics.errorRate.toFixed(1)}%`}
                status={getErrorRateStatus()}
              />
            </div>

            {/* Instructions */}
            <div className="p-3 bg-bg-secondary border-b border-border-primary">
              <p className="text-xs text-text-secondary">
                <span className="text-brand-orange font-mono">[CLICK]</span>{" "}
                nodes to inject failures
              </p>
            </div>

            {/* Events Log */}
            <div className="max-h-64 overflow-y-auto">
              <div className="flex items-center justify-between p-2 bg-bg-tertiary border-b border-border-secondary">
                <span className="text-[10px] font-mono uppercase tracking-wider text-text-muted">
                  Failure Log ({activeEvents.length} active)
                </span>
                <button
                  type="button"
                  onClick={() => setShowResolved(!showResolved)}
                  className="text-[10px] text-text-muted hover:text-text-primary transition-colors"
                >
                  {showResolved ? "Hide Resolved" : "Show All"}
                </button>
              </div>

              {displayedEvents.length === 0 ? (
                <div className="p-4 text-center text-text-muted text-sm">
                  No active failures. Click nodes to simulate incidents.
                </div>
              ) : (
                <AnimatePresence>
                  {displayedEvents.map((event) => (
                    <FailureEventItem key={event.id} event={event} />
                  ))}
                </AnimatePresence>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
