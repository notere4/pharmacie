import { useState } from 'react';
import { Plus } from 'lucide-react';
import { SearchBar } from '../components/SearchBar';
import { MedicineList } from '../components/MedicineList';
import { MedicineModal } from '../components/MedicineModal';
import { useAuthStore } from '../store/useAuthStore';

export function MedicinesPage() {
  const [isMedicineModalOpen, setIsMedicineModalOpen] = useState(false);
  const { hasPermission } = useAuthStore();

  return (
    <>
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Gestion des médicaments</h2>
        {hasPermission('inventory.add_medicine') && (
          <button
            onClick={() => setIsMedicineModalOpen(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 shadow-sm"
          >
            <Plus className="w-5 h-5" />
            Nouveau médicament
          </button>
        )}
      </div>
      <SearchBar />
      <MedicineList />

      {isMedicineModalOpen && (
        <MedicineModal
          onClose={() => setIsMedicineModalOpen(false)}
          onSave={() => setIsMedicineModalOpen(false)}
        />
      )}
    </>
  );
}
