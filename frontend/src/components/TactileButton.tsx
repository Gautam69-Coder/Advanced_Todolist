import React from 'react';
import { motion } from 'framer-motion';
import type { HTMLMotionProps } from 'framer-motion';
import { audioService } from '../utils/audio';

interface TactileButtonProps extends Omit<HTMLMotionProps<'button'>, 'children'> {
  active?: boolean;
  variant?: 'raised' | 'flat' | 'sunken';
  accent?: boolean;
  silent?: boolean;
  children?: React.ReactNode;
}

export const TactileButton: React.FC<TactileButtonProps> = ({
  children,
  active = false,
  variant = 'raised',
  accent = false,
  silent = false,
  className = '',
  onClick,
  onMouseDown,
  onTouchStart,
  ...props
}) => {
  const handleMouseDown = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (!silent) {
      audioService.playClick();
    }
    if (onMouseDown) {
      onMouseDown(e);
    }
  };

  const handleTouchStart = (e: React.TouchEvent<HTMLButtonElement>) => {
    if (!silent) {
      audioService.playClick();
    }
    if (onTouchStart) {
      onTouchStart(e);
    }
  };

  // Base neumorphic classes
  const baseClasses = 'font-medium select-none flex items-center justify-center outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2';
  
  let depthClasses = '';
  if (active || variant === 'sunken') {
    // Sunk/depressed state
    depthClasses = 'shadow-neu-in border border-transparent text-accent';
  } else if (variant === 'flat') {
    // Flat card/background matching
    depthClasses = 'bg-neu-bg border border-neu-border text-neu-text-muted hover:text-neu-text';
  } else {
    // Standard raised neomorphic button
    depthClasses = 'shadow-neu-out border border-neu-border text-neu-text hover:bg-neu-bg-hover hover:text-accent';
  }

  // Accent highlighting
  const accentClasses = accent && !active && variant !== 'sunken'
    ? 'text-accent shadow-neu-out border border-neu-border active:text-accent-dark'
    : '';

  const isInteractive = variant === 'raised' && !active;

  return (
    <motion.button
      className={`${baseClasses} ${depthClasses} ${accentClasses} ${className}`}
      onMouseDown={handleMouseDown}
      onTouchStart={handleTouchStart}
      onClick={onClick}
      whileHover={isInteractive ? { scale: 1.02 } : {}}
      whileTap={{ scale: 0.96 }}
      transition={{ type: 'spring', stiffness: 500, damping: 15 }}
      {...props}
    >
      {children}
    </motion.button>
  );
};
export default TactileButton;
