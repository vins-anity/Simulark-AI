import { X, Info, Zap, Settings2 } from "lucide-react";
import { useReactFlow } from "@xyflow/react";
import { useState } from "react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Icon } from "@iconify/react";

interface NodePropertiesProps {
    id: string;
    data: any;
    type?: string;
}

export function NodeProperties({ id, data, type }: NodePropertiesProps) {
    const { setNodes, getNodes } = useReactFlow();
    const [showServiceSwitcher, setShowServiceSwitcher] = useState(false);

    // Mock Service Options
    const serviceOptions = [
        { id: "generic", label: "Generic", icon: "lucide:box" },
        { id: "aws", label: "AWS Lambda", icon: "logos:aws-lambda" },
        { id: "google", label: "Cloud Run", icon: "logos:google-cloud-run" },
        { id: "azure", label: "Azure Fn", icon: "logos:azure-functions" },
        { id: "vercel", label: "Vercel", icon: "logos:vercel-icon" },
        { id: "supabase", label: "Supabase", icon: "logos:supabase-icon" },
    ];

    const handleServiceChange = (tech: string) => {
        setNodes((nodes) =>
            nodes.map((n) =>
                n.id === id ? { ...n, data: { ...n.data, tech: tech, techLabel: tech } } : n
            )
        );
        toast.success(`Switched to ${tech}`);
        setShowServiceSwitcher(false);
    };

    const handleClose = () => {
        setNodes((nodes) =>
            nodes.map((n) =>
                n.id === id ? { ...n, selected: false } : n
            )
        );
    };

    const handleDelete = () => {
        setNodes((nodes) => nodes.filter((n) => n.id !== id));
        toast.success("Node deleted");
    };

    if (showServiceSwitcher) {
        return (
            <div className="w-64 bg-white rounded-lg shadow-xl border border-brand-charcoal/10 overflow-hidden animate-in zoom-in-95 duration-200">
                <div className="flex items-center justify-between p-3 border-b border-brand-charcoal/5 bg-brand-charcoal/5">
                    <h4 className="text-xs font-mono font-bold uppercase text-brand-charcoal/70">Replace Node</h4>
                    <button onClick={() => setShowServiceSwitcher(false)} className="text-brand-charcoal/40 hover:text-brand-charcoal">
                        <X size={14} />
                    </button>
                </div>
                <div className="p-2 grid grid-cols-2 gap-2">
                    {serviceOptions.map((option) => (
                        <button
                            key={option.id}
                            onClick={() => handleServiceChange(option.label)}
                            className="flex flex-col items-center justify-center gap-2 p-3 rounded-md border border-brand-charcoal/5 hover:border-brand-orange/50 hover:bg-brand-orange/5 transition-all group"
                        >
                            <Icon icon={option.icon} className="w-6 h-6 text-brand-charcoal/60 group-hover:text-brand-charcoal" />
                            <span className="text-[10px] font-mono text-brand-charcoal/60 group-hover:text-brand-charcoal">{option.label}</span>
                        </button>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="w-72 bg-white rounded-lg shadow-2xl border border-brand-charcoal/10 overflow-hidden font-sans">
            {/* Header */}
            <div className="flex justify-between items-start p-4 border-b border-brand-charcoal/5">
                <div>
                    <h3 className="text-[10px] font-mono font-bold uppercase tracking-widest text-brand-charcoal/40 mb-1">Node Properties</h3>
                    <p className="text-lg font-bold text-brand-charcoal leading-none">{data?.label || "Node"}</p>
                </div>
                <button
                    onClick={handleClose}
                    className="text-brand-charcoal/20 hover:text-brand-charcoal/60 transition-colors"
                    title="Close"
                >
                    <X size={16} />
                </button>
            </div>

            <div className="p-4 space-y-4">
                {/* Type Field */}
                <div className="space-y-1">
                    <label className="text-[9px] font-mono uppercase text-brand-charcoal/40">Type</label>
                    <div className="p-2 bg-brand-charcoal/5 text-xs font-mono text-brand-charcoal rounded-sm border border-brand-charcoal/10">
                        {type || 'Unknown'}
                    </div>
                </div>

                {/* Service Tech Field */}
                <div className="space-y-1">
                    <label className="text-[9px] font-mono uppercase text-brand-charcoal/40">Service Tech</label>
                    <div
                        className="flex justify-between items-center p-2 bg-white text-xs font-mono text-brand-charcoal rounded-sm border border-brand-charcoal/10"
                    >
                        <span>{data?.tech as string || 'Generic'}</span>
                        <button
                            onClick={() => setShowServiceSwitcher(true)}
                            className="text-[9px] font-bold text-brand-orange hover:text-brand-orange/70 transition-colors uppercase tracking-wider"
                        >
                            CHANGE
                        </button>
                    </div>
                </div>

                {/* Actions Footer */}
                <div className="pt-2 flex justify-end">
                    <button
                        className="text-[10px] font-mono uppercase tracking-wider text-red-500 hover:text-red-700 flex items-center gap-1 opacity-60 hover:opacity-100 transition-opacity"
                        onClick={handleDelete}
                    >
                        <Info size={12} /> DELETE NODE
                    </button>
                </div>
            </div>
        </div>
    );
}
