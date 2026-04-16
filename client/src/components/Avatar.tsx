import React from 'react';
import Avatar from 'boring-avatars';
import { cn } from '../lib/utils';
import { getInitials } from '../lib/utils';

interface Props {
  name: string;
  size?: number;
  className?: string;
  variant?: 'beam' | 'marble' | 'sunset' | 'pixel' | 'ring' | 'bauhaus';
  showInitials?: boolean;
}

// Edu-Premium accent palette — distinctive but harmonious
const PALETTE = ['#7C3AED', '#06B6D4', '#10B981', '#F59E0B', '#EC4899', '#FB7185'];

const ProfAvatar: React.FC<Props> = ({
  name,
  size = 48,
  className,
  variant = 'beam',
  showInitials = false,
}) => {
  return (
    <div
      className={cn('relative inline-flex items-center justify-center', className)}
      style={{ width: size, height: size }}
    >
      <Avatar size={size} name={name} variant={variant} colors={PALETTE} />
      {showInitials && (
        <span
          className="absolute inset-0 flex items-center justify-center font-semibold text-white drop-shadow"
          style={{ fontSize: Math.max(size * 0.32, 10) }}
        >
          {getInitials(name)}
        </span>
      )}
    </div>
  );
};

export default ProfAvatar;
