import { X } from 'lucide-react';
import { useToastStore } from '../store/useToastStore';

const toastStyles = {
  success: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  error: 'bg-red-50 text-red-700 border-red-200',
  info: 'bg-blue-50 text-blue-700 border-blue-200',
} as const;

export function ToastContainer() {
  const { toasts, removeToast } = useToastStore();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-[100] space-y-2">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`min-w-[240px] max-w-sm px-4 py-3 rounded-lg border shadow-lg backdrop-blur-sm ${
            toastStyles[toast.type]
          }`}
          role="status"
        >
          <div className="flex items-start justify-between gap-3">
            <div className="text-sm font-medium">{toast.message}</div>
            <button
              onClick={() => removeToast(toast.id)}
              className="text-current hover:opacity-70"
              aria-label="Fermer"
              type="button"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
