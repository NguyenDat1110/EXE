import React from 'react';
import { User } from 'lucide-react';
import { clsx } from 'clsx';

type AvatarSize = 'sm' | 'md' | 'lg' | 'xl';

interface AvatarProps {
  src?: string;
  alt?: string;
  size?: AvatarSize;
  className?: string;
  ring?: boolean;
}

const sizeClasses: Record<AvatarSize, string> = {
  sm: 'w-8 h-8',
  md: 'w-12 h-12',
  lg: 'w-16 h-16',
  xl: 'w-24 h-24',
};

const sizeIconClasses: Record<AvatarSize, string> = {
  sm: 'w-4 h-4',
  md: 'w-6 h-6',
  lg: 'w-8 h-8',
  xl: 'w-12 h-12',
};

export function Avatar({ 
  src, 
  alt = 'User avatar', 
  size = 'md',
  className,
  ring = false 
}: AvatarProps) {
  return (
    <div
      className={clsx(
        'flex-shrink-0 rounded-full overflow-hidden bg-gray-700',
        sizeClasses[size],
        ring && 'ring-2 ring-cyan',
        className
      )}
    >
      {src ? (
        <img
          src={src}
          alt={alt}
          className="w-full h-full object-cover"
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-surface to-slate-custom">
          <User className={clsx('text-silver', sizeIconClasses[size])} />
        </div>
      )}
    </div>
  );
}
