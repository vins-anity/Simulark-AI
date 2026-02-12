import { create } from "zustand";

/**
 * History entry for undo/redo functionality
 */
interface HistoryEntry<T> {
  state: T;
  timestamp: number;
  action?: string; // Optional description of what changed
}

/**
 * History store state
 */
interface HistoryState<T> {
  // Current state
  present: T | null;

  // History stacks
  past: HistoryEntry<T>[];
  future: HistoryEntry<T>[];

  // Configuration
  maxHistorySize: number;

  // Actions
  pushState: (state: T, action?: string) => void;
  undo: () => T | null;
  redo: () => T | null;
  canUndo: () => boolean;
  canRedo: () => boolean;
  clear: () => void;
  getHistoryInfo: () => { pastCount: number; futureCount: number };
}

/**
 * Generic history store factory for undo/redo functionality
 * Uses the Command Pattern for state management
 */
export function createHistoryStore<T>(maxHistorySize = 50) {
  return create<HistoryState<T>>((set, get) => ({
    present: null,
    past: [],
    future: [],
    maxHistorySize,

    pushState: (state: T, action?: string) => {
      const { present, past, maxHistorySize } = get();

      // Don't push if state is identical to present
      if (present && JSON.stringify(present) === JSON.stringify(state)) {
        return;
      }

      const newEntry: HistoryEntry<T> = {
        state: present as T,
        timestamp: Date.now(),
        action,
      };

      // Add current state to past, clear future
      const newPast = [...past, newEntry].slice(-maxHistorySize);

      set({
        past: newPast,
        present: state,
        future: [], // Clear future on new action
      });
    },

    undo: () => {
      const { past, present, future } = get();

      if (past.length === 0) {
        return null;
      }

      // Get the previous state
      const previous = past[past.length - 1];
      const newPast = past.slice(0, -1);

      // Add current state to future
      const newFuture: HistoryEntry<T>[] = present
        ? [
            {
              state: present,
              timestamp: Date.now(),
              action: "undo",
            },
            ...future,
          ]
        : future;

      set({
        past: newPast,
        present: previous.state,
        future: newFuture,
      });

      return previous.state;
    },

    redo: () => {
      const { past, present, future } = get();

      if (future.length === 0) {
        return null;
      }

      // Get the next state
      const next = future[0];
      const newFuture = future.slice(1);

      // Add current state to past
      const newPast: HistoryEntry<T>[] = present
        ? [
            ...past,
            {
              state: present,
              timestamp: Date.now(),
              action: "redo",
            },
          ]
        : past;

      set({
        past: newPast,
        present: next.state,
        future: newFuture,
      });

      return next.state;
    },

    canUndo: () => {
      return get().past.length > 0;
    },

    canRedo: () => {
      return get().future.length > 0;
    },

    clear: () => {
      set({
        past: [],
        present: null,
        future: [],
      });
    },

    getHistoryInfo: () => {
      const { past, future } = get();
      return {
        pastCount: past.length,
        futureCount: future.length,
      };
    },
  }));
}

/**
 * Graph state type for the canvas
 */
export interface GraphState {
  nodes: unknown[];
  edges: unknown[];
}

/**
 * Create the graph history store
 */
export const useGraphHistory = createHistoryStore<GraphState>(100);

/**
 * Hook for using graph history with the canvas
 */
export function useGraphHistoryActions() {
  const { pushState, undo, redo, canUndo, canRedo, clear, getHistoryInfo } =
    useGraphHistory();

  return {
    pushState,
    undo,
    redo,
    canUndo,
    canRedo,
    clear,
    getHistoryInfo,
  };
}
