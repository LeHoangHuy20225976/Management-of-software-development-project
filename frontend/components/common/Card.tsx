/**
 * Card Component - Modern reusable card container
 */

import { ReactNode } from 'react';
import { cn } from '@/lib/utils/cn';

interface CardProps {
  children: ReactNode;
  className?: string;
  variant?: 'default' | 'elevated' | 'outlined' | 'glass' | 'gradient';
  hover?: boolean | 'lift' | 'glow' | 'scale';
  padding?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
  rounded?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl';
  onClick?: () => void;
}

export const Card = ({ 
  children, 
  className, 
  variant = 'default',
  hover = false, 
  padding = 'md',
  rounded = '2xl',
  onClick,
}: CardProps) => {
  const paddingClasses = {
    none: '',
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8',
    xl: 'p-10',
  };

  const roundedClasses = {
    sm: 'rounded-lg',
    md: 'rounded-xl',
    lg: 'rounded-2xl',
    xl: 'rounded-3xl',
    '2xl': 'rounded-[2rem]',
    '3xl': 'rounded-[2.5rem]',
  };

  const variantClasses = {
    default: 'bg-white border border-gray-100 shadow-[0_4px_20px_rgba(0,0,0,0.05)]',
    elevated: 'bg-white shadow-[0_8px_30px_rgba(0,0,0,0.08)] border border-gray-50',
    outlined: 'bg-white border-2 border-gray-200',
    glass: 'bg-white/80 backdrop-blur-xl border border-white/50 shadow-[0_8px_32px_rgba(0,0,0,0.08)]',
    gradient: 'bg-gradient-to-br from-white via-gray-50 to-white border border-gray-100 shadow-[0_4px_20px_rgba(0,0,0,0.05)]',
  };

  const getHoverClasses = () => {
    if (!hover) return '';
    
    const baseHover = 'transition-all duration-400 cursor-pointer';
    
    if (hover === true || hover === 'lift') {
      return `${baseHover} hover:-translate-y-2 hover:shadow-[0_20px_40px_rgba(0,0,0,0.1)] hover:border-[#0071c2]/20`;
    }
    if (hover === 'glow') {
      return `${baseHover} hover:shadow-[0_0_40px_rgba(0,113,194,0.2)] hover:border-[#0071c2]/30`;
    }
    if (hover === 'scale') {
      return `${baseHover} hover:scale-[1.02] hover:shadow-[0_12px_30px_rgba(0,0,0,0.1)]`;
    }
    return '';
  };

  return (
    <div
      className={cn(
        variantClasses[variant],
        roundedClasses[rounded],
        paddingClasses[padding],
        getHoverClasses(),
        onClick && 'cursor-pointer',
        className
      )}
      onClick={onClick}
    >
      {children}
    </div>
  );
};

// Additional Card sub-components for structured layouts
export const CardHeader = ({ children, className }: { children: ReactNode; className?: string }) => (
  <div className={cn('mb-4 pb-4 border-b border-gray-100', className)}>
    {children}
  </div>
);

export const CardTitle = ({ children, className }: { children: ReactNode; className?: string }) => (
  <h3 className={cn('text-xl font-bold text-gray-900', className)}>
    {children}
  </h3>
);

export const CardDescription = ({ children, className }: { children: ReactNode; className?: string }) => (
  <p className={cn('text-gray-600 mt-1', className)}>
    {children}
  </p>
);

export const CardContent = ({ children, className }: { children: ReactNode; className?: string }) => (
  <div className={cn('', className)}>
    {children}
  </div>
);

export const CardFooter = ({ children, className }: { children: ReactNode; className?: string }) => (
  <div className={cn('mt-6 pt-4 border-t border-gray-100', className)}>
    {children}
  </div>
);
