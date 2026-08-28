import React from "react";
import ChatNovaLogo from "./ChatNovaLogo";
import ThemeToggle from "../app/ThemeToggle";

const LoadingScreen = ({ message = "Loading your workspace..." }) => {
  return (
    <div className="relative flex min-h-screen w-full flex-col items-center justify-center overflow-hidden bg-slate-50 px-4 py-8 text-slate-900 transition-colors duration-300 dark:bg-[#020617] dark:text-slate-100">
      {/* Background Ambient Glow Orbs */}
      <div className="pointer-events-none absolute -left-20 -top-20 h-72 w-72 rounded-full bg-indigo-500/10 blur-3xl dark:bg-indigo-500/15" />
      <div className="pointer-events-none absolute -bottom-20 -right-20 h-72 w-72 rounded-full bg-violet-500/10 blur-3xl dark:bg-violet-500/15" />

      {/* Top Right Theme Toggle */}
      <div className="absolute right-4 top-4 z-10 md:right-6 md:top-6">
        <ThemeToggle inline={true} />
      </div>

      {/* Glassmorphic Central Card */}
      <div className="auth-page-in relative flex w-full max-w-sm flex-col items-center rounded-3xl border border-slate-200/80 bg-white/80 p-8 text-center shadow-2xl shadow-indigo-500/5 backdrop-blur-xl dark:border-slate-800/80 dark:bg-[#0f172a]/80 dark:shadow-slate-950/50 sm:p-10">
        
        {/* Animated Brand Logo Container */}
        <div className="relative mb-6 flex items-center justify-center">
          {/* Pulsing Backlight Ring */}
          <div className="absolute h-20 w-20 animate-ping rounded-full bg-indigo-500/10 opacity-75 dark:bg-indigo-500/20" />
          
          {/* Outer Spinning Loader Ring */}
          <div className="absolute h-20 w-20 animate-spin rounded-full border-2 border-slate-200 border-t-indigo-600 border-r-indigo-500 dark:border-slate-800 dark:border-t-indigo-400 dark:border-r-indigo-500" />

          {/* Inner Logo Badge */}
          <div className="relative flex h-14 w-14 items-center justify-center rounded-2xl border border-indigo-100 bg-indigo-50/80 p-3 shadow-inner dark:border-indigo-900/40 dark:bg-indigo-950/60">
            <ChatNovaLogo className="h-8 w-8 text-indigo-600 dark:text-indigo-400" />
          </div>
        </div>

        {/* Brand Name */}
        <h2 className="bg-gradient-to-r from-indigo-600 via-indigo-500 to-violet-600 bg-clip-text text-xl font-bold tracking-tight text-transparent dark:from-indigo-400 dark:via-indigo-300 dark:to-violet-400">
          ChatNova
        </h2>

        {/* Loading Message & Dot Pulse */}
        <div className="mt-3 flex items-center justify-center gap-1.5 text-xs font-medium text-slate-500 dark:text-slate-400">
          <span>{message}</span>
          <span className="flex items-center gap-0.5">
            <span className="h-1.5 w-1.5 rounded-full bg-indigo-600 dark:bg-indigo-400 dot-pulse-1" />
            <span className="h-1.5 w-1.5 rounded-full bg-indigo-600 dark:bg-indigo-400 dot-pulse-2" />
            <span className="h-1.5 w-1.5 rounded-full bg-indigo-600 dark:bg-indigo-400 dot-pulse-3" />
          </span>
        </div>

        {/* Indeterminate Loading Progress Bar */}
        <div className="mt-6 h-1 w-full max-w-[180px] overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
          <div className="h-full w-full origin-left animate-pulse rounded-full bg-gradient-to-r from-indigo-600 to-violet-500 dark:from-indigo-400 dark:to-violet-400" />
        </div>
      </div>
    </div>
  );
};

export default LoadingScreen;
