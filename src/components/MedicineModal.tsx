import { useState, useEffect } from "react";
import { X, Save, Barcode } from "lucide-react";
import { useStore } from "../store/useStore";
import { medicinesApi } from "../lib/api";
import type { Medicine } from "../types";
import { useToastStore } from "../store/useToastStore";

interface MedicineModalProps {
  medicine?: Medicine;
  onClose: () => void;
  onSave: () => void;
}

export function MedicineModal({
  medicine,
  onClose,
  onSave,
}: MedicineModalProps) {
  const { categories, suppliers, addMedicine, updateMedicine } = useStore();
  const { addToast } = useToastStore();
  const [formData, setFormData] = useState({
    name: "",
    barcode: "",
    category_id: "",
    supplier_id: "",
    description: "",
    unit: "piece",
    min_stock_level: "10",
    batch_number: "",
    location: "",
  });

  useEffect(() => {
    if (medicine) {
      setFormData({
        name: medicine.name,
        barcode: medicine.barcode || "",
        category_id: medicine.category_id || "",
        supplier_id: medicine.supplier_id || "",
        description: medicine.description || "",
        unit: medicine.unit,
        min_stock_level: medicine.min_stock_level.toString(),
        batch_number: medicine.batch_number || "",
        location: medicine.location || "",
      });
    }
  }, [medicine]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Client-side validation
    if (!formData.category_id) {
      addToast("Veuillez sélectionner une catégorie.", "error");
      return;
    }

    const minStock = parseInt(formData.min_stock_level);

    if (isNaN(minStock) || minStock < 0) {
      addToast("Le stock minimum doit être un nombre positif.", "error");
      return;
    }

    const data = {
      name: formData.name,
      barcode: formData.barcode || null,
      category_id: formData.category_id || null,
      supplier_id: formData.supplier_id || null,
      description: formData.description || null,
      unit: formData.unit,
      min_stock_level: minStock,
      batch_number: formData.batch_number || null,
      location: formData.location || null,
    };

    try {
      console.log("Submitting medicine data:", data);
      if (medicine) {
        const updatedMedicine = await medicinesApi.update(medicine.id, data);
        updateMedicine(medicine.id, updatedMedicine);
        addToast("Médicament mis à jour", "success");
      } else {
        const newMedicine = await medicinesApi.create(data);
        addMedicine(newMedicine);
        addToast("Médicament créé", "success");
      }
      onSave();
    } catch (error) {
      addToast(
        medicine
          ? "Erreur lors de la mise à jour"
          : "Erreur lors de la création",
        "error",
      );
      console.error(error);
    }
  };

  const handleBarcodeClick = () => {
    const barcode = prompt("Scanner ou saisir le code-barres:");
    if (barcode) {
      setFormData({ ...formData, barcode });
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 "
      style={{ marginTop: 0 }}
    >
      <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900">
            {medicine ? "Modifier le médicament" : "Nouveau médicament"}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Nom du médicament *
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Code-barres
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={formData.barcode}
                  onChange={(e) =>
                    setFormData({ ...formData, barcode: e.target.value })
                  }
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  type="button"
                  onClick={handleBarcodeClick}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  title="Scanner code-barres"
                >
                  <Barcode className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Numéro de lot
              </label>
              <input
                type="text"
                value={formData.batch_number}
                onChange={(e) =>
                  setFormData({ ...formData, batch_number: e.target.value })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Catégorie *
              </label>
              <select
                required
                value={formData.category_id}
                onChange={(e) =>
                  setFormData({ ...formData, category_id: e.target.value })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Sélectionner une catégorie</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Fournisseur
              </label>
              <select
                value={formData.supplier_id}
                onChange={(e) =>
                  setFormData({ ...formData, supplier_id: e.target.value })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Sélectionner un fournisseur</option>
                {suppliers.map((supplier) => (
                  <option key={supplier.id} value={supplier.id}>
                    {supplier.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Unité *
              </label>
              <select
                required
                value={formData.unit}
                onChange={(e) =>
                  setFormData({ ...formData, unit: e.target.value })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="piece">Pièce</option>
                <option value="boite">Boîte</option>
                <option value="flacon">Flacon</option>
                <option value="sachet">Sachet</option>
                <option value="tube">Tube</option>
                <option value="ampoule">Ampoule</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Stock minimum *
              </label>
              <input
                type="number"
                required
                min="0"
                value={formData.min_stock_level}
                onChange={(e) =>
                  setFormData({ ...formData, min_stock_level: e.target.value })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Emplacement
              </label>
              <input
                type="text"
                value={formData.location}
                onChange={(e) =>
                  setFormData({ ...formData, location: e.target.value })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Ex: Étagère A3"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              Enregistrer
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
