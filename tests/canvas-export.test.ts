import { describe, expect, it } from "vitest";
import { calculateGraphExportBounds } from "../lib/canvas-export";

describe("calculateGraphExportBounds", () => {
  it("returns padded bounds for positioned nodes", () => {
    const bounds = calculateGraphExportBounds(
      [
        {
          position: { x: 100, y: 200 },
          measured: { width: 300, height: 120 },
        },
        {
          position: { x: 500, y: 100 },
          measured: { width: 250, height: 160 },
        },
      ],
      50,
    );

    expect(bounds.minX).toBe(100);
    expect(bounds.minY).toBe(100);
    expect(bounds.maxX).toBe(750);
    expect(bounds.maxY).toBe(320);
    expect(bounds.width).toBe(750);
    expect(bounds.height).toBe(320);
    expect(bounds.translateX).toBe(-50);
    expect(bounds.translateY).toBe(-50);
  });

  it("uses style dimensions when measured is unavailable", () => {
    const bounds = calculateGraphExportBounds(
      [
        {
          position: { x: 0, y: 0 },
          style: { width: "320px", height: "180px" },
        },
      ],
      20,
    );

    expect(bounds.maxX).toBe(320);
    expect(bounds.maxY).toBe(180);
    expect(bounds.width).toBe(360);
    expect(bounds.height).toBe(220);
    expect(bounds.translateX).toBe(20);
    expect(bounds.translateY).toBe(20);
  });

  it("falls back to defaults when dimensions are missing", () => {
    const bounds = calculateGraphExportBounds(
      [
        {
          position: { x: -20, y: -30 },
        },
      ],
      10,
    );

    expect(bounds.maxX).toBe(180);
    expect(bounds.maxY).toBe(70);
    expect(bounds.width).toBe(220);
    expect(bounds.height).toBe(120);
    expect(bounds.translateX).toBe(30);
    expect(bounds.translateY).toBe(40);
  });

  it("returns minimal export area for empty diagrams", () => {
    const bounds = calculateGraphExportBounds([], 25);

    expect(bounds.width).toBe(50);
    expect(bounds.height).toBe(50);
    expect(bounds.translateX).toBe(25);
    expect(bounds.translateY).toBe(25);
  });
});
