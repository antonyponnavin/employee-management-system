import { Link } from "react-router-dom";

export const UnauthorizedPage = () => {
  return (
    <div className="page-shell flex min-h-screen items-center justify-center px-4">
      <div className="card max-w-lg p-10 text-center">
        <p className="text-sm uppercase tracking-[0.24em] text-slate-500">Access denied</p>
        <h1 className="mt-4 text-3xl font-semibold text-slate-900 dark:text-slate-100">You do not have permission</h1>
        <p className="mt-3 text-sm text-slate-500">
          Your current role does not allow you to view that page.
        </p>
        <Link className="button-primary mt-6" to="/dashboard">
          Back to dashboard
        </Link>
      </div>
    </div>
  );
};
