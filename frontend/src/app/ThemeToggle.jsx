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

const ThemeToggle = () => {
  const [theme, setTheme] = useState(getInitialTheme);
  const isDark = theme === "dark";

  useEffect(() => {
    document.documentElement.classList.toggle("dark", isDark);
    localStorage.setItem("theme", theme);
  }, [isDark, theme]);

  return (
    <button
      type="button"
      onClick={() => setTheme(isDark ? "light" : "dark")}
      aria-label={`Switch to ${isDark ? "light" : "dark"} theme`}
      className="fixed right-4 top-4 z-[60] flex h-10 w-[4.75rem] items-center rounded-full border border-zinc-300 bg-white p-1 shadow-lg shadow-zinc-950/10 transition hover:border-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:ring-offset-2 focus:ring-offset-white dark:border-white/15 dark:bg-zinc-900 dark:shadow-black/30 dark:focus:ring-offset-zinc-950"
    >
      <span
        className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-semibold transition ${
          isDark
            ? "translate-x-8 bg-cyan-400 text-zinc-950"
            : "translate-x-0 bg-cyan-400 text-white"
        }`}
      >
        {isDark ? <i className="fa-solid fa-moon"></i> : <i className="fa-solid fa-sun"></i>}
      </span>
    </button>
  );
};

export default ThemeToggle;
