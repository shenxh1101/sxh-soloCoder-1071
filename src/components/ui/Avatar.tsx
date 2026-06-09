import { HTMLAttributes, forwardRef } from 'react';
import { cn } from '../../utils/helpers';
import { User } from 'lucide-react';

interface AvatarProps extends HTMLAttributes<HTMLDivElement> {
  name?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'circle' | 'square';
}

const colors = [
  'bg-slate-500',
  'bg-blue-500',
  'bg-emerald-500',
  'bg-amber-500',
  'bg-rose-500',
  'bg-violet-500',
  'bg-cyan-500',
  'bg-orange-500',
];

export const Avatar = forwardRef<HTMLDivElement, AvatarProps>(
  ({ className, name = '', size = 'md', variant = 'circle', ...props }, ref) => {
    const getColor = (str: string) => {
      const hash = str.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
      return colors[hash % colors.length];
    };

    const sizes = {
      sm: 'w-8 h-8 text-xs',
      md: 'w-10 h-10 text-sm',
      lg: 'w-12 h-12 text-base',
      xl: 'w-16 h-16 text-xl',
    };

    const variants = {
      circle: 'rounded-full',
      square: 'rounded-md',
    };

    const initials = name
      .split(' ')
      .map((word) => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);

    return (
      <div
        ref={ref}
        className={cn(
          'inline-flex items-center justify-center font-medium text-white',
          getColor(name),
          sizes[size],
          variants[variant],
          className
        )}
        {...props}
      >
        {initials ? <span>{initials}</span> : <User className="w-1/2 h-1/2" />}
      </div>
    );
  }
);

Avatar.displayName = 'Avatar';
