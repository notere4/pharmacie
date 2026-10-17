import { useEffect, useMemo, useState } from "react";
import { AlertTriangle, TrendingDown, Calendar } from "lucide-react";
import { useStore } from "../store/useStore";
import { isLowStock, getLowStockColor } from "../utils/alerts";
import { medicinesApi } from "../lib/api";
import type { MedicineWithDetails } from "../types";

export function AlertsList() {
  const pageMedicines = useStore((state) => state.medicines);
  const [allMedicines, setAllMedicines] = useState<MedicineWithDetails[]>([]);
  const [expiringMedicines, setExpiringMedicines] = useState<
    MedicineWithDetails[]
  >([]);

  useEffect(() => {
    const loadAll = async () => {
      try {
        const data = await medicinesApi.getAllUnpaginated();
        const list: MedicineWithDetails[] = (data || []).map((item: any) => ({
          ...item,
          unit_price: Number(item.unit_price) || 0,
          category_id: item.category?.id || null,
          supplier_id: item.supplier?.id || null,
        }));
        setAllMedicines(list);
      } catch (e) {
        setAllMedicines(pageMedicines);
        console.error("Error loading all medicines for alerts:", e);
      }
    };
    loadAll();
  }, [pageMedicines]);

  useEffect(() => {
    const loadExpiring = async () => {
      try {
        const data = await medicinesApi.getExpiringSoon();
        const list: MedicineWithDetails[] = (data || []).map((item: any) => ({
          ...item,
          unit_price: Number(item.unit_price) || 0,
          category_id: item.category?.id || null,
          supplier_id: item.supplier?.id || null,
        }));
        setExpiringMedicines(list);
      } catch (e) {
        setExpiringMedicines([]);
        console.error("Error loading expiring medicines for alerts:", e);
      }
    };
    loadExpiring();
  }, []);

  const alerts = useMemo(() => {
    const allAlerts: Array<{
      id: string;
      type: "expiration" | "stock";
      medicine: MedicineWithDetails;
      message: string;
      color: string;
      priority: number;
    }> = [];

    allMedicines.forEach((medicine) => {
      const lowStock = isLowStock(medicine);

      if (lowStock) {
        allAlerts.push({
          id: `stock-${medicine.id}`,
          type: "stock",
          medicine,
          message: `Stock bas: ${medicine.current_stock} ${medicine.unit}`,
          color: getLowStockColor(),
          priority: 1,
        });
      }
    });

    expiringMedicines.forEach((medicine) => {
      allAlerts.push({
        id: `exp-${medicine.id}`,
        type: "expiration",
        medicine,
        message: "Expiration proche (voir lots)",
        color: "bg-orange-100 text-orange-800 border-orange-300",
        priority: 2,
      });
    });

    return allAlerts.sort((a, b) => b.priority - a.priority);
  }, [allMedicines, expiringMedicines]);

  if (alerts.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
        <div className="text-center text-gray-500">
          <AlertTriangle className="w-12 h-12 mx-auto mb-3 text-gray-400" />
          <p className="text-lg font-medium">Aucune alerte</p>
          <p className="text-sm mt-1">Tous les stocks sont au niveau optimal</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200">
      <div className="p-6 border-b border-gray-200">
        <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
          <AlertTriangle className="w-6 h-6 text-orange-500" />
          Alertes Actives
          <span className="ml-auto text-sm font-normal text-gray-500">
            {alerts.length} alerte{alerts.length > 1 ? "s" : ""}
          </span>
        </h2>
      </div>
      <div className="divide-y divide-gray-200 max-h-96 overflow-y-auto">
        {alerts.map((alert) => (
          <div
            key={alert.id}
            className={`p-4 ${alert.color} border-l-4 hover:opacity-90 transition-opacity`}
          >
            <div className="flex items-start gap-3">
              <div className="mt-0.5">
                {alert.type === "expiration" ? (
                  <Calendar className="w-5 h-5" />
                ) : (
                  <TrendingDown className="w-5 h-5" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold truncate">{alert.medicine.name}</p>
                <p className="text-sm mt-0.5">{alert.message}</p>
                {alert.medicine.location && (
                  <p className="text-xs mt-1 opacity-75">
                    Emplacement: {alert.medicine.location}
                  </p>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
