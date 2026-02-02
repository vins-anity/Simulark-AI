"use client";

import { Scale } from "lucide-react";
import { BaseNode, type BaseNodeProps } from "./BaseNode";

export function LoadbalancerNode(props: BaseNodeProps) {
    return (
        <BaseNode
            {...props}
            label={(props.data?.label as string) || "Load Balancer"}
            icon={<Scale size={16} />}
            className="border-l-4 border-l-[#9b59b6]" // Purple accent for Load Balancer
        >
            <div className="text-xs text-[#b0aea5] mt-1">Traffic distribution</div>
        </BaseNode>
    );
}
