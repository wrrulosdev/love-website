import { useCallback, useEffect, useState } from 'react';
import type { Card } from '../interfaces/api';
import { getCards } from '../services/cardsApi';

/**
 * Hook to handle Card loading, status, and errors.
 */
export function useCards() {
  const [cards, setCards] = useState<Card[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCardsData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await getCards();
      setCards(result || []);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error desconocido al cargar las tarjetas';
      setError(msg);
      setCards([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCardsData();
  }, [fetchCardsData]);

  const refetch = useCallback(() => fetchCardsData(), [fetchCardsData]);

  return {
    cards,
    loading,
    error,
    refetch,
  };
}
