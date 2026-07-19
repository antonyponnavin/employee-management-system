import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { createEmployee, getEmployee, getEmployees, updateEmployee } from "../api/employeeApi";
import { EmployeeForm } from "../components/forms/EmployeeForm";
import { useAuth } from "../features/auth/authContext";

type ApiIssue = {
  message?: string;
  path?: string[];
};

export const EmployeeFormPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const isEdit = Boolean(id);

  const employeeQuery = useQuery({
    queryKey: ["employee", id],
    queryFn: () => getEmployee(id!),
    enabled: isEdit
  });

  const managersQuery = useQuery({
    queryKey: ["employee-managers"],
    queryFn: () => getEmployees({ limit: 100, page: 1, sortBy: "name", sortOrder: "asc" })
  });

  const mutation = useMutation({
    mutationFn: async (payload: Record<string, unknown>) => {
      if (isEdit && id) {
        return updateEmployee(id, payload);
      }
      return createEmployee(payload);
    },
    onSuccess: async (employee) => {
      await queryClient.invalidateQueries({ queryKey: ["employees"] });
      await queryClient.invalidateQueries({ queryKey: ["dashboard-stats"] });
      navigate(`/employees/${employee.id}`);
    }
  });

  const managers = useMemo(() => managersQuery.data?.data ?? [], [managersQuery.data]);

  const mutationFieldErrors = useMemo(() => {
    if (!axios.isAxiosError(mutation.error)) {
      return {};
    }

    const issues = mutation.error.response?.data?.issues as ApiIssue[] | undefined;
    if (!issues?.length) {
      return {};
    }

    return issues.reduce<Record<string, string>>((accumulator, issue) => {
      const field = issue.path?.[0];
      if (field && issue.message && !accumulator[field]) {
        accumulator[field] = issue.message;
      }
      return accumulator;
    }, {});
  }, [mutation.error]);

  const mutationErrorMessage = useMemo(() => {
    if (!mutation.error) {
      return "";
    }

    if (axios.isAxiosError(mutation.error)) {
      const issues = mutation.error.response?.data?.issues as ApiIssue[] | undefined;

      if (issues?.length) {
        return issues
          .map((issue) =>
            issue.path?.length ? `${issue.path.join(".")}: ${issue.message}` : issue.message
          )
          .filter(Boolean)
          .join(", ");
      }

      return mutation.error.response?.data?.message || "Unable to save employee";
    }

    return "Unable to save employee";
  }, [mutation.error]);

  if (isEdit && employeeQuery.isLoading) {
    return <div className="card p-6">Loading employee...</div>;
  }

  if (isEdit && user?.role === "HR_MANAGER" && employeeQuery.data?.role === "SUPER_ADMIN") {
    return (
      <div className="space-y-6">
        <section>
          <p className="text-sm uppercase tracking-[0.24em] text-slate-500">Edit Employee</p>
          <h1 className="mt-2 text-3xl font-semibold text-slate-900 dark:text-slate-100">
            Update employee record
          </h1>
        </section>
        <div className="card p-6">
          <p className="text-lg font-semibold text-slate-900 dark:text-slate-100">
            HR managers cannot update super admin details.
          </p>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
            You can view the profile, but only a super admin can edit this record.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <section>
        <p className="text-sm uppercase tracking-[0.24em] text-slate-500">
          {isEdit ? "Edit Employee" : "New Employee"}
        </p>
        <h1 className="mt-2 text-3xl font-semibold text-slate-900 dark:text-slate-100">
          {isEdit ? "Update employee record" : "Create a new employee"}
        </h1>
      </section>
      <EmployeeForm
        mode={isEdit ? "edit" : "create"}
        employee={employeeQuery.data}
        managers={managers}
        currentRole={user?.role ?? "EMPLOYEE"}
        onSubmit={(payload) => mutation.mutateAsync(payload)}
        submitting={mutation.isPending}
        errorMessage={mutationErrorMessage}
        serverFieldErrors={mutationFieldErrors}
      />
    </div>
  );
};
