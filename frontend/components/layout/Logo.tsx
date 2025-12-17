/**
 * VietStay Logo Component - Unique branded logo
 * Features: Custom SVG design combining "V" letter with Vietnamese conical hat element
 */

'use client';

import Link from 'next/link';

interface LogoProps {
  className?: string;
  showText?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export const Logo = ({ className = '', showText = true, size = 'md' }: LogoProps) => {
  const sizes = {
    sm: { icon: 'w-10 h-10', text: 'text-xl', subtitle: 'text-[8px]' },
    md: { icon: 'w-14 h-14', text: 'text-2xl', subtitle: 'text-[10px]' },
    lg: { icon: 'w-20 h-20', text: 'text-4xl', subtitle: 'text-xs' },
  };

  const currentSize = sizes[size];

  return (
    <Link href="/" className={`flex items-center space-x-3 group ${className}`}>
      <div className="relative">
        {/* Glow effect background */}
        <div className="absolute inset-0 bg-[#0071c2] rounded-2xl blur-sm group-hover:blur-lg transition-all duration-500 opacity-60 group-hover:opacity-90"></div>

        {/* Logo container */}
        <div className={`relative ${currentSize.icon} bg-gradient-to-br from-[#0071c2] to-[#005999] rounded-2xl flex items-center justify-center shadow-lg transform group-hover:scale-110 group-hover:rotate-6 transition-all duration-500 ease-out group-hover:shadow-2xl`}>
          {/* Custom SVG Logo - Stylized "V" with Vietnamese conical hat (nón lá) */}
          <svg
            viewBox="0 0 100 100"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="w-full h-full p-2"
          >
            {/* Vietnamese Conical Hat (Nón lá) - Top element */}
            <defs>
              <linearGradient id="hatGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" style={{ stopColor: '#fbbf24', stopOpacity: 1 }} />
                <stop offset="100%" style={{ stopColor: '#f59e0b', stopOpacity: 1 }} />
              </linearGradient>
              <linearGradient id="vGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" style={{ stopColor: '#ffffff', stopOpacity: 1 }} />
                <stop offset="50%" style={{ stopColor: '#e0f2fe', stopOpacity: 1 }} />
                <stop offset="100%" style={{ stopColor: '#bae6fd', stopOpacity: 1 }} />
              </linearGradient>
            </defs>

            {/* Conical Hat shape - subtle curves */}
            <path
              d="M 50 15 Q 30 25, 25 35 L 50 30 L 75 35 Q 70 25, 50 15 Z"
              fill="url(#hatGradient)"
              opacity="0.9"
              className="group-hover:opacity-100 transition-opacity duration-300"
            />

            {/* Hat rim detail */}
            <ellipse
              cx="50"
              cy="34"
              rx="26"
              ry="3"
              fill="#f59e0b"
              opacity="0.6"
            />

            {/* Stylized "V" letter - modern and bold */}
            <path
              d="M 30 40 L 50 85 L 70 40 L 62 40 L 50 70 L 38 40 Z"
              fill="url(#vGradient)"
              stroke="white"
              strokeWidth="1.5"
              strokeLinejoin="round"
              className="drop-shadow-lg"
            />

            {/* Inner "V" accent - creates depth */}
            <path
              d="M 42 40 L 50 62 L 58 40"
              fill="none"
              stroke="rgba(255,255,255,0.5)"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            {/* Small star accent - representing premium quality */}
            <circle cx="50" cy="88" r="2.5" fill="#fbbf24" className="animate-pulse" />
            <circle cx="50" cy="88" r="1.5" fill="white" />
          </svg>
        </div>
      </div>

      {showText && (
        <div className="hidden md:block">
          <div className="flex items-baseline space-x-1">
            <span className={`${currentSize.text} font-black text-[#003580] tracking-tight`}>
              Viet
            </span>
            <span className={`${currentSize.text} font-black text-[#0071c2] tracking-tight`}>
              Stay
            </span>
          </div>
          <p className={`${currentSize.subtitle} font-semibold text-gray-500 tracking-wider uppercase`}>
            Premium Hotels
          </p>
        </div>
      )}
    </Link>
  );
};
