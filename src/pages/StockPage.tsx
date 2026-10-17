import { useMemo } from 'react';
import { Boxes } from 'lucide-react';
import { useStore } from '../store/useStore';

export function StockPage() {
  const { stockMovements, medicines } = useStore();

  const medicineMap = useMemo(() => {
    return new Map(medicines.map((medicine) => [medicine.id, medicine]));
  }, [medicines]);

  if (stockMovements.length === 0) {
    return (
      <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border border-gray-200/50 p-8">
        <div className="text-center text-gray-500">
          <Boxes className="w-12 h-12 mx-auto mb-3 text-gray-400" />
          <p className="text-lg font-medium">Aucun mouvement de stock</p>
          <p className="text-sm mt-1">Les entrées et sorties apparaîtront ici</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <Boxes className="w-6 h-6 text-blue-600" />
          Stock
        </h2>
      </div>

      <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border border-gray-200/50 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gradient-to-r from-gray-50 to-blue-50 border-b border-gray-200/50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Médicament
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Service
                </th>
                <th className="px-6 py-3 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Quantité
                </th>
                <th className="px-6 py-3 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Prix
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Référence
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Notes
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {stockMovements.map((movement) => {
                const medicine = medicineMap.get(movement.medicine_id);
                const date = new Date(movement.movement_date);
                const isEntry = movement.type === 'entry';

                return (
                  <tr key={movement.id} className="hover:bg-blue-50/40 transition-colors">
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {Number.isNaN(date.getTime())
                        ? movement.movement_date
                        : date.toLocaleString('fr-FR')}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {medicine?.name || movement.medicine_id}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <span
                        className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                          isEntry
                            ? 'bg-emerald-100 text-emerald-700'
                            : 'bg-rose-100 text-rose-700'
                        }`}
                      >
                        {isEntry ? 'Entrée' : 'Sortie'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {movement.service?.name || '-'}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900 text-right">
                      {movement.quantity}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900 text-right">
                      {Number.isFinite(Number(movement.unit_price))
                        ? Number(movement.unit_price).toFixed(2)
                        : '-'}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {movement.reference || '-'}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {movement.notes || '-'}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
