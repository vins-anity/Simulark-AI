import type { Edge, Node } from "@xyflow/react";

interface TerraformResource {
  type: string;
  name: string;
  config: Record<string, unknown>;
}

interface TerraformModule {
  nodes: Node[];
  edges: Edge[];
  provider: string;
}

interface NodeData {
  label?: string;
  serviceType?: string;
  tech?: string;
  description?: string;
}

function getNodeData(node: Node): NodeData {
  return (node.data || {}) as NodeData;
}

/**
 * Generate Terraform configuration from architecture nodes and edges
 */
export function generateTerraform(
  nodes: Node[],
  _edges: Edge[],
  provider: "aws" | "gcp" | "azure" = "aws",
): string {
  const resources: TerraformResource[] = [];
  const variables: string[] = [];
  const outputs: string[] = [];

  // Map node types to Terraform resources
  nodes.forEach((node, index) => {
    const data = getNodeData(node);
    const nodeType = data.serviceType || node.type;
    const nodeLabel = (data.label || `resource-${index}`)
      .toLowerCase()
      .replace(/[^a-z0-9]/g, "_")
      .replace(/_+/g, "_");

    switch (nodeType) {
      case "database":
        resources.push(
          generateDatabaseResource(nodeLabel, data.tech, provider),
        );
        break;
      case "frontend":
        resources.push(generateFrontendResource(nodeLabel, provider));
        break;
      case "backend":
      case "service":
        resources.push(generateComputeResource(nodeLabel, data.tech, provider));
        break;
      case "gateway":
        resources.push(generateGatewayResource(nodeLabel, provider));
        break;
      case "queue":
        resources.push(generateQueueResource(nodeLabel, data.tech, provider));
        break;
      case "ai":
        resources.push(generateAIResource(nodeLabel, provider));
        break;
      case "cache":
        resources.push(generateCacheResource(nodeLabel, provider));
        break;
      case "storage":
        resources.push(generateStorageResource(nodeLabel, provider));
        break;
    }
  });

  // Generate Terraform HCL
  const terraformHCL = `terraform {
  required_version = ">= 1.0"
  required_providers {
    ${getProviderConfig(provider)}
  }
}

provider "${provider}" {
  region = var.region
}

${variables.join("\n")}

${resources.map((r) => formatResource(r)).join("\n\n")}

${outputs.join("\n")}
`;

  return terraformHCL;
}

function getProviderConfig(provider: string): string {
  switch (provider) {
    case "aws":
      return `aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }`;
    case "gcp":
      return `google = {
      source  = "hashicorp/google"
      version = "~> 5.0"
    }`;
    case "azure":
      return `azurerm = {
      source  = "hashicorp/azurerm"
      version = "~> 3.0"
    }`;
    default:
      return `aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }`;
  }
}

function generateDatabaseResource(
  name: string,
  tech: string | undefined,
  provider: string,
): TerraformResource {
  const isPostgres = tech?.toLowerCase().includes("postgres");
  const isRedis = tech?.toLowerCase().includes("redis");

  if (provider === "aws") {
    if (isRedis) {
      return {
        type: "aws_elasticache_cluster",
        name: name,
        config: {
          cluster_id: name,
          engine: "redis",
          node_type: "cache.t3.micro",
          num_cache_nodes: 1,
          parameter_group_name: "default.redis7",
          port: 6379,
        },
      };
    }
    return {
      type: "aws_db_instance",
      name: name,
      config: {
        identifier: name,
        allocated_storage: 20,
        engine: isPostgres ? "postgres" : "mysql",
        engine_version: isPostgres ? "15.0" : "8.0",
        instance_class: "db.t3.micro",
        db_name: name.replace(/-/g, "_"),
        username: "admin",
        password: "var.db_password",
        skip_final_snapshot: true,
      },
    };
  }

  // Default AWS config
  return {
    type: "aws_db_instance",
    name: name,
    config: {
      identifier: name,
      allocated_storage: 20,
      engine: "postgres",
      engine_version: "15.0",
      instance_class: "db.t3.micro",
      db_name: name.replace(/-/g, "_"),
      username: "admin",
      password: "var.db_password",
      skip_final_snapshot: true,
    },
  };
}

function generateComputeResource(
  name: string,
  tech: string | undefined,
  provider: string,
): TerraformResource {
  if (provider === "aws") {
    // Check if it's a container service
    if (
      tech?.toLowerCase().includes("docker") ||
      tech?.toLowerCase().includes("container")
    ) {
      return {
        type: "aws_ecs_service",
        name: name,
        config: {
          name: name,
          cluster: "aws_ecs_cluster.main.id",
          task_definition: `aws_ecs_task_definition.${name}.arn`,
          desired_count: 2,
          launch_type: "FARGATE",
        },
      };
    }

    // Default to EC2/Lambda based on tech
    if (
      tech?.toLowerCase().includes("lambda") ||
      tech?.toLowerCase().includes("serverless")
    ) {
      return {
        type: "aws_lambda_function",
        name: name,
        config: {
          function_name: name,
          runtime: "nodejs18.x",
          handler: "index.handler",
          filename: "lambda.zip",
          source_code_hash: 'filebase64sha256("lambda.zip")',
          role: "aws_iam_role.lambda_role.arn",
        },
      };
    }

    return {
      type: "aws_instance",
      name: name,
      config: {
        ami: "data.aws_ami.amazon_linux_2.id",
        instance_type: "t3.micro",
        tags: {
          Name: name,
        },
      },
    };
  }

  return {
    type: "aws_instance",
    name: name,
    config: {
      ami: "ami-12345678",
      instance_type: "t3.micro",
      tags: {
        Name: name,
      },
    },
  };
}

