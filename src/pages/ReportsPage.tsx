import { InventoryReport } from '../components/InventoryReport';

export function ReportsPage() {
  return (
    <>
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Rapports et statistiques</h2>
      </div>
      <InventoryReport />
    </>
  );
}
