import { useEffect, useMemo, useState } from "react";
import { X, Save, TrendingUp, TrendingDown } from "lucide-react";
import { useStore } from "../store/useStore";
import { medicinesApi, stockMovementsApi, servicesApi } from "../lib/api";
import type { Medicine, Service } from "../types";
import { useToastStore } from "../store/useToastStore";

interface StockMovementModalProps {
  medicine: Medicine;
  onClose: () => void;
  onSave: () => void;
}

export function StockMovementModal({
  medicine,
  onClose,
  onSave,
}: StockMovementModalProps) {
  const { addStockMovement } = useStore();
  const { addToast } = useToastStore();
  const [movementType, setMovementType] = useState<"entry" | "exit">("exit");
  const [services, setServices] = useState<Service[]>([]);
  const [batches, setBatches] = useState<
    Array<{
      id: string;
      expiration_date: string;
      quantity: number;
      location: string | null;
    }>
  >([]);
  const [isLoadingBatches, setIsLoadingBatches] = useState(false);
  const [formData, setFormData] = useState({
    quantity: "",
    batch_id: "",
    expiration_date: "",
    location: medicine.location || "",
    unit_price: medicine.unit_price ? String(medicine.unit_price) : "",
    service_id: "",
    reference: "",
    notes: "",
  });

  useEffect(() => {
    const loadBatches = async () => {
      try {
        setIsLoadingBatches(true);
        const data = await medicinesApi.getStocks(medicine.id);
        const list = (data || []).map((b: any) => ({
          id: String(b.id),
          expiration_date: String(b.expiration_date),
          quantity: Number(b.quantity),
          location: b.location ?? null,
        }));
        setBatches(list);
        if (!formData.batch_id && list.length > 0) {
          setFormData((f) => ({ ...f, batch_id: list[0].id }));
        }
      } catch (e) {
        setBatches([]);
        console.error("Error loading stock batches:", e);
      } finally {
        setIsLoadingBatches(false);
      }
    };
    loadBatches();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [medicine.id]);

  useEffect(() => {
    const loadServices = async () => {
      try {
        const data = await servicesApi.getAll();
        setServices(Array.isArray(data) ? data : []);
        if (!formData.service_id && Array.isArray(data) && data.length > 0) {
          setFormData((f) => ({ ...f, service_id: data[0].id }));
        }
      } catch (e) {
        setServices([]);
        console.error("Error loading services:", e);
      }
    };
    loadServices();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const selectedBatch = useMemo(() => {
    return batches.find((b) => b.id === formData.batch_id) || null;
  }, [batches, formData.batch_id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const quantity = parseInt(formData.quantity);
    if (quantity <= 0) {
      addToast("La quantité doit être supérieure à 0", "error");
      return;
    }

    if (movementType === "exit") {
      if (!selectedBatch) {
        addToast("Veuillez sélectionner un lot", "error");
        return;
      }
    }

    if (movementType === "entry") {
      if (!formData.expiration_date) {
        addToast("Veuillez sélectionner la date d'expiration", "error");
        return;
      }
      const unitPrice = Number(formData.unit_price);
      if (!unitPrice || unitPrice <= 0) {
        addToast("Veuillez saisir un prix valide", "error");
        return;
      }
    }

    if (movementType === "exit") {
      if (!formData.service_id) {
        addToast("Veuillez sélectionner un service", "error");
        return;
      }
    }

    const movementData = {
      medicine_id: medicine.id,
      type: movementType,
      quantity,
      unit_price:
        movementType === "entry" ? Number(formData.unit_price) : undefined,
      service_id: movementType === "exit" ? formData.service_id : undefined,
      expiration_date:
        movementType === "exit"
          ? selectedBatch!.expiration_date
          : formData.expiration_date,
      location:
        movementType === "exit"
          ? selectedBatch!.location || undefined
          : formData.location || undefined,
      reference: movementType === "entry" ? formData.reference || undefined : undefined,
      notes: formData.notes || undefined,
    };

    try {
      const movement = await stockMovementsApi.create(movementData);
      addStockMovement(movement);
      addToast("Mouvement de stock enregistré", "success");
      onSave();
    } catch (error) {
      addToast("Erreur lors de l'enregistrement du mouvement", "error");
      console.error(error);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 m-0">
      <div className="bg-white rounded-xl shadow-xl max-w-3xl w-full max-h-[90vh] flex flex-col">
        <div className="sticky top-0 z-10 border-b border-gray-200 px-6 py-4 flex items-center justify-between bg-white">
          <h2 className="text-xl font-bold text-gray-900">
            Mouvement de stock
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto">
          <div className="p-6 space-y-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="font-semibold text-gray-900">{medicine.name}</p>
            <p className="text-sm text-gray-600 mt-1">
              Stock actuel:{" "}
              <span className="font-semibold">
                {medicine.current_stock} {medicine.unit}
              </span>
            </p>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              {movementType === "exit"
                ? "Lot (Date d'expiration / Emplacement) *"
                : "Date d'expiration *"}
            </label>
            {movementType === "exit" ? (
              <select
                required
                disabled={isLoadingBatches || batches.length === 0}
                value={formData.batch_id}
                onChange={(e) =>
                  setFormData({ ...formData, batch_id: e.target.value })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {batches.length === 0 ? (
                  <option value="">Aucun lot disponible</option>
                ) : (
                  batches.map((b) => (
                    <option key={b.id} value={b.id}>
                      {new Date(b.expiration_date).toLocaleDateString("fr-FR")}{" "}
                      — {b.location || "N/A"} — {b.quantity}
                    </option>
                  ))
                )}
              </select>
            ) : (
              <input
                type="date"
                required
                value={formData.expiration_date}
                onChange={(e) =>
                  setFormData({ ...formData, expiration_date: e.target.value })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            )}
          </div>

          {movementType === "entry" && (
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
          )}

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Type de mouvement *
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setMovementType("entry")}
                className={`p-4 rounded-lg border-2 transition-all ${
                  movementType === "entry"
                    ? "border-green-500 bg-green-50 text-green-700"
                    : "border-gray-200 hover:border-gray-300"
                }`}
              >
                <TrendingUp className="w-6 h-6 mx-auto mb-1" />
                <span className="text-sm font-medium">Entrée</span>
              </button>
              <button
                type="button"
                onClick={() => setMovementType("exit")}
                className={`p-4 rounded-lg border-2 transition-all ${
                  movementType === "exit"
                    ? "border-red-500 bg-red-50 text-red-700"
                    : "border-gray-200 hover:border-gray-300"
                }`}
              >
                <TrendingDown className="w-6 h-6 mx-auto mb-1" />
                <span className="text-sm font-medium">Sortie</span>
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Quantité *
            </label>
            <input
              type="number"
              required
              min="1"
              value={formData.quantity}
              onChange={(e) =>
                setFormData({ ...formData, quantity: e.target.value })
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="0"
            />
          </div>

          {movementType === "entry" && (
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Référence
              </label>
              <input
                type="text"
                value={formData.reference}
                onChange={(e) =>
                  setFormData({ ...formData, reference: e.target.value })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="N° facture, bon de commande..."
              />
            </div>
          )}

          {movementType === "entry" && (
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Prix (DH) *
              </label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={formData.unit_price}
                onChange={(e) =>
                  setFormData({ ...formData, unit_price: e.target.value })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="0.00"
              />
            </div>
          )}

          {movementType === "exit" && (
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Service *
              </label>
              <select
                required
                value={formData.service_id}
                onChange={(e) =>
                  setFormData({ ...formData, service_id: e.target.value })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Sélectionner un service</option>
                {services.map((service) => (
                  <option key={service.id} value={service.id}>
                    {service.name}
                    {service.etage ? ` — ${service.etage}` : ""}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Notes
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) =>
                setFormData({ ...formData, notes: e.target.value })
              }
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Informations supplémentaires..."
            />
          </div>

          {formData.quantity && (
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <p className="text-sm text-gray-600">
                Mouvement:{" "}
                <span className="font-semibold text-gray-900">
                  {movementType === "entry" ? "Entrée" : "Sortie"}{" "}
                  {parseInt(formData.quantity)} {medicine.unit}
                </span>
              </p>
            </div>
          )}
          </div>

          <div className="sticky bottom-0 z-10 border-t border-gray-200 bg-white px-6 py-4">
            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Annuler
              </button>
              <button
                type="submit"
                className={`px-6 py-2.5 text-white rounded-lg transition-colors flex items-center gap-2 ${
                  movementType === "entry"
                    ? "bg-green-600 hover:bg-green-700"
                    : "bg-red-600 hover:bg-red-700"
                }`}
              >
                <Save className="w-4 h-4" />
                Enregistrer
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
