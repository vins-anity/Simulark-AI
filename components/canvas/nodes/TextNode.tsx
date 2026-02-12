"use client";

import { Handle, type NodeProps, Position, useReactFlow } from "@xyflow/react";
import { useState, useEffect, useRef } from "react";
import { cn } from "@/lib/utils";
import { NodeToolbar } from "@xyflow/react";
import { Type } from "lucide-react";

interface TextNodeData {
  label?: string;
  fontSize?: number;
  fontWeight?: "normal" | "bold";
  color?: string;
  textAlign?: "left" | "center" | "right";
}

export function TextNode({ id, selected, data }: NodeProps) {
  const { setNodes } = useReactFlow();
  const [isPropertiesOpen, setIsPropertiesOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const text = (data?.label as string) || "Double-click to edit";
  const fontSize = (data?.fontSize as number) || 14;
  const fontWeight = (data?.fontWeight as "normal" | "bold") || "normal";
  const color = (data?.color as string) || "#1a1a1a";
  const textAlign = (data?.textAlign as "left" | "center" | "right") || "left";

  useEffect(() => {
    if (!selected) {
      setIsPropertiesOpen(false);
      setIsEditing(false);
    }
  }, [selected]);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const handleDoubleClick = () => {
    setIsEditing(true);
  };

  const handleTextChange = (newText: string) => {
    setNodes((nodes) =>
      nodes.map((node) =>
        node.id === id
          ? { ...node, data: { ...node.data, label: newText } }
          : node,
      ),
    );
  };

  const handleBlur = () => {
    setIsEditing(false);
  };

  const updateProperty = (key: string, value: unknown) => {
    setNodes((nodes) =>
      nodes.map((node) =>
        node.id === id
          ? { ...node, data: { ...node.data, [key]: value } }
          : node,
      ),
    );
  };

  return (
    <>
      <NodeToolbar
        position={Position.Bottom}
        isVisible={selected && isPropertiesOpen}
        offset={10}
      >
        <div className="bg-white border border-brand-charcoal/20 shadow-lg rounded-lg p-3 min-w-48">
          <div className="text-[9px] uppercase tracking-widest text-brand-charcoal/50 font-mono mb-2">
            Text Properties
          </div>
          <div className="space-y-2">
            <div>
              <label className="text-[10px] font-mono text-brand-charcoal/60">
                Font Size
              </label>
              <input
                type="number"
                value={fontSize}
                onChange={(e) =>
                  updateProperty("fontSize", Number(e.target.value))
                }
                className="w-full h-7 px-2 text-xs border border-brand-charcoal/20 rounded-sm focus:outline-none focus:border-brand-orange"
              />
            </div>
            <div>
              <label className="text-[10px] font-mono text-brand-charcoal/60">
                Color
              </label>
              <input
                type="color"
                value={color}
                onChange={(e) => updateProperty("color", e.target.value)}
                className="w-full h-7 rounded-sm cursor-pointer"
              />
            </div>
            <div>
              <label className="text-[10px] font-mono text-brand-charcoal/60">
                Weight
              </label>
              <select
                value={fontWeight}
                onChange={(e) =>
                  updateProperty(
                    "fontWeight",
                    e.target.value as "normal" | "bold",
                  )
                }
                className="w-full h-7 px-2 text-xs border border-brand-charcoal/20 rounded-sm focus:outline-none focus:border-brand-orange"
              >
                <option value="normal">Normal</option>
                <option value="bold">Bold</option>
              </select>
            </div>
            <div>
              <label className="text-[10px] font-mono text-brand-charcoal/60">
                Align
              </label>
              <select
                value={textAlign}
                onChange={(e) =>
                  updateProperty(
                    "textAlign",
                    e.target.value as "left" | "center" | "right",
                  )
                }
                className="w-full h-7 px-2 text-xs border border-brand-charcoal/20 rounded-sm focus:outline-none focus:border-brand-orange"
              >
                <option value="left">Left</option>
                <option value="center">Center</option>
                <option value="right">Right</option>
              </select>
            </div>
          </div>
        </div>
      </NodeToolbar>

      <div
        onClick={() => setIsPropertiesOpen(true)}
        onDoubleClick={handleDoubleClick}
        className={cn(
          "relative min-w-32 min-h-8 p-2 cursor-pointer transition-all",
          selected && "ring-2 ring-brand-orange ring-offset-2 rounded-sm",
        )}
      >
        {/* Handles for edges */}
        <Handle
          type="target"
          position={Position.Top}
          className="opacity-0 w-full h-2 border-0 !bg-transparent"
        />
        <Handle
          type="source"
          position={Position.Bottom}
          className="opacity-0 w-full h-2 border-0 !bg-transparent"
        />

        {/* Text content */}
        {isEditing ? (
          <textarea
            ref={inputRef}
            value={text}
            onChange={(e) => handleTextChange(e.target.value)}
            onBlur={handleBlur}
            className="min-w-32 bg-transparent border-none outline-none resize-none"
            style={{
              fontSize: `${fontSize}px`,
              fontWeight,
              color,
              textAlign,
            }}
            rows={3}
          />
        ) : (
          <div
            className="whitespace-pre-wrap"
            style={{
              fontSize: `${fontSize}px`,
              fontWeight,
              color,
              textAlign,
            }}
          >
            {text}
          </div>
        )}
      </div>
    </>
  );
}
