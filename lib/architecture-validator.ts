/**
 * Architecture Validator for Simulark
 * Catches common tech stack mistakes and architecture anti-patterns
 */

import { createLogger } from "@/lib/logger";

const logger = createLogger("architecture-validator");

// Validation mode constraints
const MODE_CONSTRAINTS = {
  startup: { min: 3, max: 5 },
  default: { min: 4, max: 8 },
  corporate: { min: 6, max: 15 },
};

// Full-stack frameworks that include backend capabilities
const FULLSTACK_FRAMEWORKS = new Set([
  "nextjs",
  "nuxt",
  "sveltekit",
  "remix",
  "blazor",
  "adonisjs",
  "rails",
  "django",
  "laravel",
  "phoenix",
  "spring",
]);

// Standalone backend frameworks that shouldn't be paired with full-stack
const BACKEND_FRAMEWORKS = new Set([
  "express",
  "fastify",
  "nestjs",
  "fastapi",
  "flask",
  "gin",
  "fiber",
  "hono",
  "elysia",
  "actix",
  "axum",
]);

// Authentication services
const AUTH_SERVICES = new Set([
  "clerk",
  "auth0",
  "firebase-auth",
  "supabase-auth",
  "nextauth",
  "authjs",
  "aws-cognito",
  "azure-ad",
  "keycloak",
  "okta",
  "onelogin",
  "workos",
  "fusionauth",
  "authelia",
  "authentik",
  "logto",
  "supertokens",
  "zitadel",
  "casdoor",
  "ory",
]);

// Node types that are considered databases
const DATABASE_TYPES = new Set([
  "database",
  "vector-db",
  "cache",
  "bucket",
  "queue",
]);

// Node types that are considered services
const SERVICE_TYPES = new Set([
  "service",
  "backend",
  "function",
  "ai",
  "ai-model",
]);

// Gateway types for load balancing
const GATEWAY_TYPES = new Set(["gateway", "loadbalancer"]);

// Gateway technologies
const GATEWAY_TECHS = new Set(["nginx", "kong", "traefik", "envoy", "istio"]);

// Monitoring technologies
const MONITORING_TECHS = new Set([
  "prometheus",
  "grafana",
  "datadog",
  "newrelic",
  "sentry",
  "dynatrace",
  "honeycomb",
  "splunk",
  "jaeger",
  "zipkin",
]);

// Architecture validation issue
export interface ValidationIssue {
  id: string;
  type: "error" | "warning" | "suggestion";
  message: string;
  affectedNodes: string[]; // node IDs
  suggestion: string;
  autoFixable: boolean;
}

// Architecture validation rule
export interface ValidationRule {
  id: string;
  name: string;
  check: (nodes: any[], edges: any[]) => ValidationIssue[];
  autoFix?: (nodes: any[], edges: any[]) => { nodes: any[]; edges: any[] };
}

// Helper to get tech ID from a node
function getNodeTech(node: any): string | undefined {
  return node.data?.tech?.toLowerCase();
}

// Helper to get node type
function getNodeType(node: any): string | undefined {
  return node.type?.toLowerCase() || node.data?.serviceType?.toLowerCase();
}

// Helper to check if node is a full-stack framework
function isFullstackFramework(node: any): boolean {
  const tech = getNodeTech(node);
  return tech ? FULLSTACK_FRAMEWORKS.has(tech) : false;
}

// Helper to check if node is a backend framework
function isBackendFramework(node: any): boolean {
  const tech = getNodeTech(node);
  return tech ? BACKEND_FRAMEWORKS.has(tech) : false;
}

// Helper to check if node is an auth service
function isAuthService(node: any): boolean {
  const tech = getNodeTech(node);
  const type = getNodeType(node);
  return tech ? AUTH_SERVICES.has(tech) || type === "auth" : type === "auth";
}

// Helper to check if node is a database
function isDatabase(node: any): boolean {
  const type = getNodeType(node);
  return type ? DATABASE_TYPES.has(type) : false;
}

// Helper to check if node is a service
function isService(node: any): boolean {
  const type = getNodeType(node);
  return type ? SERVICE_TYPES.has(type) : false;
}

// Helper to check if node is a gateway
function isGateway(node: any): boolean {
  const type = getNodeType(node);
  const tech = getNodeTech(node);
  return (
    (!!type && GATEWAY_TYPES.has(type)) || (!!tech && GATEWAY_TECHS.has(tech))
  );
}

// Helper to check if node is monitoring
function isMonitoring(node: any): boolean {
  const type = getNodeType(node);
  const tech = getNodeTech(node);
  return type === "monitoring" || (!!tech && MONITORING_TECHS.has(tech));
}

