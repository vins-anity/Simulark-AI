import { useState, useEffect, useRef } from "react";
import { Copy, Edit2, Trash2 } from "lucide-react";

interface NodeContextMenuProps {
  x: number;
  y: number;
  onEdit: () => void;
  onDuplicate: () => void;
  onDelete: () => void;
  onClose: () => void;
}

export function NodeContextMenu({
  x,
  y,
  onEdit,
  onDuplicate,
  onDelete,
  onClose,
}: NodeContextMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [onClose]);

  return (
    <div
      ref={menuRef}
      className="fixed z-50 bg-white border border-brand-charcoal/10 shadow-2xl rounded-md overflow-hidden min-w-[160px]"
      style={{ left: x, top: y }}
    >
      <button
        onClick={() => {
          onEdit();
          onClose();
        }}
        className="w-full px-3 py-2 text-left text-xs font-mono hover:bg-brand-orange/10 transition-colors flex items-center gap-2 text-brand-charcoal"
      >
        <Edit2 className="w-3.5 h-3.5" />
        Edit Label
      </button>
      <button
        onClick={() => {
          onDuplicate();
          onClose();
        }}
        className="w-full px-3 py-2 text-left text-xs font-mono hover:bg-brand-orange/10 transition-colors flex items-center gap-2 text-brand-charcoal"
      >
        <Copy className="w-3.5 h-3.5" />
        Duplicate
      </button>
      <div className="h-px bg-brand-charcoal/10" />
      <button
        onClick={() => {
          onDelete();
          onClose();
        }}
        className="w-full px-3 py-2 text-left text-xs font-mono hover:bg-red-50 transition-colors flex items-center gap-2 text-red-600"
      >
        <Trash2 className="w-3.5 h-3.5" />
        Delete
      </button>
    </div>
  );
}
