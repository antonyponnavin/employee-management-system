import { useQuery } from "@tanstack/react-query";
import { Link, useParams } from "react-router-dom";
import { getEmployee, getReportees } from "../api/employeeApi";
import { Avatar } from "../components/common/Avatar";
import { useAuth } from "../features/auth/authContext";

export const EmployeeDetailsPage = () => {
  const { user } = useAuth();
  const { id = "" } = useParams();
  const employeeQuery = useQuery({
    queryKey: ["employee", id],
    queryFn: () => getEmployee(id),
    enabled: Boolean(id)
  });
  const reporteesQuery = useQuery({
    queryKey: ["reportees", id],
    queryFn: () => getReportees(id),
    enabled: Boolean(id)
  });

  if (employeeQuery.isLoading || !employeeQuery.data) {
    return <div className="card p-6">Loading employee details...</div>;
  }

  const employee = employeeQuery.data;

  return (
    <div className="space-y-6">
      <section className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-4">
          <Avatar name={employee.name} imageUrl={employee.profileImage} size="xl" />
          <div>
          <p className="text-sm uppercase tracking-[0.24em] text-slate-500">Employee Profile</p>
          <h1 className="mt-2 text-3xl font-semibold text-slate-900 dark:text-slate-100">{employee.name}</h1>
            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
              {employee.designation} in {employee.department}
            </p>
          </div>
        </div>
        {!(user?.role === "HR_MANAGER" && employee.role === "SUPER_ADMIN") ? (
          <Link className="button-primary" to={`/employees/${employee.id}/edit`}>
            Edit employee
          </Link>
        ) : null}
      </section>

      <section className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="card p-6">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Employee ID</p>
              <p className="mt-1 text-lg font-medium text-slate-900 dark:text-slate-100">{employee.employeeId}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Role</p>
              <p className="mt-1 text-lg font-medium text-slate-900 dark:text-slate-100">{employee.role.replace("_", " ")}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Email</p>
              <p className="mt-1 text-lg font-medium text-slate-900 dark:text-slate-100">{employee.email}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Phone</p>
              <p className="mt-1 text-lg font-medium text-slate-900 dark:text-slate-100">{employee.phone}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Department</p>
              <p className="mt-1 text-lg font-medium text-slate-900 dark:text-slate-100">{employee.department}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Designation</p>
              <p className="mt-1 text-lg font-medium text-slate-900 dark:text-slate-100">{employee.designation}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Joining Date</p>
              <p className="mt-1 text-lg font-medium text-slate-900 dark:text-slate-100">
                {new Date(employee.joiningDate).toLocaleDateString()}
              </p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Salary</p>
              <p className="mt-1 text-lg font-medium text-slate-900 dark:text-slate-100">
                {employee.salary.toLocaleString()}
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="card p-6">
            <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Reporting Manager</p>
            {employee.reportingManager ? (
              <div className="mt-3 flex items-center gap-3">
                <Avatar
                  name={employee.reportingManager.name}
                  size="sm"
                />
                <div>
                  <p className="text-lg font-medium text-slate-900 dark:text-slate-100">
                    {employee.reportingManager.name}
                  </p>
                  <p className="text-sm text-slate-500">{employee.reportingManager.employeeId}</p>
                </div>
              </div>
            ) : (
              <p className="mt-2 text-lg font-medium text-slate-900 dark:text-slate-100">
                No manager assigned
              </p>
            )}
          </div>
          <div className="card p-6">
            <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Direct Reports</p>
            <div className="mt-3 space-y-3">
              {reporteesQuery.data?.length ? (
                reporteesQuery.data.map((reportee) => (
                  <div key={reportee.id} className="flex items-center gap-3 rounded-2xl bg-slate-50 px-4 py-3 dark:bg-slate-800">
                    <Avatar name={reportee.name} imageUrl={reportee.profileImage} size="sm" />
                    <div>
                      <p className="font-medium text-slate-900 dark:text-slate-100">{reportee.name}</p>
                      <p className="text-xs text-slate-500">{reportee.designation}</p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-slate-500">No direct reports.</p>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
