import React from 'react';

export default function GrindsetLogoNodes({ isDark = false, className = "w-44 h-auto" }) {
  const textColor = isDark ? "#f8fafc" : "#091E42";
  const lineColor = isDark ? "#64748b" : "#475569";
  const node1Color = isDark ? "#f8fafc" : "#0052CC";

  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      viewBox="0 0 200 50" 
      className={className}
    >
      {/* Node Connections */}
      <g transform="translate(15, 8)">
        {/* Connecting Lines */}
        <path d="M 0,22 L 12,6 L 28,16" fill="none" stroke={lineColor} strokeWidth="2" strokeLinejoin="round"/>
        {/* Tier 1 Node */}
        <circle cx="0" cy="22" r="4" fill={node1Color} />
        {/* Tier 2 Node */}
        <circle cx="12" cy="6" r="5" fill="#f48fb1" />
        {/* Tier 3 Node */}
        <circle cx="28" cy="16" r="7" fill="#e83e8c" />
      </g>
      
      {/* Typography */}
      <text 
        x="60" 
        y="32" 
        fontFamily="ui-sans-serif, system-ui, sans-serif" 
        fontSize="22" 
        fontWeight="700" 
        fill={textColor} 
        letterSpacing="0.5"
      >
        Grind<tspan fill="#e83e8c">Set</tspan>
      </text>
    </svg>
  );
}
