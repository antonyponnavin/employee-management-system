import { Link } from "react-router-dom";
import { Employee } from "../../types";

type EmployeeTableProps = {
  employees: Employee[];
  canDelete: boolean;
  currentUserRole?: Employee["role"];
  onDelete: (id: string) => void;
};

export const EmployeeTable = ({
  employees,
  canDelete,
  currentUserRole,
  onDelete
}: EmployeeTableProps) => {
  return (
    <div className="card overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full border-collapse">
          <thead className="table-head-row">
            <tr>
              <th className="table-head min-w-[16rem]">Employee</th>
              <th className="table-head min-w-[8rem]">Department</th>
              <th className="table-head min-w-[8rem]">Role</th>
              <th className="table-head min-w-[7rem]">Status</th>
              <th className="table-head min-w-[8rem]">Manager</th>
              <th className="table-head min-w-[11rem]">Actions</th>
            </tr>
          </thead>
          <tbody>
            {employees.map((employee) => (
              <tr key={employee.id} className="border-t border-slate-100 dark:border-slate-800">
                {/** HR managers can view super admins but cannot edit them. */}
                <td className="table-cell">
                  <div className="font-semibold text-slate-900 dark:text-slate-100">
                    {employee.name}
                  </div>
                  <div className="break-all text-xs text-slate-500 dark:text-slate-400">
                    {employee.employeeId} • {employee.email}
                  </div>
                </td>
                <td className="table-cell whitespace-nowrap">{employee.department}</td>
                <td className="table-cell whitespace-nowrap">{employee.role.replace("_", " ")}</td>
                <td className="table-cell">
                  <span
                    className={`inline-flex whitespace-nowrap rounded-full px-3 py-1 text-xs font-semibold ${
                      employee.status === "ACTIVE"
                        ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300"
                        : "bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-300"
                    }`}
                  >
                    {employee.status}
                  </span>
                </td>
                <td className="table-cell whitespace-nowrap">
                  {employee.reportingManager?.name || "Unassigned"}
                </td>
                <td className="table-cell">
                  <div className="flex items-center gap-2 whitespace-nowrap">
                    <Link className="button-secondary whitespace-nowrap" to={`/employees/${employee.id}`}>
                      View
                    </Link>
                    {!(currentUserRole === "HR_MANAGER" && employee.role === "SUPER_ADMIN") ? (
                      <Link className="button-primary whitespace-nowrap" to={`/employees/${employee.id}/edit`}>
                        Edit
                      </Link>
                    ) : null}
                    {canDelete ? (
                      <button
                        className="button-danger whitespace-nowrap"
                        onClick={() => onDelete(employee.id)}
                      >
                        Delete
                      </button>
                    ) : null}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
