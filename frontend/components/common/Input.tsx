/**
 * Input Component - Premium styled input field
 * Reusable input with variants and states
 */

'use client';

import { forwardRef, InputHTMLAttributes } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  icon?: React.ReactNode;
  fullWidth?: boolean;
  variant?: 'default' | 'filled' | 'outlined';
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      error,
      helperText,
      icon,
      fullWidth = false,
      variant = 'default',
      className = '',
      disabled,
      ...props
    },
    ref
  ) => {
    const baseStyles = 'px-5 py-3.5 rounded-xl font-medium transition-all';

    const variants = {
      default: `border-2 ${
        error
          ? 'border-red-500 focus:border-red-600 focus:ring-red-500'
          : 'border-gray-200 hover:border-gray-300 focus:border-blue-500 focus:ring-blue-500'
      } bg-white`,
      filled: `border-2 border-transparent ${
        error
          ? 'bg-red-50 focus:bg-red-100 focus:ring-red-500'
          : 'bg-gray-100 hover:bg-gray-200 focus:bg-white focus:border-blue-500 focus:ring-blue-500'
      }`,
      outlined: `border-2 ${
        error
          ? 'border-red-500 focus:border-red-600 focus:ring-red-500'
          : 'border-gray-300 hover:border-gray-400 focus:border-blue-600 focus:ring-blue-600'
      } bg-transparent`,
    };

    const disabledStyles = 'opacity-60 cursor-not-allowed bg-gray-100';
    const focusStyles = 'focus:ring-2 focus:outline-none';

    const inputClasses = `
      ${baseStyles}
      ${variants[variant]}
      ${focusStyles}
      ${disabled ? disabledStyles : ''}
      ${icon ? 'pl-12' : ''}
      ${fullWidth ? 'w-full' : ''}
      ${className}
    `.trim();

    return (
      <div className={fullWidth ? 'w-full' : ''}>
        {label && (
          <label className="block text-sm font-bold text-gray-800 mb-3">
            {label}
            {props.required && <span className="text-red-500 ml-1">*</span>}
          </label>
        )}

        <div className="relative">
          {icon && (
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
              {icon}
            </div>
          )}

          <input
            ref={ref}
            disabled={disabled}
            className={inputClasses}
            {...props}
          />

          {error && (
            <div className="absolute right-4 top-1/2 -translate-y-1/2">
              <svg
                className="w-5 h-5 text-red-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
          )}
        </div>

        {(error || helperText) && (
          <p
            className={`mt-2 text-sm ${
              error ? 'text-red-600 font-medium' : 'text-gray-500'
            }`}
          >
            {error || helperText}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';
