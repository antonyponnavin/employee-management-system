import { createBrowserRouter, Navigate } from "react-router-dom";
import { ProtectedRoute } from "../components/common/ProtectedRoute";
import { AppShell } from "../components/layout/AppShell";
import { DashboardPage } from "../pages/DashboardPage";
import { EmployeeDetailsPage } from "../pages/EmployeeDetailsPage";
import { EmployeeFormPage } from "../pages/EmployeeFormPage";
import { EmployeesPage } from "../pages/EmployeesPage";
import { LoginPage } from "../pages/LoginPage";
import { OrganizationPage } from "../pages/OrganizationPage";
import { ProfilePage } from "../pages/ProfilePage";
import { UnauthorizedPage } from "../pages/UnauthorizedPage";

export const router = createBrowserRouter([
  {
    path: "/login",
    element: <LoginPage />
  },
  {
    path: "/unauthorized",
    element: <UnauthorizedPage />
  },
  {
    element: <ProtectedRoute />,
    children: [
      {
        element: <AppShell />,
        children: [
          {
            path: "/",
            element: <Navigate to="/dashboard" replace />
          },
          {
            path: "/dashboard",
            element: <DashboardPage />
          },
          {
            path: "/employees",
            element: <ProtectedRoute allowedRoles={["SUPER_ADMIN", "HR_MANAGER"]} />,
            children: [{ index: true, element: <EmployeesPage /> }]
          },
          {
            path: "/employees/new",
            element: <ProtectedRoute allowedRoles={["SUPER_ADMIN", "HR_MANAGER"]} />,
            children: [{ index: true, element: <EmployeeFormPage /> }]
          },
          {
            path: "/employees/:id",
            element: <ProtectedRoute allowedRoles={["SUPER_ADMIN", "HR_MANAGER"]} />,
            children: [{ index: true, element: <EmployeeDetailsPage /> }]
          },
          {
            path: "/employees/:id/edit",
            element: <ProtectedRoute allowedRoles={["SUPER_ADMIN", "HR_MANAGER"]} />,
            children: [{ index: true, element: <EmployeeFormPage /> }]
          },
          {
            path: "/organization",
            element: <ProtectedRoute allowedRoles={["SUPER_ADMIN", "HR_MANAGER"]} />,
            children: [{ index: true, element: <OrganizationPage /> }]
          },
          {
            path: "/profile",
            element: <ProfilePage />
          }
        ]
      }
    ]
  }
]);
