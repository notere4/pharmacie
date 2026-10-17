import { create } from 'zustand';
import type { Category, Supplier, StockMovement, MedicineWithDetails } from '../types';

interface AppState {
  medicines: MedicineWithDetails[];
  categories: Category[];
  suppliers: Supplier[];
  stockMovements: StockMovement[];
  searchQuery: string;
  selectedCategory: string | null;
  selectedSupplier: string | null;
  page: number;
  pageSize: number;
  totalCount: number;

  setMedicines: (medicines: MedicineWithDetails[]) => void;
  setCategories: (categories: Category[]) => void;
  setSuppliers: (suppliers: Supplier[]) => void;
  setStockMovements: (movements: StockMovement[]) => void;
  setSearchQuery: (query: string) => void;
  setSelectedCategory: (categoryId: string | null) => void;
  setSelectedSupplier: (supplierId: string | null) => void;
  setPage: (page: number) => void;
  setPageSize: (size: number) => void;
  setTotalCount: (count: number) => void;

  addMedicine: (medicine: MedicineWithDetails) => void;
  updateMedicine: (id: string, medicine: Partial<MedicineWithDetails>) => void;
  deleteMedicine: (id: string) => void;

  addCategory: (category: Category) => void;
  updateCategory: (id: string, category: Partial<Category>) => void;
  deleteCategory: (id: string) => void;

  addSupplier: (supplier: Supplier) => void;
  updateSupplier: (id: string, supplier: Partial<Supplier>) => void;
  deleteSupplier: (id: string) => void;

  addStockMovement: (movement: StockMovement) => void;
}

export const useStore = create<AppState>((set) => ({
  medicines: [],
  categories: [],
  suppliers: [],
  stockMovements: [],
  searchQuery: '',
  selectedCategory: null,
  selectedSupplier: null,
  page: 1,
  pageSize: 25,
  totalCount: 0,

  setMedicines: (medicines) => set({ medicines }),
  setCategories: (categories) => set({ categories }),
  setSuppliers: (suppliers) => set({ suppliers }),
  setStockMovements: (movements) => set({ stockMovements: movements }),
  setSearchQuery: (query) => set({ searchQuery: query }),
  setSelectedCategory: (categoryId) => set({ selectedCategory: categoryId }),
  setSelectedSupplier: (supplierId) => set({ selectedSupplier: supplierId }),
  setPage: (page) => set({ page }),
  setPageSize: (size) => set({ pageSize: size }),
  setTotalCount: (count) => set({ totalCount: count }),

  addMedicine: (medicine) => set((state) => ({
    medicines: [...state.medicines, medicine]
  })),

  updateMedicine: (id, medicine) => set((state) => ({
    medicines: state.medicines.map((m) => m.id === id ? { ...m, ...medicine } : m)
  })),

  deleteMedicine: (id) => set((state) => ({
    medicines: state.medicines.filter((m) => m.id !== id)
  })),

  addCategory: (category) => set((state) => ({
    categories: [...state.categories, category]
  })),

  updateCategory: (id, category) => set((state) => ({
    categories: state.categories.map((c) => c.id === id ? { ...c, ...category } : c)
  })),

  deleteCategory: (id) => set((state) => ({
    categories: state.categories.filter((c) => c.id !== id)
  })),

  addSupplier: (supplier) => set((state) => ({
    suppliers: [...state.suppliers, supplier]
  })),

  updateSupplier: (id, supplier) => set((state) => ({
    suppliers: state.suppliers.map((s) => s.id === id ? { ...s, ...supplier } : s)
  })),

  deleteSupplier: (id) => set((state) => ({
    suppliers: state.suppliers.filter((s) => s.id !== id)
  })),

  addStockMovement: (movement) => set((state) => ({
    stockMovements: [movement, ...state.stockMovements]
  })),
}));
