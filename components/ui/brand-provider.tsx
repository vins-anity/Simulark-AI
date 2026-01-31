"use client";

import * as React from "react";

type AccentColor = "#d97757" | "#6a9bcc" | "#788c5d";
const ACCENTS: AccentColor[] = ["#d97757", "#6a9bcc", "#788c5d"]; // Orange, Blue, Green

interface BrandContextType {
  getAccent: (index: number) => AccentColor;
  nextAccent: () => AccentColor;
}

const BrandContext = React.createContext<BrandContextType | undefined>(
  undefined,
);

export function BrandProvider({ children }: { children: React.ReactNode }) {
  const accentIndexRef = React.useRef(0);

  const getAccent = React.useCallback((index: number) => {
    return ACCENTS[index % ACCENTS.length];
  }, []);

  const nextAccent = React.useCallback(() => {
    const color = ACCENTS[accentIndexRef.current % ACCENTS.length];
    accentIndexRef.current += 1;
    return color;
  }, []);

  return (
    <BrandContext.Provider value={{ getAccent, nextAccent }}>
      {children}
    </BrandContext.Provider>
  );
}

export const useBrand = () => {
  const context = React.useContext(BrandContext);
  if (!context) {
    throw new Error("useBrand must be used within a BrandProvider");
  }
  return context;
};
