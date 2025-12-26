/**
 * Button Component - Modern reusable button with variants
 */

import { ButtonHTMLAttributes, ReactNode } from 'react';
import { cn } from '@/lib/utils/cn';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'gradient';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  children: ReactNode;
  isLoading?: boolean;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  fullWidth?: boolean;
}

export const Button = ({
  variant = 'primary',
  size = 'md',
  children,
  className,
  disabled,
  isLoading,
  leftIcon,
  rightIcon,
  fullWidth,
  ...props
}: ButtonProps) => {
  const baseStyles = `
    font-semibold rounded-xl transition-all duration-300 
    inline-flex items-center justify-center gap-2
    disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none
    focus:outline-none focus:ring-4 focus:ring-offset-0
    transform active:scale-[0.98]
  `;

  const variants = {
    primary: `
      bg-gradient-to-r from-[#0071c2] to-[#005999] 
      hover:from-[#005999] hover:to-[#003580] 
      text-white shadow-lg shadow-blue-500/25
      hover:shadow-xl hover:shadow-blue-500/30 hover:-translate-y-0.5
      focus:ring-blue-500/30
    `,
    secondary: `
      bg-gray-800 hover:bg-gray-900 
      text-white shadow-lg shadow-gray-900/25
      hover:shadow-xl hover:-translate-y-0.5
      focus:ring-gray-500/30
    `,
    outline: `
      border-2 border-[#0071c2] text-[#0071c2] 
      hover:bg-[#0071c2] hover:text-white
      hover:shadow-lg hover:shadow-blue-500/20 hover:-translate-y-0.5
      focus:ring-blue-500/20
    `,
    ghost: `
      text-gray-700 hover:bg-gray-100 hover:text-[#0071c2]
      focus:ring-gray-500/20
    `,
    danger: `
      bg-gradient-to-r from-red-500 to-red-600 
      hover:from-red-600 hover:to-red-700 
      text-white shadow-lg shadow-red-500/25
      hover:shadow-xl hover:shadow-red-500/30 hover:-translate-y-0.5
      focus:ring-red-500/30
    `,
    gradient: `
      bg-gradient-to-r from-[#0071c2] via-[#00a2ff] to-[#0071c2] 
      bg-[length:200%_auto] hover:bg-right
      text-white shadow-lg shadow-blue-500/25
      hover:shadow-xl hover:-translate-y-0.5
      focus:ring-blue-500/30
    `,
  };

  const sizes = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-6 py-3 text-base',
    lg: 'px-8 py-4 text-lg',
    xl: 'px-10 py-5 text-xl',
  };

  return (
    <button
      className={cn(
        baseStyles, 
        variants[variant], 
        sizes[size], 
        fullWidth && 'w-full',
        className
      )}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      ) : (
        leftIcon
      )}
      <span>{children}</span>
      {!isLoading && rightIcon}
    </button>
  );
};