// Helper to get connected nodes
function getConnectedNodes(
  nodeId: string,
  edges: any[],
): {
  sources: string[];
  targets: string[];
} {
  const sources: string[] = [];
  const targets: string[] = [];

  for (const edge of edges) {
    if (edge.target === nodeId) {
      sources.push(edge.source);
    }
    if (edge.source === nodeId) {
      targets.push(edge.target);
    }
  }

  return { sources, targets };
}

/**
 * Rule 1: No Full-Stack + Backend Framework Mix
 * Detects: Next.js/Nuxt/SvelteKit paired with Express/Fastify/NestJS
 */
const noFullstackBackendMixRule: ValidationRule = {
  id: "no-fullstack-backend-mix",
  name: "No Full-Stack + Backend Framework Mix",
  check(nodes, edges) {
    const issues: ValidationIssue[] = [];
    const fullstackNodes = nodes.filter(isFullstackFramework);
    const backendNodes = nodes.filter(isBackendFramework);

    if (fullstackNodes.length === 0 || backendNodes.length === 0) {
      return issues;
    }

    for (const fullstack of fullstackNodes) {
      for (const backend of backendNodes) {
        const fullstackLabel = fullstack.data?.label || fullstack.data?.tech;
        const backendLabel = backend.data?.label || backend.data?.tech;

        issues.push({
          id: `issue-${fullstack.id}-${backend.id}-redundancy`,
          type: "warning",
          message: `${fullstackLabel} already includes API routes, ${backendLabel} is redundant`,
          affectedNodes: [fullstack.id, backend.id],
          suggestion: `Remove ${backendLabel} and use ${fullstackLabel}'s built-in API routes instead`,
          autoFixable: true,
        });
      }
    }

    return issues;
  },
  autoFix(nodes, edges) {
    // Remove backend framework nodes and reroute edges through fullstack node
    const fullstackNodes = nodes.filter(isFullstackFramework);
    if (fullstackNodes.length === 0) return { nodes, edges };

    const fullstack = fullstackNodes[0]; // Use first fullstack node as replacement
    const backendNodeIds = new Set(
      nodes.filter(isBackendFramework).map((n) => n.id),
    );

    // Filter out backend nodes
    const newNodes = nodes.filter((n) => !backendNodeIds.has(n.id));

    // Reroute edges: replace backend node with fullstack node
    const newEdges = edges
      .filter(
        (e) => !backendNodeIds.has(e.source) && !backendNodeIds.has(e.target),
      )
      .map((edge) => {
        const newEdge = { ...edge };
        if (backendNodeIds.has(edge.source)) {
          newEdge.source = fullstack.id;
        }
        if (backendNodeIds.has(edge.target)) {
          newEdge.target = fullstack.id;
        }
        return newEdge;
      });

    logger.info("Auto-fixed fullstack+backend redundancy", {
      removedNodes: Array.from(backendNodeIds),
      keptNode: fullstack.id,
    });

    return { nodes: newNodes, edges: newEdges };
  },
};

/**
 * Rule 2: No Duplicate Auth Services
 * Detects: Multiple auth nodes (Clerk + Supabase Auth + Firebase Auth)
 */
const noDuplicateAuthRule: ValidationRule = {
  id: "no-duplicate-auth",
  name: "No Duplicate Authentication Services",
  check(nodes, _edges) {
    const issues: ValidationIssue[] = [];
    const authNodes = nodes.filter(isAuthService);

    if (authNodes.length <= 1) {
      return issues;
    }

    const authLabels = authNodes
      .map((n) => n.data?.label || n.data?.tech)
      .join(", ");

    issues.push({
      id: "issue-duplicate-auth",
      type: "warning",
      message: `Multiple authentication services detected: ${authLabels}`,
      affectedNodes: authNodes.map((n) => n.id),
      suggestion: "Consolidate to a single auth provider to avoid conflicts",
      autoFixable: false,
    });

    return issues;
  },
};

/**
 * Rule 3: Component Count Validity
 * Checks against mode constraints (startup: 3-5, default: 4-8, corporate: 6-15)
 */
