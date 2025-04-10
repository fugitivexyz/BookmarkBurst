import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  className?: string;
}

export const Input: React.FC<InputProps> = ({ 
  label, 
  error, 
  className = '', 
  ...props 
}) => {
  return (
    <div className={`mb-4 ${className}`}>
      {label && (
        <label className="block text-sm font-medium mb-1">
          {label}
          {props.required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      
      <input
        className={`w-full p-2 border-2 border-black rounded shadow-[3px_3px_0px_0px_rgba(0,0,0,0.2)] 
          focus:border-primary focus:shadow-[4px_4px_0px_0px_rgba(79,125,243,0.3)] 
          transition-all focus:outline-none
          ${error ? 'border-red-500' : ''}
          ${props.disabled ? 'bg-gray-100 opacity-60' : 'bg-white'}`}
        {...props}
      />
      
      {error && (
        <p className="mt-1 text-sm text-red-500">{error}</p>
      )}
    </div>
  );
}; 