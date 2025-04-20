import React from 'react';
import { cn } from '@/lib/utils';
import { colors } from '@/utils/colors';
import { getMoodColor, getMoodGradient } from '@/lib/utils/mood';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
    variant?: 'default' | 'elevated' | 'outlined';
    mood?: string;
    useMoodGradient?: boolean;
}

const Card: React.FC<CardProps> = ({
    children,
    className,
    variant = 'default',
    mood,
    useMoodGradient = false,
    ...props
}) => {
    const baseClasses = 'rounded-xl transition-all duration-200';

    const variantClasses = {
        default: 'bg-background-secondary shadow-md',
        elevated: `bg-background-secondary shadow-lg`,
        outlined: 'border border-border-subtle bg-transparent'
    };

    let style = {};

    if (mood && useMoodGradient) {
        style = {
            background: getMoodGradient(mood as any),
        };
    } else if (mood) {
        style = {
            borderColor: `${getMoodColor(mood as any)}88`,
        };
    }

    return (
        <div
            className={cn(baseClasses, variantClasses[variant], className)}
            style={style}
            {...props}
        >
            {children}
        </div>
    );
};

export default Card;
