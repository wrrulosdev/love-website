import { api } from './api';
import type { ApiResponse, Card } from '../interfaces/api';

async function fetchCards(
  path: string,
  params?: Record<string, unknown>,
  signal?: AbortSignal
): Promise<Card[]> {
  const { data } = await api.get<ApiResponse<{ cards: Card[] }>>(path, {
    params,
    signal,
  });

  console.log(data);

  if (data && data.status === 'success' && data.data && Array.isArray(data.data.cards)) {
    return data.data.cards;
  }
  return [];
}
