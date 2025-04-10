import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'accent';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  className = '',
  ...props
}) => {
  const baseClasses = 'font-medium border-2 border-black transition-all rounded focus:outline-none';
  
  const variantClasses = {
    primary: 'bg-primary text-white hover:bg-primary-dark',
    secondary: 'bg-white text-gray-800 hover:bg-gray-100',
    accent: 'bg-primary-dark text-white hover:bg-primary',
  };
  
  const sizeClasses = {
    sm: 'px-2 py-1 text-sm',
    md: 'px-4 py-2',
    lg: 'px-6 py-3 text-lg',
  };
  
  const shadowClass = !props.disabled ? 'shadow-[4px_4px_0px_0px_rgba(0,0,0,0.8)]' : '';
  const hoverClass = !props.disabled ? 'hover:-translate-y-1 hover:-translate-x-1 hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,0.8)]' : '';
  const activeClass = !props.disabled ? 'active:translate-y-1 active:translate-x-1 active:shadow-[2px_2px_0px_0px_rgba(0,0,0,0.8)]' : '';
  
  const disabledClass = props.disabled ? 'opacity-50 cursor-not-allowed' : '';
  
  return (
    <button
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${shadowClass} ${hoverClass} ${activeClass} ${disabledClass} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}; 