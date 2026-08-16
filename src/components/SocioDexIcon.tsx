import React from "react";

interface SocioDexIconProps {
  className?: string;
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  color?: string;
  withBg?: boolean;
}

export function SocioDexIcon({
  className = "",
  size = "md",
  color = "#241621",
  withBg = false,
}: SocioDexIconProps) {
  const sizeMap = {
    xs: "w-5 h-5",
    sm: "w-7 h-7",
    md: "w-9 h-9",
    lg: "w-12 h-12",
    xl: "w-16 h-16",
  };

  return (
    <div
      className={`inline-flex items-center justify-center shrink-0 select-none ${
        withBg
          ? "rounded-xl bg-white border border-[#241621]/10 p-1 shadow-xs"
          : ""
      } ${className}`}
    >
      <svg
        viewBox="0 0 120 120"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={`${sizeMap[size]} w-auto object-contain`}
      >
        <text
          x="60"
          y="66"
          textAnchor="middle"
          fill={color}
          style={{
            fontFamily: "'Baloo 2', system-ui, -apple-system, sans-serif",
            fontWeight: 800,
            fontSize: "64px",
            letterSpacing: "2px",
          }}
        >
          SD
        </text>
        <path
          d="M 22 76 C 36 102, 84 102, 98 76"
          stroke={color}
          strokeWidth="8.5"
          strokeLinecap="round"
          fill="none"
        />
      </svg>
    </div>
  );
}