function createComponentCountRule(
  mode: "startup" | "default" | "corporate",
): ValidationRule {
  const constraints = MODE_CONSTRAINTS[mode];

  return {
    id: `component-count-${mode}`,
    name: "Component Count Validity",
    check(nodes, _edges) {
      const issues: ValidationIssue[] = [];
      const count = nodes.length;

      if (count < constraints.min) {
        issues.push({
          id: "issue-too-few-components",
          type: "suggestion",
          message: `Architecture has ${count} components, but ${mode} mode expects at least ${constraints.min}`,
          affectedNodes: nodes.map((n) => n.id),
          suggestion: `Add more components to meet ${mode} mode requirements`,
          autoFixable: false,
        });
      } else if (count > constraints.max) {
        issues.push({
          id: "issue-too-many-components",
          type: mode === "startup" ? "warning" : "suggestion",
          message: `Architecture has ${count} components, but ${mode} mode recommends no more than ${constraints.max}`,
          affectedNodes: nodes.map((n) => n.id),
          suggestion: `Consider simplifying the architecture`,
          autoFixable: false,
        });
      }

      return issues;
    },
  };
}

/**
 * Rule 4: Isolated Nodes
 * Detects nodes with no connections (orphaned)
 */
const isolatedNodesRule: ValidationRule = {
  id: "isolated-nodes",
  name: "Isolated Nodes Detection",
  check(nodes, edges) {
    const issues: ValidationIssue[] = [];
    const connectedNodeIds = new Set<string>();

    for (const edge of edges) {
      connectedNodeIds.add(edge.source);
      connectedNodeIds.add(edge.target);
    }

    const isolatedNodes = nodes.filter((n) => !connectedNodeIds.has(n.id));

    for (const node of isolatedNodes) {
      const label = node.data?.label || node.data?.tech || node.id;
      issues.push({
        id: `issue-isolated-${node.id}`,
        type: "warning",
        message: `"${label}" has no connections`,
        affectedNodes: [node.id],
        suggestion: "Connect this component to other services or remove it",
        autoFixable: false,
      });
    }

    return issues;
  },
};

/**
 * Rule 5: Missing Required Components by Mode
 * Corporate mode must have: monitoring, load balancer/gateway if multiple services
 */
function createRequiredComponentsRule(
  mode: "startup" | "default" | "corporate",
): ValidationRule {
  return {
    id: `required-components-${mode}`,
    name: "Required Components Check",
    check(nodes, _edges) {
      const issues: ValidationIssue[] = [];

      if (mode !== "corporate") {
        return issues;
      }

      const serviceCount = nodes.filter(isService).length;

      // Check for monitoring
      const hasMonitoring = nodes.some(isMonitoring);
      if (!hasMonitoring) {
        issues.push({
          id: "issue-missing-monitoring",
          type: "warning",
          message: "Corporate architecture should include monitoring",
          affectedNodes: nodes.map((n) => n.id),
          suggestion:
            "Add a monitoring solution like Prometheus, Grafana, or Datadog",
          autoFixable: false,
        });
      }

      // Check for gateway/load balancer if multiple services
      if (serviceCount > 2) {
        const hasGateway = nodes.some(isGateway);
        if (!hasGateway) {
          issues.push({
            id: "issue-missing-gateway",
            type: "suggestion",
            message: `Multiple services (${serviceCount}) detected without a gateway or load balancer`,
            affectedNodes: nodes.filter(isService).map((n) => n.id),
            suggestion:
              "Add an API gateway (Kong, Nginx) or load balancer for better traffic management",
            autoFixable: false,
          });
        }
      }

      return issues;
    },
  };
}

/**
 * Rule 6: Database Without Connection
 * Ensures databases have incoming connections from services
 */
const databaseConnectionRule: ValidationRule = {
  id: "database-connection",
  name: "Database Connection Check",
  check(nodes, edges) {
    const issues: ValidationIssue[] = [];
    const databaseNodes = nodes.filter(isDatabase);

    for (const db of databaseNodes) {
      const { sources } = getConnectedNodes(db.id, edges);

      if (sources.length === 0) {
        const label = db.data?.label || db.data?.tech || db.id;
        issues.push({
          id: `issue-db-no-connections-${db.id}`,
          type: "error",
          message: `Database "${label}" has no incoming connections from services`,
          affectedNodes: [db.id],
          suggestion: "Connect at least one service to this database",
          autoFixable: false,
        });
      } else {
        // Check if any source is a service
        const hasServiceSource = sources.some((sourceId) => {
          const sourceNode = nodes.find((n) => n.id === sourceId);
          return sourceNode && isService(sourceNode);
        });

        if (!hasServiceSource) {
          const label = db.data?.label || db.data?.tech || db.id;
          issues.push({
            id: `issue-db-no-service-source-${db.id}`,
            type: "warning",
            message: `Database "${label}" is not connected to any service`,
            affectedNodes: [db.id, ...sources],
            suggestion:
              "Connect the database to a backend service, not directly to frontends",
            autoFixable: false,
          });
        }
      }
    }

    return issues;
  },
};

