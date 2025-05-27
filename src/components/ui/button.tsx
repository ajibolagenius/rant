import React from 'react';
import { cn } from '@/lib/utils';

interface ButtonProps {
    variant?: 'primary' | 'secondary' | 'destructive';
    size?: 'small' | 'medium' | 'large';
    onClick?: () => void;
    disabled?: boolean;
    className?: string;
    children: React.ReactNode;
}

const Button: React.FC<ButtonProps> = ({ variant = 'primary', size = 'medium', onClick, disabled, className, children }) => {
    const baseStyles = 'inline-flex items-center justify-center rounded-md font-medium transition-colors';
    const variantStyles = {
        primary: 'bg-blue-500 text-white hover:bg-blue-600',
        secondary: 'bg-gray-500 text-white hover:bg-gray-600',
        destructive: 'bg-red-500 text-white hover:bg-red-600',
    };
    const sizeStyles = {
        small: 'px-2 py-1 text-sm',
        medium: 'px-4 py-2 text-base',
        large: 'px-6 py-3 text-lg',
    };

    return (
        <button
            className={cn(baseStyles, variantStyles[variant], sizeStyles[size], className)}
            onClick={onClick}
            disabled={disabled}
        >
            {children}
        </button>
    );
};

export default Button;
