import { create } from 'zustand';

export type ViewMode = 'fullstack';
export type NodeStatus = 'active' | 'killed';
export type EdgeStatus = 'active' | 'blocked' | 'rerouted';

interface SimulationState {
    viewMode: ViewMode;
    chaosMode: boolean;

    // Map of node ID to status
    nodeStatus: Record<string, NodeStatus>;

    // Actions
    setViewMode: (mode: ViewMode) => void;
    setChaosMode: (enabled: boolean) => void;
    toggleNodeStatus: (nodeId: string) => void;
    resetSimulation: () => void;
}

export const useSimulationStore = create<SimulationState>((set) => ({
    viewMode: 'fullstack', // Default to fullstack (concept) view
    chaosMode: false,
    nodeStatus: {},

    setViewMode: (mode) => set({ viewMode: mode }),
    setChaosMode: (enabled) => set({ chaosMode: enabled }),

    toggleNodeStatus: (nodeId) => set((state) => {
        const currentStatus = state.nodeStatus[nodeId] || 'active';
        const newStatus = currentStatus === 'active' ? 'killed' : 'active';
        return {
            nodeStatus: {
                ...state.nodeStatus,
                [nodeId]: newStatus
            }
        };
    }),

    resetSimulation: () => set({
        chaosMode: false,
        nodeStatus: {}
    }),
}));
