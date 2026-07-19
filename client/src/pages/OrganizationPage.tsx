import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { getEmployees } from "../api/employeeApi";
import { getOrganizationTree, updateManager } from "../api/organizationApi";
import { CustomSelect } from "../components/common/CustomSelect";
import { OrgChart } from "../components/common/OrgChart";
import { useAuth } from "../features/auth/authContext";
import { Role } from "../types";

const allowedManagerRolesByEmployeeRole: Record<Role, Role[]> = {
  SUPER_ADMIN: ["SUPER_ADMIN"],
  HR_MANAGER: ["SUPER_ADMIN"],
  EMPLOYEE: ["SUPER_ADMIN", "HR_MANAGER"]
};

export const OrganizationPage = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [employeeId, setEmployeeId] = useState("");
  const [managerId, setManagerId] = useState("");

  const treeQuery = useQuery({
    queryKey: ["organization-tree"],
    queryFn: getOrganizationTree
  });

  const employeesQuery = useQuery({
    queryKey: ["all-employees-lite"],
    queryFn: () => getEmployees({ page: 1, limit: 100, sortBy: "name", sortOrder: "asc" })
  });

  const updateManagerMutation = useMutation({
    mutationFn: () => updateManager(employeeId, managerId || null),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["organization-tree"] });
      await queryClient.invalidateQueries({ queryKey: ["employees"] });
      setEmployeeId("");
      setManagerId("");
    }
  });

  const selectedEmployee = employeesQuery.data?.data.find((employee) => employee.id === employeeId);
  const editableEmployees =
    employeesQuery.data?.data.filter((employee) =>
      user?.role === "HR_MANAGER" ? employee.role !== "SUPER_ADMIN" : true
    ) ?? [];

  const managerOptions =
    employeesQuery.data?.data.filter((employee) => {
      if (employee.id === employeeId || !selectedEmployee) {
        return false;
      }

      return allowedManagerRolesByEmployeeRole[selectedEmployee.role].includes(employee.role);
    }) ?? [];

  return (
    <div className="space-y-6">
      <section>
        <p className="text-sm uppercase tracking-[0.24em] text-slate-500">Organization Map</p>
        <h1 className="mt-2 text-3xl font-semibold text-slate-900 dark:text-slate-100">Reporting hierarchy</h1>
      </section>

      {user?.role !== "EMPLOYEE" ? (
        <section className="card grid gap-4 p-6 md:grid-cols-[1fr_1fr_auto]">
          <CustomSelect
            value={employeeId}
            onChange={setEmployeeId}
            options={[
              { label: "Choose employee", value: "" },
              ...editableEmployees.map((employee) => ({
                label: `${employee.name} (${employee.employeeId})`,
                value: employee.id
              }))
            ]}
          />
          <CustomSelect
            value={managerId}
            onChange={setManagerId}
            options={[
              { label: "No manager", value: "" },
              ...managerOptions.map((employee) => ({
                label: `${employee.name} (${employee.employeeId}) - ${employee.role.replace("_", " ")}`,
                value: employee.id
              }))
            ]}
          />
          <button
            className="button-primary"
            disabled={!employeeId || updateManagerMutation.isPending}
            onClick={() => updateManagerMutation.mutate()}
          >
            {updateManagerMutation.isPending ? "Updating..." : "Assign manager"}
          </button>
        </section>
      ) : null}

      {treeQuery.isLoading || !treeQuery.data ? (
        <div className="card p-6">Loading organization tree...</div>
      ) : (
        <OrgChart nodes={treeQuery.data} />
      )}
    </div>
  );
};
