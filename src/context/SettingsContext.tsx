import React, { createContext, useContext, useState, useEffect } from 'react';

export type CardSize = 'small' | 'medium' | 'large';

interface SettingsContextType {
  cardSize: CardSize;
  setCardSize: (size: CardSize) => void;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [cardSize, setCardSize] = useState<CardSize>(() => {
    const saved = localStorage.getItem('cardSize');
    return (saved as CardSize) || 'medium';
  });

  useEffect(() => {
    localStorage.setItem('cardSize', cardSize);
  }, [cardSize]);

  return (
    <SettingsContext.Provider value={{ cardSize, setCardSize }}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
}