/**
 * Rule 7: Frontend Without Connection
 * Ensures frontends have outgoing connections
 */
const frontendConnectionRule: ValidationRule = {
  id: "frontend-connection",
  name: "Frontend Connection Check",
  check(nodes, edges) {
    const issues: ValidationIssue[] = [];
    const frontendNodes = nodes.filter(
      (n) => getNodeType(n) === "frontend" || getNodeType(n) === "client",
    );

    for (const frontend of frontendNodes) {
      const { targets } = getConnectedNodes(frontend.id, edges);

      if (targets.length === 0) {
        const label =
          frontend.data?.label || frontend.data?.tech || frontend.id;
        issues.push({
          id: `issue-frontend-no-connections-${frontend.id}`,
          type: "warning",
          message: `Frontend "${label}" has no outgoing connections`,
          affectedNodes: [frontend.id],
          suggestion:
            "Connect the frontend to at least one backend service or API",
          autoFixable: false,
        });
      }
    }

    return issues;
  },
};

/**
 * Rule 8: Circular Dependency Detection
 * Warns about potential circular dependencies
 */
const circularDependencyRule: ValidationRule = {
  id: "circular-dependency",
  name: "Circular Dependency Detection",
  check(nodes, edges) {
    const issues: ValidationIssue[] = [];

    // Build adjacency list
    const adj = new Map<string, string[]>();
    for (const node of nodes) {
      adj.set(node.id, []);
    }
    for (const edge of edges) {
      const neighbors = adj.get(edge.source) || [];
      neighbors.push(edge.target);
      adj.set(edge.source, neighbors);
    }

    // DFS to find cycles
    const visited = new Set<string>();
    const recStack = new Set<string>();
    const cycleNodes: string[] = [];

    function dfs(nodeId: string, path: string[] = []): boolean {
      visited.add(nodeId);
      recStack.add(nodeId);
      path.push(nodeId);

      const neighbors = adj.get(nodeId) || [];
      for (const neighbor of neighbors) {
        if (!visited.has(neighbor)) {
          if (dfs(neighbor, path)) return true;
        } else if (recStack.has(neighbor)) {
          // Found cycle
          const cycleStart = path.indexOf(neighbor);
          cycleNodes.push(...path.slice(cycleStart));
          return true;
        }
      }

      path.pop();
      recStack.delete(nodeId);
      return false;
    }

    for (const node of nodes) {
      if (!visited.has(node.id)) {
        dfs(node.id);
      }
    }

    if (cycleNodes.length > 0) {
      const uniqueCycleNodes = [...new Set(cycleNodes)];
      const nodeLabels = uniqueCycleNodes
        .map((id) => {
          const node = nodes.find((n) => n.id === id);
          return node?.data?.label || node?.data?.tech || id;
        })
        .join(" → ");

      issues.push({
        id: "issue-circular-dependency",
        type: "warning",
        message: `Circular dependency detected: ${nodeLabels}`,
        affectedNodes: uniqueCycleNodes,
        suggestion: "Review the architecture to break the circular dependency",
        autoFixable: false,
      });
    }

    return issues;
  },
};

/**
 * Rule 9: Security Without Auth
 * Warns if payment or sensitive services exist without authentication
 */
const securityWithoutAuthRule: ValidationRule = {
  id: "security-without-auth",
  name: "Security Without Authentication",
  check(nodes, edges) {
    const issues: ValidationIssue[] = [];
    const authNodes = nodes.filter(isAuthService);

    if (authNodes.length > 0) {
      return issues; // Has auth, no issue
    }

    // Check for payment services
    const paymentNodes = nodes.filter(
      (n) =>
        getNodeType(n) === "payment" ||
        ["stripe", "paypal", "adyen", "square", "braintree"].includes(
          getNodeTech(n) || "",
        ),
    );

    if (paymentNodes.length > 0) {
      const labels = paymentNodes
        .map((n) => n.data?.label || n.data?.tech)
        .join(", ");

      issues.push({
        id: "issue-payment-without-auth",
        type: "warning",
        message: `Payment services (${labels}) detected without authentication`,
        affectedNodes: paymentNodes.map((n) => n.id),
        suggestion: "Add an authentication service to secure payment endpoints",
        autoFixable: false,
      });
    }

    // Check for user-facing backends without auth
    const backendNodes = nodes.filter((n) => getNodeType(n) === "backend");
    const frontendNodes = nodes.filter(
      (n) => getNodeType(n) === "frontend" || getNodeType(n) === "client",
    );

    if (backendNodes.length > 0 && frontendNodes.length > 0) {
      issues.push({
        id: "issue-backend-without-auth",
        type: "suggestion",
        message: "Architecture has frontend and backend but no authentication",
        affectedNodes: [...backendNodes, ...frontendNodes].map((n) => n.id),
        suggestion: "Consider adding authentication for user security",
        autoFixable: false,
      });
    }

    return issues;
  },
};

