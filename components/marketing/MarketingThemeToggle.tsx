"use client";

import * as React from "react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { motion } from "framer-motion";

export function MarketingThemeToggle() {
    const { setTheme, theme, systemTheme } = useTheme();
    const [mounted, setMounted] = React.useState(false);

    React.useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) {
        return <div className="w-14 h-7 bg-brand-charcoal/5 rounded-sm border border-brand-charcoal/20" />;
    }

    const currentTheme = theme === "system" ? systemTheme : theme;
    const isDark = currentTheme === "dark";

    const toggleTheme = () => {
        setTheme(isDark ? "light" : "dark");
    };

    return (
        <button
            onClick={toggleTheme}
            className="group relative flex items-center justify-between w-14 h-7 rounded-sm border border-brand-charcoal/20 bg-transparent hover:border-brand-orange/50 transition-colors cursor-pointer overflow-hidden"
            aria-label="Toggle theme"
        >
            <div className={`absolute inset-0 bg-brand-charcoal/5 transition-transform duration-500 ease-out origin-left ${isDark ? 'scale-x-100' : 'scale-x-0'}`} />

            {/* Sun Icon */}
            <div className="z-10 flex items-center justify-center w-7 h-full">
                <Sun className={`w-3.5 h-3.5 transition-all duration-300 ${isDark ? 'text-brand-charcoal/20 scale-75' : 'text-brand-orange scale-100 rotate-0'}`} />
            </div>

            {/* Moon Icon */}
            <div className="z-10 flex items-center justify-center w-7 h-full">
                <Moon className={`w-3.5 h-3.5 transition-all duration-300 ${isDark ? 'text-brand-sand-light scale-100 rotate-0' : 'text-brand-charcoal/20 scale-75 -rotate-12'}`} />
            </div>

            {/* Slider Indicator */}
            <motion.div
                className="absolute top-0.5 bottom-0.5 w-6 bg-brand-charcoal dark:bg-zinc-200 rounded-sm shadow-sm z-0"
                initial={false}
                animate={{
                    x: isDark ? 28 : 2,
                }}
                transition={{
                    type: "spring",
                    stiffness: 400,
                    damping: 30
                }}
            >
                <div className="flex items-center justify-center w-full h-full">
                    <div className="w-0.5 h-2 bg-white/20 dark:bg-black/20 rounded-full" />
                </div>
            </motion.div>
        </button>
    );
}
