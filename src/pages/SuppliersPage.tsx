import { SuppliersManager } from '../components/SuppliersManager';

export function SuppliersPage() {
  return (
    <>
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Gestion des fournisseurs</h2>
      </div>
      <SuppliersManager />
    </>
  );
}
