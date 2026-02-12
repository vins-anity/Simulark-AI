import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface ResponsiveContainerProps {
  children: ReactNode;
  className?: string;
}

export function ResponsiveContainer({
  children,
  className,
}: ResponsiveContainerProps) {
  return (
    <div
      className={cn(
        "w-full mx-auto px-4 sm:px-6 lg:px-8",
        "max-w-full sm:max-w-[640px] md:max-w-[768px] lg:max-w-[1024px] xl:max-w-[1280px]",
        className,
      )}
    >
      {children}
    </div>
  );
}

// Touch-friendly button wrapper
interface TouchButtonProps {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
}

export function TouchButton({
  children,
  className,
  onClick,
}: TouchButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "min-h-[44px] min-w-[44px] touch-manipulation",
        "active:scale-95 transition-transform",
        className,
      )}
    >
      {children}
    </button>
  );
}

// Responsive grid that adapts to screen size
interface ResponsiveGridProps {
  children: ReactNode;
  className?: string;
  cols?: {
    default?: number;
    sm?: number;
    md?: number;
    lg?: number;
  };
}

export function ResponsiveGrid({
  children,
  className,
  cols = { default: 1, sm: 2, md: 3, lg: 4 },
}: ResponsiveGridProps) {
  const getColsClass = () => {
    const classes: string[] = [];
    if (cols.default) classes.push(`grid-cols-${cols.default}`);
    if (cols.sm) classes.push(`sm:grid-cols-${cols.sm}`);
    if (cols.md) classes.push(`md:grid-cols-${cols.md}`);
    if (cols.lg) classes.push(`lg:grid-cols-${cols.lg}`);
    return classes.join(" ");
  };

  return (
    <div className={cn("grid gap-4", getColsClass(), className)}>
      {children}
    </div>
  );
}

// Mobile navigation wrapper
interface MobileNavProps {
  children: ReactNode;
  className?: string;
}

export function MobileNav({ children, className }: MobileNavProps) {
  return (
    <nav
      className={cn(
        "fixed bottom-0 left-0 right-0 z-50",
        "bg-bg-secondary border-t border-border-primary",
        "safe-area-pb",
        className,
      )}
    >
      <div className="flex items-center justify-around h-16 px-4">
        {children}
      </div>
    </nav>
  );
}

// Responsive sidebar that collapses on mobile
interface ResponsiveSidebarProps {
  children: ReactNode;
  className?: string;
  isOpen?: boolean;
}

export function ResponsiveSidebar({
  children,
  className,
  isOpen = true,
}: ResponsiveSidebarProps) {
  return (
    <aside
      className={cn(
        "fixed inset-y-0 left-0 z-40 w-72 bg-bg-secondary border-r border-border-primary",
        "transform transition-transform duration-300 ease-in-out",
        "lg:relative lg:transform-none",
        !isOpen && "-translate-x-full lg:translate-x-0 lg:w-20",
        className,
      )}
    >
      {children}
    </aside>
  );
}
