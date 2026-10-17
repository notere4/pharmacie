import type { Medicine } from '../types';

export function isLowStock(medicine: Medicine): boolean {
  return medicine.current_stock <= medicine.min_stock_level;
}

export function getLowStockColor(): string {
  return 'bg-yellow-100 text-yellow-800 border-yellow-300';
}
