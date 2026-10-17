import { useState } from "react";
import {
  Edit2,
  Trash2,
  Package,
  MapPin,
  Barcode,
  ChevronDown,
  ChevronRight,
} from "lucide-react";
import { useStore } from "../store/useStore";
import { isLowStock } from "../utils/alerts";
import { MedicineModal } from "./MedicineModal";
import { StockMovementModal } from "./StockMovementModal";
import { medicinesApi } from "../lib/api";
import { useData } from "../hooks/useData";
import { useAuthStore } from "../store/useAuthStore";
import { useToastStore } from "../store/useToastStore";
import { ConfirmDialog } from "./ConfirmDialog";

export function MedicineList() {
  const { medicines, deleteMedicine, page, pageSize, totalCount, setPage } =
    useStore();
  const { loadMedicines, loadStockMovements } = useData();
  const { hasPermission } = useAuthStore();
  const { addToast } = useToastStore();
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);
  const [expandedStocks, setExpandedStocks] = useState<Record<string, boolean>>(
    {},
  );
  const [editingMedicine, setEditingMedicine] = useState<
    (typeof medicines)[0] | null
  >(null);
  const [stockMovementMedicine, setStockMovementMedicine] = useState<
    (typeof medicines)[0] | null
  >(null);

  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));

  const handleDelete = async (id: string) => {
    try {
      await medicinesApi.delete(id);
      deleteMedicine(id);
      addToast("Médicament supprimé", "success");
    } catch (error) {
      addToast("Erreur lors de la suppression", "error");
      console.error(error);
    }
  };

  if (medicines.length === 0) {
    return (
      <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border border-gray-200/50 p-8">
        <div className="text-center text-gray-500">
          <Package className="w-12 h-12 mx-auto mb-3 text-gray-400" />
          <p className="text-lg font-medium">Aucun médicament trouvé</p>
          <p className="text-sm mt-1">
            Essayez de modifier vos filtres de recherche
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border border-gray-200/50 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full table-fixed">
            <thead className="bg-gradient-to-r from-gray-50 to-blue-50 border-b border-gray-200/50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider w-[34%]">
                  Médicament
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider w-[18%]">
                  Catégorie
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider w-[22%]">
                  Stock
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider w-[14%]">
                  Prix
                </th>
                <th className="px-6 py-3 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider w-[12%]">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {medicines.map((medicine) => {
                const lowStock = isLowStock(medicine);

                return (
                  <tr
                    key={medicine.id}
                    className="hover:bg-gradient-to-r hover:from-blue-50/50 hover:to-indigo-50/50 transition-all duration-200"
                  >
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="font-semibold text-gray-900">
                          {medicine.name}
                        </span>
                        {medicine.barcode && (
                          <span className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                            <Barcode className="w-3 h-3" />
                            {medicine.barcode}
                          </span>
                        )}
                        {medicine.location && (
                          <span className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                            <MapPin className="w-3 h-3" />
                            {medicine.location}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-800">
                        {medicine.category?.name || "Non catégorisé"}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span
                          className={`font-semibold ${
                            lowStock ? "text-yellow-600" : "text-gray-900"
                          }`}
                        >
                          {medicine.current_stock} {medicine.unit}
                        </span>
                        {Array.isArray(medicine.stocks) &&
                          medicine.stocks.length > 0 && (
                            <div className="mt-1 max-w-[260px]">
                              <button
                                type="button"
                                onClick={() =>
                                  setExpandedStocks((prev) => ({
                                    ...prev,
                                    [medicine.id]: !prev[medicine.id],
                                  }))
                                }
                                className="inline-flex items-center gap-1 text-xs font-medium text-blue-700 hover:text-blue-800 max-w-full"
                              >
                                {expandedStocks[medicine.id] ? (
                                  <ChevronDown className="w-3 h-3" />
                                ) : (
                                  <ChevronRight className="w-3 h-3" />
                                )}
                                Voir lots ({medicine.stocks.length})
                              </button>

                              {expandedStocks[medicine.id] && (
                                <div className="mt-1 space-y-0.5">
                                  {Object.entries(
                                    medicine.stocks.reduce<
                                      Record<string, number>
                                    >((acc, s) => {
                                      const key = s.expiration_date;
                                      acc[key] =
                                        (acc[key] || 0) +
                                        (Number(s.quantity) || 0);
                                      return acc;
                                    }, {}),
                                  )
                                    .sort(([a], [b]) => a.localeCompare(b))
                                    .map(([date, qty]) => (
                                      <div
                                        key={date}
                                        className="text-xs text-gray-600 break-words"
                                      >
                                        {new Date(date).toLocaleDateString(
                                          "fr-FR",
                                        )}
                                        : {qty}
                                      </div>
                                    ))}
                                </div>
                              )}
                            </div>
                          )}
                        {lowStock && (
                          <span className="text-xs text-yellow-600 font-medium mt-1">
                            ⚠️ Stock bas
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-semibold text-gray-900">
                        {Number.isFinite(Number(medicine.unit_price))
                          ? `${Number(medicine.unit_price).toFixed(2)} DH`
                          : "-"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {hasPermission('inventory.add_stockmovement') && (
                          <button
                            onClick={() => setStockMovementMedicine(medicine)}
                            className="p-2 text-blue-600 hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 rounded-lg transition-all duration-200 shadow-sm hover:shadow-md"
                            title="Mouvement de stock"
                          >
                            <Package className="w-4 h-4" />
                          </button>
                        )}
                        {hasPermission('inventory.change_medicine') && (
                          <button
                            onClick={() => setEditingMedicine(medicine)}
                            className="p-2 text-gray-600 hover:bg-gradient-to-r hover:from-gray-50 hover:to-gray-100 rounded-lg transition-all duration-200 shadow-sm hover:shadow-md"
                            title="Modifier"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                        )}
                        {hasPermission('inventory.delete_medicine') && (
                          <button
                            onClick={() => setDeleteTargetId(medicine.id)}
                            className="p-2 text-red-600 hover:bg-gradient-to-r hover:from-red-50 hover:to-pink-50 rounded-lg transition-all duration-200 shadow-sm hover:shadow-md"
                            title="Supprimer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination controls */}
      <div className="mt-6 flex items-center justify-between text-sm text-gray-600 bg-white/60 backdrop-blur-sm rounded-lg p-4 border border-gray-200/50 shadow-sm">
        <div>
          Page {page} sur {totalPages} • {totalCount} éléments
        </div>
        <div className="flex items-center gap-2">
          <button
            className="px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-lg hover:from-blue-600 hover:to-indigo-600 transition-all duration-200 shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={page <= 1}
            onClick={() => setPage(Math.max(1, page - 1))}
          >
            Précédent
          </button>
          <button
            className="px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-lg hover:from-blue-600 hover:to-indigo-600 transition-all duration-200 shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={page >= totalPages}
            onClick={() => setPage(Math.min(totalPages, page + 1))}
          >
            Suivant
          </button>
        </div>
      </div>

      {editingMedicine && (
        <MedicineModal
          medicine={editingMedicine}
          onClose={() => setEditingMedicine(null)}
          onSave={async () => {
            setEditingMedicine(null);
            await loadMedicines();
          }}
        />
      )}

      {stockMovementMedicine && (
        <StockMovementModal
          medicine={stockMovementMedicine}
          onClose={() => setStockMovementMedicine(null)}
          onSave={async () => {
            setStockMovementMedicine(null);
            await loadMedicines();
            await loadStockMovements();
          }}
        />
      )}

      <ConfirmDialog
        open={Boolean(deleteTargetId)}
        title="Supprimer le médicament"
        message="Cette action est définitive. Voulez-vous continuer ?"
        confirmText="Supprimer"
        onCancel={() => setDeleteTargetId(null)}
        onConfirm={async () => {
          const id = deleteTargetId;
          setDeleteTargetId(null);
          if (id) {
            await handleDelete(id);
          }
        }}
      />
    </>
  );
}
