import { useEffect, useCallback, useRef } from "react";

/**
 * Keyboard shortcut definition
 */
export interface KeyboardShortcut {
  key: string;
  ctrl?: boolean;
  shift?: boolean;
  alt?: boolean;
  meta?: boolean;
  action: () => void;
  description?: string;
  preventDefault?: boolean;
}

/**
 * Check if the current focus is on an input element
 */
function isInputElementFocused(): boolean {
  const activeElement = document.activeElement;
  if (!activeElement) return false;

  const tagName = activeElement.tagName.toLowerCase();
  const isEditable = (activeElement as HTMLElement).isContentEditable;

  // Check for input-like elements
  if (
    tagName === "input" ||
    tagName === "textarea" ||
    tagName === "select" ||
    isEditable ||
    activeElement.getAttribute("role") === "textbox"
  ) {
    return true;
  }

  return false;
}

/**
 * Check if the focus is within the canvas area
 */
function isCanvasFocused(): boolean {
  const activeElement = document.activeElement;
  if (!activeElement) return false;

  // Check if we're inside the ReactFlow canvas
  const reactFlowElement = activeElement.closest(".react-flow");
  return !!reactFlowElement;
}

/**
 * Hook for registering keyboard shortcuts
 */
export function useKeyboardShortcuts(
  shortcuts: KeyboardShortcut[],
  options: { requireCanvasFocus?: boolean } = {},
) {
  const shortcutsRef = useRef(shortcuts);
  const { requireCanvasFocus = false } = options;

  // Update ref when shortcuts change
  useEffect(() => {
    shortcutsRef.current = shortcuts;
  }, [shortcuts]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Skip if focused on input elements (unless it's a save shortcut)
      if (isInputElementFocused()) {
        // Allow save shortcut even when in inputs
        const isSaveShortcut =
          (event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "s";
        if (!isSaveShortcut) {
          return;
        }
      }

      // If canvas focus is required, check if we're in the canvas
      if (requireCanvasFocus && !isCanvasFocused()) {
        return;
      }

      const { key, ctrlKey, shiftKey, altKey, metaKey } = event;

      // Find matching shortcut
      const matchingShortcut = shortcutsRef.current.find((shortcut) => {
        const keyMatch = shortcut.key.toLowerCase() === key.toLowerCase();
        const ctrlMatch = shortcut.ctrl ? ctrlKey : !ctrlKey;
        const shiftMatch = shortcut.shift ? shiftKey : !shiftKey;
        const altMatch = shortcut.alt ? altKey : !altKey;
        const metaMatch = shortcut.meta ? metaKey : !metaKey;

        return keyMatch && ctrlMatch && shiftMatch && altMatch && metaMatch;
      });

      if (matchingShortcut) {
        if (matchingShortcut.preventDefault !== false) {
          event.preventDefault();
        }
        matchingShortcut.action();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [requireCanvasFocus]);
}

/**
 * Common keyboard shortcuts for the canvas
 */
export interface CanvasShortcuts {
  undo: () => void;
  redo: () => void;
  delete: () => void;
  selectAll: () => void;
  copy: () => void;
  paste: () => void;
  zoomIn: () => void;
  zoomOut: () => void;
  fitView: () => void;
  save: () => void;
  export: () => void;
}

/**
 * Hook for canvas keyboard shortcuts
 * Only enables shortcuts when the canvas is focused (not when typing in inputs)
 */
export function useCanvasShortcuts(actions: Partial<CanvasShortcuts>) {
  const shortcuts: KeyboardShortcut[] = [
    // Undo: Ctrl/Cmd + Z
    {
      key: "z",
      ctrl: true,
      action: () => actions.undo?.(),
      description: "Undo",
    },
    // Redo: Ctrl/Cmd + Shift + Z
    {
      key: "z",
      ctrl: true,
      shift: true,
      action: () => actions.redo?.(),
      description: "Redo",
    },
    // Redo: Ctrl/Cmd + Y (alternative)
    {
      key: "y",
      ctrl: true,
      action: () => actions.redo?.(),
      description: "Redo (alternative)",
    },
    // Delete: Delete or Backspace
    {
      key: "Delete",
      action: () => actions.delete?.(),
      description: "Delete selected",
    },
    {
      key: "Backspace",
      action: () => actions.delete?.(),
      description: "Delete selected",
    },
    // Select All: Ctrl/Cmd + A
    {
      key: "a",
      ctrl: true,
      action: () => actions.selectAll?.(),
      description: "Select all",
    },
    // Copy: Ctrl/Cmd + C
    {
      key: "c",
      ctrl: true,
      action: () => actions.copy?.(),
      description: "Copy",
    },
    // Paste: Ctrl/Cmd + V
    {
      key: "v",
      ctrl: true,
      action: () => actions.paste?.(),
      description: "Paste",
    },
    // Zoom In: Ctrl/Cmd + =
    {
      key: "=",
      ctrl: true,
      action: () => actions.zoomIn?.(),
      description: "Zoom in",
    },
    // Zoom Out: Ctrl/Cmd + -
    {
      key: "-",
      ctrl: true,
      action: () => actions.zoomOut?.(),
      description: "Zoom out",
    },
    // Fit View: Ctrl/Cmd + 0
    {
      key: "0",
      ctrl: true,
      action: () => actions.fitView?.(),
      description: "Fit view",
    },
    // Save: Ctrl/Cmd + S
    {
      key: "s",
      ctrl: true,
      action: () => actions.save?.(),
      description: "Save",
    },
    // Export: Ctrl/Cmd + E
    {
      key: "e",
      ctrl: true,
      action: () => actions.export?.(),
      description: "Export",
    },
  ];

  // Enable shortcuts only when canvas is focused (not in input fields)
  useKeyboardShortcuts(shortcuts, { requireCanvasFocus: true });

  // Return shortcut list for help display
  return shortcuts.filter((s) => s.description);
}

/**
 * Format keyboard shortcut for display
 */
export function formatShortcut(shortcut: KeyboardShortcut): string {
  const parts: string[] = [];

  if (shortcut.ctrl) {
    parts.push("⌘");
  }
  if (shortcut.shift) {
    parts.push("⇧");
  }
  if (shortcut.alt) {
    parts.push("⌥");
  }

  // Format key
  const key = shortcut.key.toUpperCase();
  parts.push(key === " " ? "Space" : key);

  return parts.join(" + ");
}

/**
 * Get all shortcuts for display in help modal
 */
export function getShortcutsForDisplay(
  shortcuts: KeyboardShortcut[],
): Array<{ keys: string; description: string }> {
  return shortcuts
    .filter((s) => s.description)
    .map((s) => ({
      keys: formatShortcut(s),
      description: s.description || "",
    }));
}
