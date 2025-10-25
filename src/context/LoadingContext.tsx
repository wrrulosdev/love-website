import React, { createContext, useContext, useState, useCallback } from 'react';

type LoadingContextType = {
  isLoading: boolean;
  setLoading: (v: boolean) => void;
  show: (msg?: string) => void;
  hide: () => void;
  message?: string;
};

const LoadingContext = createContext<LoadingContextType | undefined>(undefined);

/**
 * Provider component that wraps the app and manages loading state.
 */
export const LoadingProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isLoading, setIsLoading] = useState(false); // Tracks if loading overlay is visible
  const [message, setMessage] = useState<string | undefined>('Cargando...'); // Default loading message

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

/**
 * Custom hook to access the loading context.
 * Throws an error if used outside the LoadingProvider.
 */
// eslint-disable-next-line react-refresh/only-export-components
export function useLoading() {
  const ctx = useContext(LoadingContext);
  if (!ctx) {
    throw new Error('useLoading must be used within LoadingProvider');
  }
  return ctx;
}
