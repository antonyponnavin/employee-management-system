import { FormEvent, useState } from "react";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../features/auth/authContext";
import { ThemeToggle } from "../components/common/ThemeToggle";

export const LoginPage = () => {
  const { isAuthenticated, login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      await login(email, password);
      const redirectTo = location.state?.from?.pathname || "/dashboard";
      navigate(redirectTo, { replace: true });
    } catch (requestError) {
      setError("Unable to sign in. Please check your credentials.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="page-shell flex min-h-screen items-center justify-center px-4 py-8">
      <div className="grid w-full max-w-5xl gap-8 lg:grid-cols-[1.1fr_0.9fr]">
        <section className="hidden rounded-[2rem] bg-ink p-10 text-white shadow-soft lg:block">
          <p className="text-sm uppercase tracking-[0.38em] text-gold">Employee Command Center</p>
          <h1 className="mt-6 max-w-md text-5xl font-semibold leading-tight">
            Manage people, permissions, and reporting lines in one place.
          </h1>
          <p className="mt-6 max-w-lg text-base text-slate-200">
            This dashboard is built for secure operations, fast HR workflows, and clean
            organization visibility.
          </p>
        </section>
        <section className="card p-8 md:p-10">
          <div className="flex justify-end">
            <ThemeToggle compact />
          </div>
          <p className="text-sm uppercase tracking-[0.24em] text-slate-500 dark:text-slate-400">Welcome back</p>
          <h2 className="mt-4 text-3xl font-semibold text-slate-900 dark:text-slate-100">Sign in to EMS</h2>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
            Enter your account email and password to continue.
          </p>
          <form className="mt-8 space-y-4" onSubmit={handleSubmit}>
            <input
              className="input"
              type="email"
              placeholder="Email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
            />
            <input
              className="input"
              type="password"
              placeholder="Password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
            />
            {error ? <p className="text-sm text-rose-600">{error}</p> : null}
            <button className="button-primary w-full" disabled={submitting} type="submit">
              {submitting ? "Signing in..." : "Login"}
            </button>
          </form>
        </section>
      </div>
    </div>
  );
};
