import { useQuery } from "@tanstack/react-query";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { getDashboardStats } from "../api/dashboardApi";
import { StatCard } from "../components/common/StatCard";
import { useAuth } from "../features/auth/authContext";

export const DashboardPage = () => {
  const { user } = useAuth();
  const { data, isLoading } = useQuery({
    queryKey: ["dashboard-stats"],
    queryFn: getDashboardStats,
    enabled: user?.role !== "EMPLOYEE"
  });

  if (!user) {
    return <div className="card p-6">Loading dashboard...</div>;
  }

  if (user.role === "EMPLOYEE") {
    const joinedOn = new Date(user.joiningDate).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric"
    });

    return (
      <div className="space-y-6">
        <section className="card p-8">
          <p className="text-sm uppercase tracking-[0.28em] text-slate-500 dark:text-slate-400">Overview</p>
          <h1 className="mt-3 text-4xl font-semibold text-slate-900 dark:text-slate-100">Your employee dashboard</h1>
          <p className="mt-3 max-w-2xl text-sm text-slate-500 dark:text-slate-400">
            Review your role, team details, and account status without exposing company-wide analytics.
          </p>
        </section>

        <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          <div className="card p-6">
            <p className="text-sm uppercase tracking-[0.24em] text-slate-500 dark:text-slate-400">Employee ID</p>
            <p className="mt-3 text-2xl font-semibold text-slate-900 dark:text-slate-100">{user.employeeId}</p>
          </div>
          <div className="card p-6">
            <p className="text-sm uppercase tracking-[0.24em] text-slate-500 dark:text-slate-400">Role</p>
            <p className="mt-3 text-2xl font-semibold text-slate-900 dark:text-slate-100">
              {user.role.replace("_", " ")}
            </p>
          </div>
          <div className="card p-6">
            <p className="text-sm uppercase tracking-[0.24em] text-slate-500 dark:text-slate-400">Department</p>
            <p className="mt-3 text-2xl font-semibold text-slate-900 dark:text-slate-100">{user.department}</p>
          </div>
          <div className="card p-6">
            <p className="text-sm uppercase tracking-[0.24em] text-slate-500 dark:text-slate-400">Status</p>
            <p className="mt-3 text-2xl font-semibold text-slate-900 dark:text-slate-100">{user.status}</p>
          </div>
        </section>

        <section className="card grid gap-6 p-6 md:grid-cols-2">
          <div>
            <p className="text-sm uppercase tracking-[0.24em] text-slate-500 dark:text-slate-400">Designation</p>
            <p className="mt-2 text-xl font-semibold text-slate-900 dark:text-slate-100">{user.designation}</p>
          </div>
          <div>
            <p className="text-sm uppercase tracking-[0.24em] text-slate-500 dark:text-slate-400">Reporting Manager</p>
            <p className="mt-2 text-xl font-semibold text-slate-900 dark:text-slate-100">
              {user.reportingManager?.name ?? "Unassigned"}
            </p>
          </div>
          <div>
            <p className="text-sm uppercase tracking-[0.24em] text-slate-500 dark:text-slate-400">Work Email</p>
            <p className="mt-2 text-base text-slate-700 dark:text-slate-200">{user.email}</p>
          </div>
          <div>
            <p className="text-sm uppercase tracking-[0.24em] text-slate-500 dark:text-slate-400">Joined On</p>
            <p className="mt-2 text-base text-slate-700 dark:text-slate-200">{joinedOn}</p>
          </div>
        </section>
      </div>
    );
  }

  if (isLoading || !data) {
    return <div className="card p-6">Loading dashboard...</div>;
  }

  return (
    <div className="space-y-6">
      <section className="card p-8">
        <p className="text-sm uppercase tracking-[0.28em] text-slate-500 dark:text-slate-400">Overview</p>
        <h1 className="mt-3 text-4xl font-semibold text-slate-900 dark:text-slate-100">Employee operations at a glance</h1>
        <p className="mt-3 max-w-2xl text-sm text-slate-500 dark:text-slate-400">
          Track workforce coverage, active headcount, and department distribution from one
          dashboard.
        </p>
      </section>
      <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Total Employees" value={data.totalEmployees} accent="#14213d" />
        <StatCard label="Active" value={data.activeEmployees} accent="#0d5c63" />
        <StatCard label="Inactive" value={data.inactiveEmployees} accent="#fca311" />
        <StatCard label="Departments" value={data.departmentCount} accent="#7c3aed" />
      </section>
      <section className="card p-6">
        <div className="mb-6">
          <p className="text-sm uppercase tracking-[0.24em] text-slate-500 dark:text-slate-400">Department Mix</p>
          <h2 className="mt-2 text-2xl font-semibold text-slate-900 dark:text-slate-100">Employee count by department</h2>
        </div>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data.departments}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(148, 163, 184, 0.35)" />
              <XAxis dataKey="name" tick={{ fill: "#94a3b8" }} axisLine={{ stroke: "rgba(148, 163, 184, 0.35)" }} tickLine={{ stroke: "rgba(148, 163, 184, 0.35)" }} />
              <YAxis tick={{ fill: "#94a3b8" }} axisLine={{ stroke: "rgba(148, 163, 184, 0.35)" }} tickLine={{ stroke: "rgba(148, 163, 184, 0.35)" }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#0f172a",
                  border: "1px solid rgba(148, 163, 184, 0.25)",
                  borderRadius: "16px",
                  color: "#e2e8f0"
                }}
                labelStyle={{ color: "#e2e8f0" }}
              />
              <Bar dataKey="count" fill="#3b82f6" radius={[10, 10, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </section>
    </div>
  );
};
