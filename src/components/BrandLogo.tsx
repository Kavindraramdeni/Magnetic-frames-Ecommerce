import React from 'react';

interface BrandLogoProps {
  className?: string;
  size?: number;
  color?: string;
  variant?: 'emblem' | 'full';
}

export default function BrandLogo({ 
  className = '', 
  size = 40, 
  color = '#8B0000', 
  variant = 'emblem' 
}: BrandLogoProps) {
  if (variant === 'full') {
    return (
      <div className={`flex flex-col items-center justify-center gap-1 ${className}`}>
        <svg
          width={size}
          height={size}
          viewBox="0 0 100 100"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Stylized Kria Symbol based on reference image */}
          <path
            d="M20 25H80L65 45H40L55 65L35 75L20 25Z"
            fill={color}
          />
          <path
            d="M80 25L65 45L45 45L60 25H80Z"
            fill="white"
            fillOpacity="0.1"
          />
        </svg>
        <div className="flex flex-col items-center">
          <span className="font-serif text-lg font-bold tracking-[0.2em] uppercase leading-none" style={{ color }}>
            KRIA
          </span>
          <div className="flex items-center gap-2 w-full mt-1">
            <div className="h-[1px] flex-grow bg-neutral-300" />
            <span className="font-sans text-[8px] tracking-[0.3em] uppercase text-neutral-500 font-bold">
              TECH
            </span>
            <div className="h-[1px] flex-grow bg-neutral-300" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* The sharp geometric V/S-like emblem from the image */}
      <path
        d="M25 25H75L65 40H35L55 65L40 75L25 25Z"
        fill={color}
      />
      {/* Adding a slight highlight line to mimic the 3D look in the image */}
      <path
        d="M75 25L65 40H45L55 25H75Z"
        fill="white"
        fillOpacity="0.2"
      />
    </svg>
  );
}
