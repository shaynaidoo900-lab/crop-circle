import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Field, FieldScan, Profile } from '@/types/database';

interface AuthState {
  user: Profile | null;
  isAuthenticated: boolean;
  setUser: (user: Profile | null) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      setUser: (user) => set({ user, isAuthenticated: !!user }),
      logout: () => set({ user: null, isAuthenticated: false }),
    }),
    { name: 'crop-circle-auth' }
  )
);

interface FieldState {
  selectedField: Field | null;
  fields: Field[];
  scans: FieldScan[];
  setSelectedField: (field: Field | null) => void;
  setFields: (fields: Field[]) => void;
  addField: (field: Field) => void;
  setScans: (scans: FieldScan[]) => void;
  addScan: (scan: FieldScan) => void;
}

export const useFieldStore = create<FieldState>((set) => ({
  selectedField: null,
  fields: [],
  scans: [],
  setSelectedField: (field) => set({ selectedField: field }),
  setFields: (fields) => set({ fields }),
  addField: (field) => set((state) => ({ fields: [...state.fields, field] })),
  setScans: (scans) => set({ scans }),
  addScan: (scan) => set((state) => ({ scans: [...state.scans, scan] })),
}));

interface UIState {
  mapLayer: 'satellite' | 'ndvi' | 'weather' | 'soil';
  sidebarOpen: boolean;
  setMapLayer: (layer: 'satellite' | 'ndvi' | 'weather' | 'soil') => void;
  toggleSidebar: () => void;
}

export const useUIStore = create<UIState>((set) => ({
  mapLayer: 'satellite',
  sidebarOpen: true,
  setMapLayer: (layer) => set({ mapLayer: layer }),
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
}));