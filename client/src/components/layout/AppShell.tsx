import { Link, NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../../features/auth/authContext";
import { Avatar } from "../common/Avatar";
import { ThemeToggle } from "../common/ThemeToggle";

export const AppShell = () => {
  const { logout, user } = useAuth();
  const navigate = useNavigate();
  const navItems =
    user?.role === "EMPLOYEE"
      ? [
          { to: "/dashboard", label: "Dashboard" },
          { to: "/profile", label: "Profile" }
        ]
      : [
          { to: "/dashboard", label: "Dashboard" },
          { to: "/employees", label: "Employees" },
          { to: "/organization", label: "Organization" },
          { to: "/profile", label: "Profile" }
        ];

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  return (
    <div className="page-shell">
      <div className="mx-auto flex min-h-screen w-full max-w-[1700px] flex-col px-4 py-5 md:flex-row md:gap-6 lg:px-6 xl:px-8">
        <aside className="card mb-5 w-full p-6 md:mb-0 md:w-72 md:self-start xl:w-80">
          <div className="flex items-start justify-between gap-3">
            <div>
              <Link to="/dashboard" className="block text-2xl font-bold text-slate-900 dark:text-slate-100">
                EMS Hub
              </Link>
              <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                Secure employee operations dashboard
              </p>
            </div>
            <ThemeToggle compact />
          </div>
          <div className="mt-8 space-y-2">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `block rounded-2xl px-4 py-3 text-sm font-medium transition ${
                    isActive
                      ? "bg-ink text-white"
                      : "text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
                  }`
                }
              >
                {item.label}
              </NavLink>
            ))}
          </div>
          <div className="mt-8 rounded-3xl bg-mist p-4 dark:bg-slate-800">
            <p className="text-xs uppercase tracking-[0.24em] text-slate-500 dark:text-slate-400">Signed in as</p>
            <div className="mt-3 flex items-center gap-3">
              <Avatar name={user?.name ?? "User"} imageUrl={user?.profileImage} size="md" />
              <div>
                <p className="text-lg font-semibold text-slate-900 dark:text-slate-100">{user?.name}</p>
                <p className="text-sm text-slate-500 dark:text-slate-400">{user?.role.replace("_", " ")}</p>
              </div>
            </div>
          </div>
          <button className="button-secondary mt-6 w-full" onClick={handleLogout}>
            Logout
          </button>
        </aside>
        <main className="min-w-0 flex-1">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
