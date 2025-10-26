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

  if (data && data.status === 'success' && data.data && Array.isArray(data.data.cards)) {
    return data.data.cards;
  }
  return [];
}

export async function getCards(signal?: AbortSignal) {
  return fetchCards('/cards/get_cards', undefined, signal);
}

/**
 * Uploads a new card to the server.
 *
 * @param card - Object containing card fields
 * @returns Promise<void> - Resolves if upload succeeded, throws if not
 */
export async function uploadCardApi(card: {
  title: string;
  content: string;
  image_url: string;
  card_date: string; // "2025-10-26"
  author: string;
}): Promise<void> {
  const { data } = await api.put<ApiResponse<null>>('/cards/upload', card, {
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (data.status !== 'success') {
    throw new Error(data?.title || 'Unknown error uploading card');
  }
}

/**
 * Updates an existing card.
 *
 * @param cardId - The ID of the card to update
 * @param card - Object containing updated card fields
 * @returns Promise<void> - Resolves if update succeeded, throws if not
 */
export async function updateCardApi(
  cardId: number,
  card: {
    title?: string;
    content?: string;
    image_url?: string;
    card_date?: string;
    author?: string;
  }
): Promise<void> {
  const { data } = await api.put<ApiResponse<null>>('/cards/update', card, {
    params: { card_id: cardId },
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (data.status !== 'success') {
    throw new Error(data?.title || 'Unknown error updating card');
  }
}

/**
 * Deletes a card by its ID.
 *
 * @param cardId - The ID of the card to delete
 * @returns Promise<void> - Resolves if delete succeeded, throws if not
 */
export async function deleteCardApi(cardId: number): Promise<void> {
  const { data } = await api.delete<ApiResponse<null>>('/cards/delete', {
    params: { card_id: cardId },
  });

  if (data.status !== 'success') {
    throw new Error(data?.title || 'Unknown error deleting card');
  }
}
