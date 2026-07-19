import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ChangeEvent, useState } from "react";
import { Link } from "react-router-dom";
import { deleteEmployee, getEmployees } from "../api/employeeApi";
import { CustomSelect } from "../components/common/CustomSelect";
import { EmployeeTable } from "../components/tables/EmployeeTable";
import { useAuth } from "../features/auth/authContext";

export const EmployeesPage = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [filters, setFilters] = useState({
    search: "",
    department: "",
    role: "",
    status: "",
    sortBy: "createdAt",
    sortOrder: "desc",
    page: 1,
    limit: 10
  });

  const { data, isLoading } = useQuery({
    queryKey: ["employees", filters],
    queryFn: () => getEmployees(filters)
  });

  const deleteMutation = useMutation({
    mutationFn: deleteEmployee,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["employees"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-stats"] });
    }
  });

  const handleFilterChange =
    (field: keyof typeof filters) => (event: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      setFilters((prev) => ({
        ...prev,
        [field]:
          field === "page" || field === "limit" ? Number(event.target.value) : event.target.value,
        page: field === "page" ? Number(event.target.value) : 1
      }));
    };

  return (
    <div className="space-y-6">
      <section className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.24em] text-slate-500 dark:text-slate-400">Employee Directory</p>
          <h1 className="mt-2 text-3xl font-semibold text-slate-900 dark:text-slate-100">Manage workforce records</h1>
        </div>
        {user?.role !== "EMPLOYEE" ? (
          <Link className="button-primary" to="/employees/new">
            Add employee
          </Link>
        ) : null}
      </section>

      <section className="card grid gap-4 p-6 md:grid-cols-2 xl:grid-cols-6">
        <input
          className="input xl:col-span-2"
          placeholder="Search by name or email"
          value={filters.search}
          onChange={handleFilterChange("search")}
        />
        <input
          className="input"
          placeholder="Department"
          value={filters.department}
          onChange={handleFilterChange("department")}
        />
        <CustomSelect
          value={filters.role}
          onChange={(value) =>
            setFilters((prev) => ({
              ...prev,
              role: value,
              page: 1
            }))
          }
          options={[
            { label: "All roles", value: "" },
            { label: "Super Admin", value: "SUPER_ADMIN" },
            { label: "HR Manager", value: "HR_MANAGER" },
            { label: "Employee", value: "EMPLOYEE" }
          ]}
        />
        <CustomSelect
          value={filters.status}
          onChange={(value) =>
            setFilters((prev) => ({
              ...prev,
              status: value,
              page: 1
            }))
          }
          options={[
            { label: "All status", value: "" },
            { label: "Active", value: "ACTIVE" },
            { label: "Inactive", value: "INACTIVE" }
          ]}
        />
        <CustomSelect
          value={filters.sortBy}
          onChange={(value) =>
            setFilters((prev) => ({
              ...prev,
              sortBy: value as typeof prev.sortBy,
              page: 1
            }))
          }
          options={[
            { label: "Created Date", value: "createdAt" },
            { label: "Joining Date", value: "joiningDate" },
            { label: "Name", value: "name" }
          ]}
        />
      </section>

      {isLoading || !data ? (
        <div className="card p-6">Loading employees...</div>
      ) : (
        <>
          <EmployeeTable
            employees={data.data}
            canDelete={user?.role === "SUPER_ADMIN"}
            currentUserRole={user?.role}
            onDelete={(id) => deleteMutation.mutate(id)}
          />
          <div className="flex items-center justify-between">
            <p className="text-sm text-slate-500">
              Page {data.meta.page} of {data.meta.totalPages || 1}
            </p>
            <div className="flex gap-3">
              <button
                className="button-secondary"
                disabled={filters.page === 1}
                onClick={() =>
                  setFilters((prev) => ({
                    ...prev,
                    page: Math.max(prev.page - 1, 1)
                  }))
                }
              >
                Previous
              </button>
              <button
                className="button-primary"
                disabled={filters.page >= data.meta.totalPages}
                onClick={() =>
                  setFilters((prev) => ({
                    ...prev,
                    page: prev.page + 1
                  }))
                }
              >
                Next
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
