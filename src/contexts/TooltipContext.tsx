import React, { createContext, useContext, useState } from 'react';

interface TooltipContextType {
  tooltipEnabled: boolean;
  toggleTooltip: () => void;
  setTooltipEnabled: (enabled: boolean) => void;
}

const TooltipContext = createContext<TooltipContextType | undefined>(undefined);

export function TooltipProvider({ children }: { children: React.ReactNode }) {
  const [tooltipEnabled, setTooltipEnabledState] = useState<boolean>(() => {
    const saved = localStorage.getItem('tooltipEnabled');
    if (saved !== null) {
      return saved === 'true';
    }
    return true;
  });

  const setTooltipEnabled = (enabled: boolean) => {
    setTooltipEnabledState(enabled);
    localStorage.setItem('tooltipEnabled', enabled.toString());
  };

  const toggleTooltip = () => {
    setTooltipEnabled(!tooltipEnabled);
  };

  return (
    <TooltipContext.Provider value={{ tooltipEnabled, toggleTooltip, setTooltipEnabled }}>
      {children}
    </TooltipContext.Provider>
  );
}

export function useTooltip() {
  const context = useContext(TooltipContext);
  if (context === undefined) {
    throw new Error('useTooltip must be used within a TooltipProvider');
  }
  return context;
} 