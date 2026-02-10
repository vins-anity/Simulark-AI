import {
  X,
  Trash2,
  Database,
  Zap,
  HardDrive,
  Globe,
  Cpu,
  Box,
} from "lucide-react";
import { useReactFlow } from "@xyflow/react";
import { toast } from "sonner";
import { TechCombobox } from "../TechCombobox";
import { Icon } from "@iconify/react";

interface NodePropertiesProps {
  id: string;
  data: any;
  type?: string;
}

// Service type categories
const SERVICE_TYPES: Record<string, { label: string; icon: any }> = {
  service: { label: "SERVICE", icon: Cpu },
  frontend: { label: "FRONTEND", icon: Globe },
  backend: { label: "BACKEND", icon: Box },
  database: { label: "DATABASE", icon: Database },
  function: { label: "FUNCTION", icon: Zap },
  storage: { label: "STORAGE", icon: HardDrive },
  client: { label: "CLIENT", icon: Globe }, // Legacy support
  gateway: { label: "GATEWAY", icon: Box },
  queue: { label: "QUEUE", icon: Box },
  cache: { label: "CACHE", icon: Database },
  ai: { label: "AI MODEL", icon: Cpu },
};

export function NodeProperties({
  id,
  data,
  type = "service",
}: NodePropertiesProps) {
  const { setNodes } = useReactFlow();

  const serviceType = SERVICE_TYPES[type] || SERVICE_TYPES.service;
  const TypeIcon = serviceType.icon;

  const handleUpdate = (updates: Record<string, any>) => {
    setNodes((nodes) =>
      nodes.map((n) => {
        if (n.id !== id) return n;
        return {
          ...n,
          data: { ...n.data, ...updates },
        };
      }),
    );
  };

  const handleTechChange = (techLabel: string, techItem?: any) => {
    // Update both tech label and logo for immediate visual feedback
    handleUpdate({
      tech: techLabel,
      logo: techItem?.icon,
      techLabel: techLabel,
    });
  };

  const handleDelete = () => {
    setNodes((nodes) => nodes.filter((n) => n.id !== id));
    toast.success("Resource deleted");
  };

  const handleClose = () => {
    setNodes((nodes) =>
      nodes.map((n) => (n.id === id ? { ...n, selected: false } : n)),
    );
  };

  return (
    <div className="w-56 bg-white/95 backdrop-blur-sm rounded-lg shadow-xl border border-brand-charcoal/10 overflow-hidden font-sans animation-in slide-in-from-right-10 duration-200">
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-brand-charcoal/5 bg-gray-50/80">
        <div className="flex items-center gap-2 overflow-hidden">
          {data.logo ? (
            <Icon icon={data.logo} className="w-5 h-5 shrink-0" />
          ) : (
            <TypeIcon size={16} className="text-brand-charcoal/40 shrink-0" />
          )}
          <input
            value={data.label || ""}
            onChange={(e) => handleUpdate({ label: e.target.value })}
            className="text-xs font-bold text-brand-charcoal bg-transparent border-none focus:outline-none focus:ring-0 p-0 w-full placeholder:text-gray-300 truncate"
            placeholder="Node Name"
          />
        </div>
        <button
          onClick={handleClose}
          className="text-brand-charcoal/20 hover:text-brand-charcoal/60 transition-colors shrink-0"
        >
          <X size={12} />
        </button>
      </div>

      <div className="p-3 space-y-3">
        {/* Service Type Badge */}
        <div className="flex items-center gap-2">
          <span className="text-[9px] font-mono font-bold uppercase text-brand-charcoal/40 tracking-tight px-1.5 py-0.5 bg-brand-charcoal/5 rounded">
            {serviceType.label}
          </span>
        </div>

        {/* Tech Selection */}
        <TechCombobox
          value={data.tech}
          onChange={handleTechChange}
          className="h-7 text-[10px]"
          type={type}
        />

        {/* Footer Actions */}
        <div className="pt-2 flex items-center justify-between border-t border-brand-charcoal/5">
          <span
            className="text-[9px] font-mono text-brand-charcoal/20 truncate max-w-[80px]"
            title={id}
          >
            {id.split("-")[0]}
          </span>
          <button
            className="text-[9px] font-mono text-red-400 hover:text-red-600 flex items-center gap-1 transition-colors px-1 py-0.5 rounded hover:bg-red-50"
            onClick={handleDelete}
          >
            <Trash2 size={10} /> Delete
          </button>
        </div>
      </div>
    </div>
  );
}
