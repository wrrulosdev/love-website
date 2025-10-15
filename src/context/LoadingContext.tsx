import React, { createContext, useContext, useState, useCallback } from 'react';

type LoadingContextType = {
  isLoading: boolean;
  setLoading: (v: boolean) => void;
  show: (msg?: string) => void;
  hide: () => void;
  message?: string;
};

const LoadingContext = createContext<LoadingContextType | undefined>(undefined);

export const LoadingProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<string | undefined>('Cargando...');

  const setLoading = useCallback((v: boolean) => {
    setIsLoading(v);
  }, []);

  const show = useCallback((msg?: string) => {
    if (msg) setMessage(msg);
    setIsLoading(true);
  }, []);

  const hide = useCallback(() => {
    setIsLoading(false);
    setMessage('Cargando...');
  }, []);

  return (
    <LoadingContext.Provider value={{ isLoading, setLoading, show, hide, message }}>
      {children}
    </LoadingContext.Provider>
  );
};

export function useLoading() {
  const ctx = useContext(LoadingContext);
  if (!ctx) {
    throw new Error('useLoading debe usarse dentro de LoadingProvider');
  }
  return ctx;
}
