import { useEffect, useState } from "react";

const getInitialTheme = () => {
  const savedTheme = localStorage.getItem("theme");

  if (savedTheme === "dark" || savedTheme === "light") {
    return savedTheme;
  }

  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
};

const ThemeToggle = ({ inline = false }) => {
  const [theme, setTheme] = useState(getInitialTheme);
  const isDark = theme === "dark";

  useEffect(() => {
    document.documentElement.classList.toggle("dark", isDark);
    localStorage.setItem("theme", theme);
  }, [isDark, theme]);

  const toggleTheme = () => setTheme(isDark ? "light" : "dark");

  if (inline) {
    return (
      <button
        type="button"
        onClick={toggleTheme}
        aria-label={`Switch to ${isDark ? "light" : "dark"} theme`}
        className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-100/70 px-3 py-1.5 text-xs font-medium text-slate-700 transition hover:bg-slate-200 dark:border-slate-800 dark:bg-slate-900/80 dark:text-slate-300 dark:hover:bg-slate-800"
      >
        {isDark ? (
          <>
            <i className="fa-solid fa-moon text-indigo-400"></i>
            <span>Dark Mode</span>
          </>
        ) : (
          <>
            <i className="fa-solid fa-sun text-amber-500"></i>
            <span>Light Mode</span>
          </>
        )}
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={`Switch to ${isDark ? "light" : "dark"} theme`}
      className="fixed right-4 top-4 z-[60] flex h-9 w-[4.2rem] items-center rounded-full border border-slate-200 bg-white p-1 shadow-sm transition hover:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:border-slate-800 dark:bg-slate-900 dark:shadow-black/20"
    >
      <span
        className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-semibold transition-transform duration-200 ${
          isDark
            ? "translate-x-7 bg-indigo-500 text-white"
            : "translate-x-0 bg-slate-100 text-slate-700"
        }`}
      >
        {isDark ? (
          <i className="fa-solid fa-moon text-[11px]"></i>
        ) : (
          <i className="fa-solid fa-sun text-amber-500 text-[11px]"></i>
        )}
      </span>
    </button>
  );
};

export default ThemeToggle;
