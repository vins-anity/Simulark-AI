import { useState, useEffect, useRef } from "react";
import { X } from "lucide-react";

interface ConnectionLabelDialogProps {
    isOpen: boolean;
    currentLabel: string;
    onSave: (label: string) => void;
    onClose: () => void;
}

export function ConnectionLabelDialog({
    isOpen,
    currentLabel,
    onSave,
    onClose,
}: ConnectionLabelDialogProps) {
    const [label, setLabel] = useState(currentLabel);
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (isOpen) {
            setLabel(currentLabel);
            setTimeout(() => inputRef.current?.focus(), 100);
        }
    }, [isOpen, currentLabel]);

    if (!isOpen) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(label);
        onClose();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
            <div className="relative bg-white border-2 border-brand-charcoal shadow-2xl w-full max-w-sm">
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-brand-charcoal/10">
                    <div>
                        <h3 className="font-poppins font-bold text-sm text-brand-charcoal">
                            Edit Connection Label
                        </h3>
                        <p className="text-[10px] font-mono text-brand-charcoal/50 mt-0.5">
              // CONNECTION_METADATA
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="w-6 h-6 flex items-center justify-center hover:bg-brand-charcoal/5 transition-colors"
                    >
                        <X className="w-4 h-4 text-brand-charcoal/60" />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-6">
                    <label className="block">
                        <span className="text-[9px] font-mono uppercase tracking-widest text-brand-charcoal/60 mb-2 block">
                            LABEL
                        </span>
                        <input
                            ref={inputRef}
                            type="text"
                            value={label}
                            onChange={(e) => setLabel(e.target.value)}
                            className="w-full px-3 py-2 border-2 border-brand-charcoal/20 bg-white font-mono text-sm text-brand-charcoal focus:outline-none focus:border-brand-orange transition-colors"
                            placeholder="e.g., HTTP, WebSocket, gRPC"
                        />
                    </label>

                    {/* Actions */}
                    <div className="flex gap-2 mt-6">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-4 py-2 border-2 border-brand-charcoal/20 text-brand-charcoal font-mono text-xs uppercase tracking-wider hover:bg-brand-charcoal/5 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="flex-1 px-4 py-2 bg-brand-orange border-2 border-brand-orange text-white font-mono text-xs uppercase tracking-wider hover:bg-brand-orange/90 transition-colors"
                        >
                            Save
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
