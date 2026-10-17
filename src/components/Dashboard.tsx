import { useEffect, useMemo, useState } from "react";
import { Package, AlertTriangle, TrendingDown, DollarSign } from "lucide-react";
import { useStore } from "../store/useStore";
import { isLowStock } from "../utils/alerts";
import type { DashboardStats, MedicineWithDetails } from "../types";
import { medicinesApi } from "../lib/api";

export function Dashboard() {
  const pageMedicines = useStore((state) => state.medicines);
  const [allMedicines, setAllMedicines] = useState<MedicineWithDetails[]>([]);
  const [expiringCount, setExpiringCount] = useState(0);

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
        // fallback to current page data if request fails
        setAllMedicines(pageMedicines);
        console.error("Error loading all medicines for dashboard:", e);
      }
    };
    loadAll();
    // Re-run when page medicines change as a best-effort refresh
  }, [pageMedicines]);

  useEffect(() => {
    const loadExpiring = async () => {
      try {
        const data = await medicinesApi.getExpiringSoon();
        setExpiringCount(Array.isArray(data) ? data.length : 0);
      } catch (e) {
        setExpiringCount(0);
        console.error("Error loading expiring medicines for dashboard:", e);
      }
    };
    loadExpiring();
  }, []);

  const stats = useMemo<DashboardStats>(() => {
    const totalMedicines = allMedicines.length;
    const lowStockCount = allMedicines.filter((m) => isLowStock(m)).length;
    const totalValue = allMedicines.reduce(
      (sum, m) => sum + m.current_stock * (Number(m.unit_price) || 0),
      0,
    );

    return {
      totalMedicines,
      lowStockCount,
      expiringCount,
      totalValue,
    };
  }, [allMedicines, expiringCount]);

  const statCards = [
    {
      title: "Total Médicaments",
      value: stats.totalMedicines,
      icon: Package,
      color: "from-blue-500 to-blue-600",
      textColor: "text-blue-600",
    },
    {
      title: "Stock Bas",
      value: stats.lowStockCount,
      icon: TrendingDown,
      color: "from-yellow-500 to-orange-500",
      textColor: "text-yellow-600",
    },
    {
      title: "Expiration Proche",
      value: stats.expiringCount,
      icon: AlertTriangle,
      color: "from-orange-500 to-red-500",
      textColor: "text-orange-600",
    },
    {
      title: "Valeur Totale",
      value: `${stats.totalValue.toLocaleString("fr-FR")} DH`,
      icon: DollarSign,
      color: "from-green-500 to-emerald-500",
      textColor: "text-green-600",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {statCards.map((stat, index) => (
        <div
          key={index}
          className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border border-gray-200/50 p-6 hover:shadow-xl transition-all duration-300 hover:scale-[1.02]"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">{stat.title}</p>
              <p className={`text-3xl font-bold mt-2 ${stat.textColor}`}>
                {stat.value}
              </p>
            </div>
            <div
              className={`bg-gradient-to-r ${stat.color} p-3 rounded-lg shadow-md`}
            >
              <stat.icon className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
