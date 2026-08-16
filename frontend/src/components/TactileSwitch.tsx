import React from 'react';
import { audioService } from '../utils/audio';

interface TactileSwitchProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  silent?: boolean;
  className?: string;
}

export const TactileSwitch: React.FC<TactileSwitchProps> = ({
  checked,
  onChange,
  label,
  silent = false,
  className = '',
}) => {
  const handleToggle = () => {
    const nextState = !checked;
    if (!silent) {
      audioService.playToggle(nextState);
    }
    onChange(nextState);
  };

  return (
    <div className={`flex items-center gap-3 select-none ${className}`}>
      {label && <span className="text-sm font-medium text-neu-text-muted">{label}</span>}
      <button
        type="button"
        onClick={handleToggle}
        className={`w-12 h-6 rounded-full p-0.5 transition-all duration-300 shadow-neu-sm-in border border-neu-border flex items-center relative cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 ${
          checked ? 'bg-accent/10 border-accent/20' : 'bg-neu-bg'
        }`}
        aria-checked={checked}
        role="switch"
      >
        <span
          className={`w-4 h-4 rounded-full shadow-neu-sm-out transition-all duration-300 transform ${
            checked 
              ? 'translate-x-6 bg-accent' 
              : 'translate-x-0 bg-neu-text-muted/40 dark:bg-neu-text/30'
          }`}
        />
      </button>
    </div>
  );
};
