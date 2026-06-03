import { create } from 'zustand';

// === BƯỚC 1: DATA STATE MỞ RỘNG ===

export type ItemType = 'stage' | 'table_round' | 'table_rect' | 'flower' | 'spotlight' | 'disco_light' | 'curtain' | 'flower_arch';

export interface StageItem {
  id: string;
  type: ItemType;
  x: number;
  y: number;
  rotation: number; // degrees
  scale: number;
}

export type ViewMode = '2d' | '3d';

interface StageBuilderState {
  items: StageItem[];
  selectedItemId: string | null;
  viewMode: ViewMode;

  // Actions
  addItem: (item: StageItem) => void;
  updateItem: (id: string, updates: Partial<StageItem>) => void;
  removeItem: (id: string) => void;
  selectItem: (id: string | null) => void;
  setViewMode: (mode: ViewMode) => void;
  clearAll: () => void;
}

let _counter = 0;
export const generateId = (type: ItemType): string => {
  _counter += 1;
  return `${type}_${Date.now()}_${_counter}`;
};

export const useStageBuilderStore = create<StageBuilderState>()((set) => ({
  items: [],
  selectedItemId: null,
  viewMode: '2d',

  addItem: (item) =>
    set((state) => ({ items: [...state.items, item] })),

  updateItem: (id, updates) =>
    set((state) => ({
      items: state.items.map((item) =>
        item.id === id ? { ...item, ...updates } : item
      ),
    })),

  removeItem: (id) =>
    set((state) => ({
      items: state.items.filter((item) => item.id !== id),
      selectedItemId: state.selectedItemId === id ? null : state.selectedItemId,
    })),

  selectItem: (id) => set({ selectedItemId: id }),

  setViewMode: (mode) => set({ viewMode: mode }),

  clearAll: () => set({ items: [], selectedItemId: null }),
}));
