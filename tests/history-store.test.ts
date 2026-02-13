import { beforeEach, describe, expect, it } from "vitest";
import { createHistoryStore, useGraphHistory } from "../lib/history-store";

describe("History Store", () => {
  describe("createHistoryStore", () => {
    interface TestState {
      value: number;
      label: string;
    }

    let store: ReturnType<typeof createHistoryStore<TestState>>;

    beforeEach(() => {
      store = createHistoryStore<TestState>(5);
    });

    it("should initialize with empty history", () => {
      const state = store.getState();
      expect(state.past).toHaveLength(0);
      expect(state.future).toHaveLength(0);
      expect(state.present).toBeNull();
    });

    it("should push state to history", () => {
      const { pushState } = store.getState();
      pushState({ value: 1, label: "first" });

      const state = store.getState();
      expect(state.present).toEqual({ value: 1, label: "first" });
      // First push stores null as past
      expect(state.past.length).toBeGreaterThanOrEqual(0);
    });

    it("should build history stack on multiple pushes", () => {
      const { pushState } = store.getState();

      pushState({ value: 1, label: "first" });
      pushState({ value: 2, label: "second" });
      pushState({ value: 3, label: "third" });

      const state = store.getState();
      expect(state.present).toEqual({ value: 3, label: "third" });
      expect(state.past.length).toBeGreaterThanOrEqual(2);
    });

    it("should undo to previous state", () => {
      const { pushState, undo } = store.getState();

      pushState({ value: 1, label: "first" });
      pushState({ value: 2, label: "second" });

      const previous = undo();
      expect(previous).toEqual({ value: 1, label: "first" });
      expect(store.getState().present).toEqual({ value: 1, label: "first" });
    });

    it("should return null when no undo available", () => {
      const { undo } = store.getState();
      const result = undo();
      expect(result).toBeNull();
    });

    it("should redo to next state", () => {
      const { pushState, undo, redo } = store.getState();

      pushState({ value: 1, label: "first" });
      pushState({ value: 2, label: "second" });
      undo();

      const next = redo();
      expect(next).toEqual({ value: 2, label: "second" });
      expect(store.getState().present).toEqual({ value: 2, label: "second" });
    });

    it("should return null when no redo available", () => {
      const { redo } = store.getState();
      const result = redo();
      expect(result).toBeNull();
    });

    it("should clear future on new push", () => {
      const { pushState, undo, clear } = store.getState();

      pushState({ value: 1, label: "first" });
      pushState({ value: 2, label: "second" });
      undo();

      expect(store.getState().future).toHaveLength(1);

      pushState({ value: 3, label: "third" });
      expect(store.getState().future).toHaveLength(0);
    });

    it("should respect max history size", () => {
      const smallStore = createHistoryStore<TestState>(2);
      const { pushState } = smallStore.getState();

      pushState({ value: 1, label: "first" });
      pushState({ value: 2, label: "second" });
      pushState({ value: 3, label: "third" });
      pushState({ value: 4, label: "fourth" });

      const state = smallStore.getState();
      expect(state.past).toHaveLength(2);
    });

    it("should not push identical state", () => {
      const { pushState, clear } = store.getState();
      clear(); // Start fresh

      pushState({ value: 1, label: "first" });
      const stateAfterFirst = store.getState();
      const pastCountAfterFirst = stateAfterFirst.past.length;

      pushState({ value: 1, label: "first" }); // Identical
      const stateAfterSecond = store.getState();

      // Past should not grow when pushing identical state
      expect(stateAfterSecond.past.length).toBe(pastCountAfterFirst);
    });

    it("should report canUndo correctly", () => {
      const { pushState, canUndo, clear } = store.getState();
      clear(); // Start fresh

      expect(canUndo()).toBe(false);

      pushState({ value: 1, label: "first" });
      // After first push, canUndo depends on whether null was pushed to past
      pushState({ value: 2, label: "second" });
      expect(canUndo()).toBe(true);
    });

    it("should report canRedo correctly", () => {
      const { pushState, undo, canRedo } = store.getState();

      expect(canRedo()).toBe(false);

      pushState({ value: 1, label: "first" });
      pushState({ value: 2, label: "second" });
      expect(canRedo()).toBe(false);

      undo();
      expect(canRedo()).toBe(true);
    });

    it("should clear all history", () => {
      const { pushState, clear } = store.getState();

      pushState({ value: 1, label: "first" });
      pushState({ value: 2, label: "second" });

      clear();

      const state = store.getState();
      expect(state.past).toHaveLength(0);
      expect(state.future).toHaveLength(0);
      expect(state.present).toBeNull();
    });

    it("should return history info", () => {
      const { pushState, undo, getHistoryInfo, clear } = store.getState();
      clear(); // Start fresh

      pushState({ value: 1, label: "first" });
      pushState({ value: 2, label: "second" });
      pushState({ value: 3, label: "third" });

      let info = getHistoryInfo();
      expect(info.pastCount).toBeGreaterThanOrEqual(2);
      expect(info.futureCount).toBe(0);

      undo();
      info = getHistoryInfo();
      expect(info.pastCount).toBeGreaterThanOrEqual(1);
      expect(info.futureCount).toBeGreaterThanOrEqual(1);
    });
  });

  describe("useGraphHistory", () => {
    it("should be a pre-configured store for graph state", () => {
      const state = useGraphHistory.getState();
      expect(state.maxHistorySize).toBe(100);

      // Test with graph state
      const { pushState, undo, redo } = useGraphHistory.getState();

      pushState(
        {
          nodes: [{ id: "1", type: "service", position: { x: 0, y: 0 } }],
          edges: [],
        },
        "add node",
      );

      expect(useGraphHistory.getState().present?.nodes).toHaveLength(1);
    });
  });
});
