import { create } from 'zustand';

interface GymState {
  currentWorkoutPlan: any | null;
  setCurrentWorkoutPlan: (plan: any) => void;
  isSidebarOpen: boolean;
  toggleSidebar: () => void;
}

export const useStore = create<GymState>((set) => ({
  currentWorkoutPlan: null,
  setCurrentWorkoutPlan: (plan) => set({ currentWorkoutPlan: plan }),
  isSidebarOpen: false,
  toggleSidebar: () => set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),
}));
