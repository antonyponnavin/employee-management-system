import { useTheme } from "../../features/theme/themeContext";

const SunIcon = () => (
  <svg aria-hidden="true" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
    <circle cx="12" cy="12" r="4" />
    <path d="M12 2.5v2.5M12 19v2.5M4.9 4.9l1.8 1.8M17.3 17.3l1.8 1.8M2.5 12H5M19 12h2.5M4.9 19.1l1.8-1.8M17.3 6.7l1.8-1.8" />
  </svg>
);

const MoonIcon = () => (
  <svg aria-hidden="true" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
    <path d="M20 14.2A8.5 8.5 0 0 1 9.8 4 8.5 8.5 0 1 0 20 14.2Z" />
  </svg>
);

type ThemeToggleProps = {
  compact?: boolean;
};

export const ThemeToggle = ({ compact = false }: ThemeToggleProps) => {
  const { theme, toggleTheme } = useTheme();
  const isLight = theme === "light";

  return (
    <button
      aria-label={isLight ? "Switch to dark mode" : "Switch to light mode"}
      className={
        compact
          ? "button-ghost h-11 w-11 rounded-full px-0"
          : "button-ghost"
      }
      onClick={toggleTheme}
      type="button"
      title={isLight ? "Switch to dark mode" : "Switch to light mode"}
    >
      <span className="flex items-center justify-center gap-2">
        {isLight ? <MoonIcon /> : <SunIcon />}
        {compact ? null : <span>{isLight ? "Dark mode" : "Light mode"}</span>}
      </span>
    </button>
  );
};
