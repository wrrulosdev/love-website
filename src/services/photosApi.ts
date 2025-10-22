import type { Photo, ApiResponse } from '../interfaces/api';
import type { FilterOption } from '../interfaces/photo';
import { api } from './api';

async function fetchPhotos(
  path: string,
  params?: Record<string, unknown>,
  signal?: AbortSignal
): Promise<Photo[]> {
  const { data } = await api.get<ApiResponse<{ photos: Photo[] }>>(path, {
    params,
    signal,
  });

  if (data && data.status === 'success' && data.data && Array.isArray(data.data.photos)) {
    return data.data.photos;
  }

  return [];
}

/**
 * Retrieves photos from /images/get_images (supports optional category)
 */
export async function getPhotosApi(
  category?: FilterOption,
  signal?: AbortSignal
): Promise<Photo[]> {
  const categoryParam =
    category && category !== 'Todas' ? { category: category.toLowerCase() } : undefined;
  return fetchPhotos('/images/get_images', categoryParam, signal);
}

/**
 * Retrieves book images from /images/get_book_images
 */
export async function getBookImagesApi(signal?: AbortSignal): Promise<Photo[]> {
  return fetchPhotos('/images/get_book_images', undefined, signal);
}

/**
 * Retrieves timeline images from /images/get_timeline_images
 */
export async function getTimelineImagesApi(signal?: AbortSignal): Promise<Photo[]> {
  return fetchPhotos('/images/get_timeline_images', undefined, signal);
}

/**
 * Updates a photo by ID
 */
export async function updatePhotoApi(data: {
  id: number;
  title: string;
  description: string;
  date: string;
  category: string;
  location: string;
  in_book: boolean;
  in_timeline: boolean;
}): Promise<void> {
  const formData = new FormData();
  formData.append('image_id', String(data.id));
  formData.append('title', data.title);
  formData.append('description', data.description);
  formData.append('date', data.date);
  formData.append('category', data.category.toLowerCase());
  formData.append('location', data.location);
  formData.append('in_book', data.in_book ? 'true' : 'false');
  formData.append('in_timeline', data.in_timeline ? 'true' : 'false');

  const { data: responseData } = await api.put<ApiResponse<null>>('/images/update', formData);

  if (responseData.status !== 'success') {
    throw new Error(responseData?.title || 'Error desconocido al actualizar la imagen');
  }
}

export async function deletePhotoApi(imageId: number): Promise<void> {
  const formData = new FormData();
  formData.append('image_id', String(imageId));

  const { data } = await api.delete<ApiResponse<null>>('/images/remove', {
    data: formData,
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });

  if (data.status !== 'success') {
    throw new Error(data?.title || 'Error desconocido al eliminar la imagen');
  }
}

/**
 * Uploads an image to the server
 */
export async function uploadImageApi(formData: FormData): Promise<{ url: string }> {
  const { data } = await api.put<ApiResponse<{ url: string }>>('/images/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });

  if (data.status === 'success' && data.data?.url) {
    return { url: data.data.url };
  } else {
    throw new Error(data?.title || 'Error desconocido al subir la imagen');
  }
}

/**
 * Fetches all photos (for admin/edit purposes)
 */
export async function fetchPhotosApi(signal?: AbortSignal): Promise<Photo[]> {
  return fetchPhotos('/images/get_images', undefined, signal);
}