function generateFrontendResource(
  name: string,
  provider: string,
): TerraformResource {
  if (provider === "aws") {
    return {
      type: "aws_s3_bucket",
      name: name,
      config: {
        bucket: `${name}-frontend`,
        tags: {
          Name: name,
        },
      },
    };
  }

  return {
    type: "aws_s3_bucket",
    name: name,
    config: {
      bucket: `${name}-frontend`,
    },
  };
}

function generateGatewayResource(
  name: string,
  provider: string,
): TerraformResource {
  if (provider === "aws") {
    return {
      type: "aws_api_gateway_rest_api",
      name: name,
      config: {
        name: name,
        description: "API Gateway for ${name}",
      },
    };
  }

  return {
    type: "aws_api_gateway_rest_api",
    name: name,
    config: {
      name: name,
    },
  };
}

function generateQueueResource(
  name: string,
  tech: string | undefined,
  provider: string,
): TerraformResource {
  const isKafka = tech?.toLowerCase().includes("kafka");

  if (provider === "aws") {
    if (isKafka) {
      return {
        type: "aws_msk_cluster",
        name: name,
        config: {
          cluster_name: name,
          kafka_version: "3.5.1",
          number_of_broker_nodes: 3,
          broker_node_group_info: {
            instance_type: "kafka.t3.small",
            client_subnets: ["subnet-123", "subnet-456", "subnet-789"],
            security_groups: ["sg-123"],
          },
        },
      };
    }

    return {
      type: "aws_sqs_queue",
      name: name,
      config: {
        name: name,
        delay_seconds: 0,
        max_message_size: 262144,
        message_retention_seconds: 345600,
        receive_wait_time_seconds: 0,
      },
    };
  }

  return {
    type: "aws_sqs_queue",
    name: name,
    config: {
      name: name,
    },
  };
}

function generateAIResource(name: string, provider: string): TerraformResource {
  if (provider === "aws") {
    return {
      type: "aws_sagemaker_model",
      name: name,
      config: {
        name: name,
        primary_container: {
          image:
            "763104351884.dkr.ecr.us-east-1.amazonaws.com/pytorch-inference:2.0.0-cpu-py310",
        },
        execution_role_arn: "aws_iam_role.sagemaker_role.arn",
      },
    };
  }

  return {
    type: "aws_sagemaker_model",
    name: name,
    config: {
      name: name,
    },
  };
}

function generateCacheResource(
  name: string,
  provider: string,
): TerraformResource {
  return generateDatabaseResource(name, "redis", provider);
}

function generateStorageResource(
  name: string,
  provider: string,
): TerraformResource {
  if (provider === "aws") {
    return {
      type: "aws_s3_bucket",
      name: name,
      config: {
        bucket: `${name}-storage`,
        tags: {
          Name: name,
        },
      },
    };
  }

  return {
    type: "aws_s3_bucket",
    name: name,
    config: {
      bucket: `${name}-storage`,
    },
  };
}

function formatResource(resource: TerraformResource): string {
  const configEntries = Object.entries(resource.config);
  const formattedConfig = configEntries
    .map(([key, value]) => {
      if (typeof value === "string" && value.startsWith("var.")) {
        return `  ${key} = ${value}`;
      }
      if (typeof value === "string") {
        return `  ${key} = "${value}"`;
      }
      if (typeof value === "number" || typeof value === "boolean") {
        return `  ${key} = ${value}`;
      }
      if (Array.isArray(value)) {
        return `  ${key} = [${value.map((v) => `"${v}"`).join(", ")}]`;
      }
      if (typeof value === "object" && value !== null) {
        const inner = Object.entries(value)
          .map(([k, v]) => `    ${k} = "${v}"`)
          .join("\n");
        return `  ${key} {\n${inner}\n  }`;
      }
      return `  ${key} = ${value}`;
    })
    .join("\n");

  return `resource "${resource.type}" "${resource.name}" {\n${formattedConfig}\n}`;
}

/**
 * Generate README with deployment instructions
 */
export function generateReadme(projectName: string, provider: string): string {
  return `# ${projectName} - Infrastructure

Generated Terraform configuration for ${provider.toUpperCase()} deployment.

## Prerequisites

- Terraform >= 1.0
- ${provider.toUpperCase()} CLI configured

## Quick Start

1. Initialize Terraform:
   \`\`\`bash
   terraform init
   \`\`\`

2. Review the plan:
   \`\`\`bash
   terraform plan
   \`\`\`

3. Apply the infrastructure:
   \`\`\`bash
   terraform apply
   \`\`\`

## Architecture

This Terraform configuration deploys the following resources:
- VPC and networking components
- Compute resources (EC2, Lambda, or ECS)
- Database instances
- API Gateway
- Message queues
- Storage buckets
- AI/ML services (if applicable)

## Variables

Create a \`terraform.tfvars\` file with:

\`\`\`hcl
region = "us-east-1"
db_password = "your-secure-password"
\`\`\`

## Cleanup

To destroy all resources:
\`\`\`bash
terraform destroy
\`\`\`

---
Generated by Simulark Architecture Engine
`;
}

/**
 * Create a deployment package with Terraform and README
 */
export function createDeploymentPackage(
  projectName: string,
  nodes: Node[],
  edges: Edge[],
  provider: "aws" | "gcp" | "azure" = "aws",
): {
  mainTf: string;
  readme: string;
  variablesTf: string;
} {
  const mainTf = generateTerraform(nodes, edges, provider);
  const readme = generateReadme(projectName, provider);
  const variablesTf = `variable "region" {
  description = "The region to deploy resources"
  type        = string
  default     = "us-east-1"
}

variable "db_password" {
  description = "Database password"
  type        = string
  sensitive   = true
}

variable "environment" {
  description = "Environment name"
  type        = string
  default     = "production"
}`;

  return { mainTf, readme, variablesTf };
}
