import { Settings } from 'lucide-react';

export function SettingsPage() {
  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border border-gray-200/50 p-6">
      <div className="flex items-center gap-2">
        <Settings className="w-6 h-6 text-blue-600" />
        <h2 className="text-2xl font-bold text-gray-900">Paramètres</h2>
      </div>
      <p className="text-sm text-gray-600 mt-2">
        Les paramètres seront disponibles prochainement.
      </p>
    </div>
  );
}
