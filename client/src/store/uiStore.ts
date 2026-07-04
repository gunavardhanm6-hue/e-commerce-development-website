// ============================================================
// UI STORE — Zustand store for UI state management
// Controls sidebar visibility, modals, toasts, and loading overlays
// ============================================================

import { create } from "zustand";

/**
 * UIState — Shape of the UI store
 */
interface UIState {
  // ---- Sidebar ----
  isSidebarOpen: boolean;
  toggleSidebar: () => void;
  openSidebar: () => void;
  closeSidebar: () => void;

  // ---- Modal ----
  isModalOpen: boolean;
  modalContent: string | null;
  openModal: (content: string) => void;
  closeModal: () => void;

  // ---- Global Loading ----
  isGlobalLoading: boolean;
  setGlobalLoading: (loading: boolean) => void;

  // ---- Toast Notifications ----
  toast: { message: string; type: "success" | "error" | "info" | "warning" } | null;
  showToast: (message: string, type?: "success" | "error" | "info" | "warning") => void;
  clearToast: () => void;
}

/**
 * useUIStore — Zustand store for managing global UI state.
 *
 * Usage:
 *   const { isSidebarOpen, toggleSidebar } = useUIStore();
 *   const showToast = useUIStore((state) => state.showToast);
 */
export const useUIStore = create<UIState>((set) => ({
  // ---- Sidebar ----
  isSidebarOpen: false,
  toggleSidebar: () => set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),
  openSidebar: () => set({ isSidebarOpen: true }),
  closeSidebar: () => set({ isSidebarOpen: false }),

  // ---- Modal ----
  isModalOpen: false,
  modalContent: null,
  openModal: (content) => set({ isModalOpen: true, modalContent: content }),
  closeModal: () => set({ isModalOpen: false, modalContent: null }),

  // ---- Global Loading ----
  isGlobalLoading: false,
  setGlobalLoading: (loading) => set({ isGlobalLoading: loading }),

  // ---- Toast Notifications ----
  toast: null,
  showToast: (message, type = "info") => set({ toast: { message, type } }),
  clearToast: () => set({ toast: null }),
}));
