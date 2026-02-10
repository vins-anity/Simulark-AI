"use client";

import { useState } from "react";
import { Check, ChevronsUpDown, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuGroup,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { TECH_ECOSYSTEM, type TechItem } from "@/lib/tech-ecosystem";
import { Icon } from "@iconify/react";

interface TechComboboxProps {
  value?: string;
  onChange: (value: string, techItem?: TechItem) => void;
  className?: string;
  type?: string;
}

export function TechCombobox({
  value,
  onChange,
  className,
  type,
}: TechComboboxProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");

  const selectedTech = TECH_ECOSYSTEM.find(
    (item) => item.label === value || item.id === value,
  );

  const allowedTechs = TECH_ECOSYSTEM.filter((item) => {
    if (!type) return true;
    switch (type) {
      case "frontend":
        return item.category === "frontend";
      case "backend":
        return item.category === "backend";
      case "database":
        return item.category === "database";
      case "queue":
        return item.defaultType === "queue";
      case "storage":
        return item.category === "storage";
      case "ai":
        return item.category === "ai";
      case "client":
        return item.category === "frontend" || item.defaultType === "client";
      case "function":
        return item.category === "compute" || item.defaultType === "function";
      case "gateway":
        return item.defaultType === "gateway" || item.category === "devops";
      case "cache":
        return item.category === "database";
      // Service is now a catch-all for backend/frontend/compute if not specified
      case "service":
        return ["backend", "frontend", "compute", "tooling"].includes(
          item.category,
        );
      default:
        return true;
    }
  });

  const filteredTechs = allowedTechs.filter(
    (item) =>
      item.label.toLowerCase().includes(search.toLowerCase()) ||
      item.id.toLowerCase().includes(search.toLowerCase()),
  );

  // Group by category
  const groupedTechs = filteredTechs.reduce(
    (acc, item) => {
      if (!acc[item.category]) acc[item.category] = [];
      acc[item.category].push(item);
      return acc;
    },
    {} as Record<string, TechItem[]>,
  );

  const categories = Object.keys(groupedTechs).sort();

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn(
            "w-full justify-between font-mono text-xs h-8 bg-white",
            className,
          )}
        >
          {selectedTech ? (
            <div className="flex items-center gap-2">
              <Icon icon={selectedTech.icon} className="w-4 h-4" />
              {selectedTech.label}
            </div>
          ) : (
            <span className="text-muted-foreground">Select Tech...</span>
          )}
          <ChevronsUpDown className="ml-2 h-3 w-3 shrink-0 opacity-50" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-[240px] p-0" align="start">
        <div className="flex items-center border-b px-3 pb-2 pt-2">
          <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
          <input
            className="flex h-6 w-full rounded-md bg-transparent py-1 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50"
            placeholder="Search framework..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onClick={(e) => e.stopPropagation()}
            onKeyDown={(e) => e.stopPropagation()}
          />
        </div>
        <div className="max-h-[300px] overflow-y-auto p-1">
          {categories.length === 0 && (
            <div className="py-6 text-center text-xs text-muted-foreground">
              No framework found.
            </div>
          )}
          {categories.map((category) => (
            <DropdownMenuGroup key={category}>
              <DropdownMenuLabel className="text-[10px] uppercase text-muted-foreground px-2 py-1.5 bg-muted/50">
                {category}
              </DropdownMenuLabel>
              {groupedTechs[category].map((tech) => (
                <DropdownMenuItem
                  key={tech.id}
                  onSelect={() => {
                    onChange(tech.label, tech);
                    setOpen(false);
                  }}
                  className="flex items-center gap-2 text-xs"
                >
                  <Icon icon={tech.icon} className="w-4 h-4" />
                  {tech.label}
                  {value === tech.label && (
                    <Check className="ml-auto h-3 w-3 opacity-50" />
                  )}
                </DropdownMenuItem>
              ))}
              <DropdownMenuSeparator />
            </DropdownMenuGroup>
          ))}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
