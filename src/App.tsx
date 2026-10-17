import { useEffect, useState, type ReactNode } from "react";
import {
  createBrowserRouter,
  RouterProvider,
  Navigate,
  Outlet,
} from "react-router-dom";
import { Header } from "./components/Header";
import { Sidebar } from "./components/Sidebar";
import { DashboardPage } from "./pages/DashboardPage";
import { MedicinesPage } from "./pages/MedicinesPage";
import { SuppliersPage } from "./pages/SuppliersPage";
import { ReportsPage } from "./pages/ReportsPage";
import { DeliveryNotesPage } from "./pages/DeliveryNotesPage";
import { InvoicesPage } from "./pages/InvoicesPage";
import { LoginPage } from "./pages/Login";
import { StockPage } from "./pages/StockPage";
import { UsersPage } from "./pages/UsersPage";
import { SettingsPage } from "./pages/SettingsPage";
import { useData } from "./hooks/useData";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { useAuthStore } from "./store/useAuthStore";
import { ToastContainer } from "./components/ToastContainer";

function Layout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  useData();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <Header onMenuClick={() => setIsSidebarOpen(true)} />

      <div className="flex">
        <Sidebar
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
        />

        <main className="flex-1 p-6 lg:p-10 lg:ml-64">
          <div className="max-w-9xl mx-auto space-y-6">
            {/* Child routes render here via Outlet */}
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}

function PrivateRoute() {
  const { isAuthenticated } = useAuthStore();
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  return <Outlet />;
}

function RequirePermission({ permissions, children }: { permissions: string[]; children: ReactNode }) {
  const { hasAnyPermission } = useAuthStore();
  if (!hasAnyPermission(permissions)) {
    return <Navigate to="/dashboard" replace />;
  }
  return <>{children}</>;
}

function RoleIndexRedirect() {
  return <Navigate to="/dashboard" replace />;
}

const router = createBrowserRouter([
  {
    path: "/login",
    element: <LoginPage />,
  },
  {
    path: "/",
    element: <PrivateRoute />,
    children: [
      {
        element: (
          <ErrorBoundary>
            <Layout />
          </ErrorBoundary>
        ),
        children: [
          { index: true, element: <RoleIndexRedirect /> },
          { path: "dashboard", element: <DashboardPage /> },
          {
            path: "medicines",
            element: (
              <RequirePermission permissions={["inventory.view_medicine"]}>
                <MedicinesPage />
              </RequirePermission>
            ),
          },
          {
            path: "stock",
            element: (
              <RequirePermission permissions={["inventory.view_stockmovement"]}>
                <StockPage />
              </RequirePermission>
            ),
          },
          {
            path: "suppliers",
            element: (
              <RequirePermission permissions={["inventory.view_supplier"]}>
                <SuppliersPage />
              </RequirePermission>
            ),
          },
          {
            path: "delivery-notes",
            element: (
              <RequirePermission permissions={["inventory.view_deliverynote"]}>
                <DeliveryNotesPage />
              </RequirePermission>
            ),
          },
          {
            path: "invoices",
            element: (
              <RequirePermission permissions={["inventory.view_invoice"]}>
                <InvoicesPage />
              </RequirePermission>
            ),
          },
          {
            path: "reports",
            element: (
              <RequirePermission permissions={["inventory.view_medicine", "inventory.view_stockmovement"]}>
                <ReportsPage />
              </RequirePermission>
            ),
          },
          {
            path: "users",
            element: (
              <RequirePermission permissions={["auth.view_user", "auth.change_user"]}>
                <UsersPage />
              </RequirePermission>
            ),
          },
          {
            path: "settings",
            element: (
              <RequirePermission permissions={["auth.view_group", "auth.change_group", "auth.change_user"]}>
                <SettingsPage />
              </RequirePermission>
            ),
          },
        ],
      },
    ],
  },
]);

function App() {
  const { initialize } = useAuthStore();

  useEffect(() => {
    initialize();
  }, [initialize]);

  return (
    <>
      <RouterProvider router={router} future={{ v7_startTransition: true }} />
      <ToastContainer />
    </>
  );
}

export default App;
