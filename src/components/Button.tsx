import React from 'react';
import { cn } from '@/lib/utils';
import { buttonVariants } from '@/utils/colors';

type ButtonVariant = 'primary' | 'accentTeal' | 'danger' | 'ghost';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: ButtonVariant;
    size?: ButtonSize;
    fullWidth?: boolean;
    icon?: React.ReactNode;
    iconPosition?: 'left' | 'right';
}

const Button: React.FC<ButtonProps> = ({
    children,
    variant = 'primary',
    size = 'md',
    fullWidth = false,
    icon,
    iconPosition = 'left',
    className,
    ...props
}) => {
    const sizeClasses = {
        sm: 'py-1 px-3 text-sm',
        md: 'py-2 px-4 text-base',
        lg: 'py-3 px-6 text-lg'
    };

    const style = {
        backgroundColor: buttonVariants[variant].background,
        color: buttonVariants[variant].text,
        border: buttonVariants[variant].border,
    };

    return (
        <button
            className={cn(
                'rounded-lg font-ui font-medium transition-all duration-200 ease-in-out',
                'focus:outline-none focus:ring-2 focus:ring-accent-teal focus:ring-opacity-50',
                'disabled:opacity-50 disabled:cursor-not-allowed',
                sizeClasses[size],
                fullWidth ? 'w-full' : '',
                className
            )}
            style={style}
            {...props}
        >
            <span className="flex items-center justify-center gap-2">
                {icon && iconPosition === 'left' && icon}
                {children}
                {icon && iconPosition === 'right' && icon}
            </span>
        </button>
    );
};

export default Button;
