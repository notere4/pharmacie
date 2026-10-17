import { useEffect, useCallback } from 'react';
import { categoriesApi, suppliersApi, medicinesApi, stockMovementsApi } from '../lib/api';
import { useStore } from '../store/useStore';
import type { MedicineWithDetails } from '../types';

export function useData() {
  const {
    setMedicines,
    setCategories,
    setSuppliers,
    setStockMovements,
    setTotalCount,
    searchQuery,
    selectedCategory,
    selectedSupplier,
    page,
    pageSize,
  } = useStore();

  const loadCategories = useCallback(async () => {
    try {
      const data = await categoriesApi.getAll();
      const list = Array.isArray(data) ? data : (data as any)?.results ?? [];
      setCategories(list || []);
    } catch (error) {
      console.error('Error loading categories:', error);
    }
  }, [setCategories]);

  const loadSuppliers = useCallback(async () => {
    try {
      const data = await suppliersApi.getAll();
      const list = Array.isArray(data) ? data : (data as any)?.results ?? [];
      setSuppliers(list || []);
    } catch (error) {
      console.error('Error loading suppliers:', error);
    }
  }, [setSuppliers]);

  const loadMedicines = useCallback(async () => {
    try {
      const response = await medicinesApi.getAll({
        search: searchQuery || undefined,
        category_id: selectedCategory || undefined,
        supplier_id: selectedSupplier || undefined,
        page,
        page_size: pageSize,
      });
      const medicines: MedicineWithDetails[] = (response?.results || []).map((item: any) => ({
        ...item,
        unit_price: Number(item.unit_price) || 0,
        category_id: item.category?.id || null,
        supplier_id: item.supplier?.id || null,
      }));
      setMedicines(medicines);
      setTotalCount(response?.count || 0);
    } catch (error) {
      console.error('Error loading medicines:', error);
    }
  }, [setMedicines, setTotalCount, searchQuery, selectedCategory, selectedSupplier, page, pageSize]);

  const loadStockMovements = useCallback(async () => {
    try {
      const data = await stockMovementsApi.getAll();
      const list = Array.isArray(data) ? data : (data as any)?.results ?? [];
      setStockMovements(list || []);
    } catch (error) {
      console.error('Error loading stock movements:', error);
    }
  }, [setStockMovements]);

  const loadAllData = useCallback(async () => {
    await Promise.all([
      loadCategories(),
      loadSuppliers(),
      loadStockMovements()
    ]);
  }, [loadCategories, loadSuppliers, loadStockMovements]);

  useEffect(() => {
    loadAllData();
  }, [loadAllData]);

  // Auto-refresh medicines when pagination/search/filter changes
  useEffect(() => {
    loadMedicines();
  }, [loadMedicines]);

  return {
    loadAllData,
    loadMedicines,
    loadCategories,
    loadSuppliers,
    loadStockMovements
  };
}
