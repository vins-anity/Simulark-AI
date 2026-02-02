"use client";

import { Zap } from "lucide-react";
import { BaseNode, type BaseNodeProps } from "./BaseNode";

export function CacheNode(props: BaseNodeProps) {
    return (
        <BaseNode
            {...props}
            label={(props.data?.label as string) || "Cache"}
            icon={<Zap size={16} />}
            className="border-l-4 border-l-[#f1c40f]" // Yellow accent for Cache
        >
            <div className="text-xs text-[#b0aea5] mt-1">In-memory store</div>
        </BaseNode>
    );
}
