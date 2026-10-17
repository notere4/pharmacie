import {
  LayoutDashboard,
  Package,
  Users,
  FileText,
  Boxes,
  Settings,
  UserRound,
  X,
} from "lucide-react";
import { NavLink } from "react-router-dom";
import { useAuthStore } from "../store/useAuthStore";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const { hasAnyPermission } = useAuthStore();
  const menuItems = [
    { path: "/dashboard", label: "Tableau de bord", icon: LayoutDashboard },
    {
      path: "/medicines",
      label: "Médicaments",
      icon: Package,
      permissions: ["inventory.view_medicine"],
    },
    {
      path: "/delivery-notes",
      label: "Bons de livraison",
      icon: FileText,
      permissions: ["inventory.view_deliverynote"],
    },
    {
      path: "/invoices",
      label: "Factures",
      icon: FileText,
      permissions: ["inventory.view_invoice"],
    },
    {
      path: "/suppliers",
      label: "Fournisseurs",
      icon: Users,
      permissions: ["inventory.view_supplier"],
    },
    {
      path: "/reports",
      label: "Rapports",
      icon: FileText,
      permissions: ["inventory.view_medicine", "inventory.view_stockmovement"],
    },
    {
      path: "/stock",
      label: "Stock",
      icon: Boxes,
      permissions: ["inventory.view_stockmovement"],
    },
    {
      path: "/users",
      label: "Utilisateurs",
      icon: UserRound,
      permissions: ["auth.view_user", "auth.change_user"],
    },
    {
      path: "/settings",
      label: "Paramètres",
      icon: Settings,
      permissions: ["auth.view_group", "auth.change_group", "auth.change_user"],
    },
  ];

  const handleClick = () => {
    if (window.innerWidth < 1024) {
      onClose();
    }
  };

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`fixed lg:fixed top-0 left-0 h-screen bg-white/95 backdrop-blur-md border-r border-gray-200/50 w-64 z-40 transition-transform duration-300 shadow-lg ${
          isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        <div className="flex items-center justify-between p-4 border-b border-gray-200 lg:hidden">
          <h2 className="font-bold text-gray-900">Menu</h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <nav className="p-4 pt-20 space-y-2">
          {menuItems
            .filter((item) => !item.permissions || hasAnyPermission(item.permissions))
            .map((item) => {
            const Icon = item.icon;

            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={handleClick}
                className={({ isActive }) =>
                  `w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                    isActive
                      ? "bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700 font-semibold shadow-sm border border-blue-100"
                      : "text-gray-700 hover:bg-gray-50/80"
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <Icon
                      className={`w-5 h-5 ${
                        isActive ? "text-blue-700" : "text-gray-500"
                      }`}
                    />
                    <span>{item.label}</span>
                  </>
                )}
              </NavLink>
            );
          })}
        </nav>
      </aside>
    </>
  );
}
