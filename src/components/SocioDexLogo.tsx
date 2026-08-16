import React from "react";

interface SocioDexLogoProps {
  className?: string;
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  variant?: "default" | "dark" | "light" | "transparent";
}

export function SocioDexLogo({
  className = "",
  size = "md",
  variant = "default",
}: SocioDexLogoProps) {
  // Height sizing for exact logo rendering
  const heightClasses = {
    xs: "h-6 sm:h-7",
    sm: "h-8 sm:h-9",
    md: "h-10 sm:h-12",
    lg: "h-14 sm:h-16",
    xl: "h-20 sm:h-24",
  };

  const isLightVariant = variant === "dark" || variant === "light";
  const logoSrc = isLightVariant ? "/sociodex-logo-light.png" : "/sociodex-logo-dark.png";

  return (
    <div className={`inline-flex items-center justify-center select-none bg-transparent ${className}`}>
      <img
        src={logoSrc}
        alt="SocioDex"
        className={`${heightClasses[size]} w-auto object-contain transition-transform`}
      />
    </div>
  );
}

export { SocioDexIcon } from "./SocioDexIcon";
