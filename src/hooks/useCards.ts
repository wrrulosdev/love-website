import { useCallback, useEffect, useState } from 'react';
import type { Card } from '../interfaces/api';
import { getCards } from '../services/cardsApi';

/**
 * Custom hook to manage loading, fetching, and error handling
 * for "cards" data from the API.
 *
 * Provides the cards array, loading state, error message, and a refetch function.
 */
export function useCards() {
  const [cards, setCards] = useState<Card[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  /**
   * Fetches card data from the API.
   * Resets loading and error states before making the request.
   */
  const fetchCardsData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await getCards();
      setCards(result || []);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Unknown error loading cards';
      setError(msg);
      setCards([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCardsData();
  }, [fetchCardsData]);

  /**
   * Exposed function to manually refetch cards.
   */
  const refetch = useCallback(() => fetchCardsData(), [fetchCardsData]);

  return {
    cards,
    loading,
    error,
    refetch,
  };
}
