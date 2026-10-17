import { Dashboard } from "../components/Dashboard";
import { AlertsList } from "../components/AlertsList";

export function DashboardPage() {
  return (
    <>
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Tableau de bord</h2>
      </div>
      <Dashboard />
      <AlertsList />
    </>
  );
}
