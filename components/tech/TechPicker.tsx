"use client";

import { Icon } from "@iconify/react";
import { Check, Search } from "lucide-react";
import { useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import {
  getTechOptionsByCategory,
  searchTechOptions,
} from "@/lib/tech-options";
import { cn } from "@/lib/utils";

type TechGroup = "cloud" | "languages" | "frameworks";

interface TechPickerProps {
  group: TechGroup;
  selected: string[];
  onChange: (ids: string[]) => void;
  maxHeight?: string;
}

export function TechPicker({
  group,
  selected,
  onChange,
  maxHeight = "280px",
}: TechPickerProps) {
  const [query, setQuery] = useState("");

  const options = useMemo(() => {
    const items = query
      ? searchTechOptions(query, group)
      : getTechOptionsByCategory(group);
    return items.slice(0, query ? 48 : 36);
  }, [group, query]);

  const toggle = (id: string) => {
    if (selected.includes(id)) {
      onChange(selected.filter((item) => item !== id));
      return;
    }
    onChange([...selected, id]);
  };

  return (
    <div className="space-y-2">
      <div className="relative">
        <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-brand-charcoal/40" />
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={`Search ${group}...`}
          className="pl-8 h-9 text-xs font-mono rounded-none border-brand-charcoal/15"
        />
      </div>
      <div
        className="grid grid-cols-2 gap-2 sm:grid-cols-3 overflow-y-auto pr-1"
        style={{ maxHeight }}
      >
        {options.map((tech) => {
          const isSelected = selected.includes(tech.id);
          return (
            <button
              key={tech.id}
              type="button"
              onClick={() => toggle(tech.id)}
              className={cn(
                "flex items-center gap-2 border p-2 text-left transition-all",
                isSelected
                  ? "border-brand-orange bg-brand-orange/5"
                  : "border-brand-charcoal/10 hover:border-brand-charcoal/30",
              )}
            >
              <Icon icon={tech.icon} className="h-4 w-4 shrink-0" />
              <span className="flex-1 text-[10px] font-medium uppercase truncate">
                {tech.label}
              </span>
              {isSelected && (
                <Check className="h-3 w-3 shrink-0 text-brand-orange" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
