import React from "react";

export const ChatNovaLogo = ({ className = "h-8 w-8 text-indigo-600", ...props }) => {
  return (
    <svg
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      {...props}
    >
      {/* Speech Bubble Outer Contour */}
      <path
        d="M 22 12 H 78 C 86.284 12 93 18.716 93 27 V 61 C 93 69.284 86.284 76 78 76 H 32 L 13 93 V 27 C 13 18.716 19.716 12 22 12 Z"
        stroke="currentColor"
        strokeWidth="10"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      
      {/* 3 Vertical Rounded Diamond Nodes inside bubble */}
      {/* Top Node */}
      <path
        d="M 53 23 C 57.5 23 60 27 58 34 L 55.5 42 C 54.5 45 51.5 45 50.5 42 L 48 34 C 46 27 48.5 23 53 23 Z"
        fill="currentColor"
      />
      {/* Bottom Left Node */}
      <path
        d="M 39 41 C 43.5 41 46 45 44 52 L 41.5 60 C 40.5 63 37.5 63 36.5 60 L 34 52 C 32 45 34.5 41 39 41 Z"
        fill="currentColor"
      />
      {/* Bottom Right Node */}
      <path
        d="M 67 41 C 71.5 41 74 45 72 52 L 69.5 60 C 68.5 63 65.5 63 64.5 60 L 62 52 C 60 45 62.5 41 67 41 Z"
        fill="currentColor"
      />
    </svg>
  );
};

export default ChatNovaLogo;