// Default validation rules
export const DEFAULT_VALIDATION_RULES: ValidationRule[] = [
  noFullstackBackendMixRule,
  noDuplicateAuthRule,
  isolatedNodesRule,
  databaseConnectionRule,
  frontendConnectionRule,
  circularDependencyRule,
  securityWithoutAuthRule,
];

// Get validation rules for a specific mode
function getValidationRules(
  mode: "startup" | "default" | "corporate",
): ValidationRule[] {
  return [
    ...DEFAULT_VALIDATION_RULES,
    createComponentCountRule(mode),
    createRequiredComponentsRule(mode),
  ];
}

// Main validation result type
export interface ValidationResult {
  valid: boolean;
  issues: ValidationIssue[];
  fixed?: { nodes: any[]; edges: any[] };
  appliedFixes: string[];
}

/**
 * Main validation function
 * Runs all validation rules against the architecture
 */
export function validateArchitecture(
  nodes: any[],
  edges: any[],
  mode: "startup" | "default" | "corporate" = "default",
  options: {
    autoFix?: boolean;
    rules?: ValidationRule[];
  } = {},
): ValidationResult {
  const { autoFix = false, rules = getValidationRules(mode) } = options;

  logger.debug("Starting architecture validation", {
    nodeCount: nodes.length,
    edgeCount: edges.length,
    mode,
    autoFix,
  });

  const allIssues: ValidationIssue[] = [];
  let currentNodes = [...nodes];
  let currentEdges = [...edges];
  const appliedFixes: string[] = [];

  // Run all validation rules
  for (const rule of rules) {
    try {
      const issues = rule.check(currentNodes, currentEdges);
      allIssues.push(...issues);

      // Apply auto-fix if enabled and available
      if (autoFix && rule.autoFix && issues.some((i) => i.autoFixable)) {
        const fixed = rule.autoFix(currentNodes, currentEdges);
        currentNodes = fixed.nodes;
        currentEdges = fixed.edges;
        appliedFixes.push(rule.id);

        logger.info("Applied auto-fix", {
          rule: rule.id,
          nodeCount: currentNodes.length,
          edgeCount: currentEdges.length,
        });
      }
    } catch (error) {
      logger.error(`Validation rule ${rule.id} failed`, error);
    }
  }

  // Determine if valid (no errors)
  const hasErrors = allIssues.some((i) => i.type === "error");
  const result: ValidationResult = {
    valid: !hasErrors,
    issues: allIssues,
    appliedFixes,
  };

  // Include fixed architecture if auto-fix was applied
  if (autoFix && appliedFixes.length > 0) {
    result.fixed = {
      nodes: currentNodes,
      edges: currentEdges,
    };
  }

  logger.debug("Validation complete", {
    valid: result.valid,
    issueCount: allIssues.length,
    errorCount: allIssues.filter((i) => i.type === "error").length,
    warningCount: allIssues.filter((i) => i.type === "warning").length,
    appliedFixes,
  });

  return result;
}

/**
 * Quick validation check - returns only boolean result
 */
export function isValidArchitecture(
  nodes: any[],
  edges: any[],
  mode: "startup" | "default" | "corporate" = "default",
): boolean {
  const result = validateArchitecture(nodes, edges, mode);
  return result.valid;
}

/**
 * Get validation summary for UI display
 */
export function getValidationSummary(issues: ValidationIssue[]): {
  total: number;
  errors: number;
  warnings: number;
  suggestions: number;
} {
  return {
    total: issues.length,
    errors: issues.filter((i) => i.type === "error").length,
    warnings: issues.filter((i) => i.type === "warning").length,
    suggestions: issues.filter((i) => i.type === "suggestion").length,
  };
}

/**
 * Filter issues by type
 */
export function filterIssuesByType(
  issues: ValidationIssue[],
  type: "error" | "warning" | "suggestion",
): ValidationIssue[] {
  return issues.filter((i) => i.type === type);
}

/**
 * Filter issues by node ID
 */
export function getIssuesForNode(
  issues: ValidationIssue[],
  nodeId: string,
): ValidationIssue[] {
  return issues.filter((i) => i.affectedNodes.includes(nodeId));
}
