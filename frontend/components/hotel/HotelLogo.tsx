/**
 * Hotel Manager Logo Component
 * Logo SVG cho trang hotel manager
 */

interface HotelLogoProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function HotelLogo({ size = 'md', className = '' }: HotelLogoProps) {
  const sizes = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-16 h-16',
  };

  const iconSizes = {
    sm: 'w-5 h-5',
    md: 'w-6 h-6',
    lg: 'w-10 h-10',
  };

  return (
    <div
      className={`${sizes[size]} ${className} inline-flex items-center justify-center bg-gradient-to-br from-[#0071c2] via-[#0056a3] to-[#003d7a] rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105`}
    >
      <svg
        className={`${iconSizes[size]} text-white drop-shadow-md`}
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
        />
      </svg>
    </div>
  );
}
