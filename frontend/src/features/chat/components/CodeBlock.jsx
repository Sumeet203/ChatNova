import React, { useState } from "react";

export const CodeBlock = ({ language, children }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    if (!children) return;
    const textToCopy = typeof children === "string" ? children : String(children);
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="my-3 max-w-full overflow-hidden rounded-xl border border-slate-700/60 bg-[#0d1117] text-slate-100 shadow-md">
      {/* Header bar */}
      <div className="flex items-center justify-between border-b border-slate-800 bg-[#161b22] px-4 py-2 text-xs font-mono text-slate-400">
        <span className="uppercase tracking-wider font-semibold text-slate-400">
          {language || "code"}
        </span>
        <button
          type="button"
          onClick={handleCopy}
          className="flex items-center gap-1.5 rounded-md bg-slate-800/80 px-2.5 py-1 text-xs text-slate-300 transition hover:bg-slate-700 hover:text-white"
        >
          {copied ? (
            <>
              <i className="fa-solid fa-check text-emerald-400"></i>
              <span className="text-emerald-400 font-medium">Copied</span>
            </>
          ) : (
            <>
              <i className="fa-regular fa-copy"></i>
              <span>Copy code</span>
            </>
          )}
        </button>
      </div>

      {/* Code Area */}
      <pre className="custom-scrollbar max-w-full overflow-x-auto p-4 font-mono text-xs md:text-sm leading-relaxed text-slate-200 whitespace-pre">
        <code>{children}</code>
      </pre>
    </div>
  );
};

export default CodeBlock;
