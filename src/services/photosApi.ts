import type { Photo, ApiResponse } from '../interfaces/api';
import type { FilterOption } from '../interfaces/photo';
import { api } from './api';

/**
 * Generic helper to fetch photos from a given API path.
 *
 * @param path - API endpoint path
 * @param params - optional query parameters
 * @param signal - optional AbortSignal to cancel the request
 * @returns Promise resolving to an array of Photo objects
 */
async function fetchPhotos(
  path: string,
  params?: Record<string, unknown>,
  signal?: AbortSignal
): Promise<Photo[]> {
  const { data } = await api.get<ApiResponse<{ photos: Photo[] }>>(path, {
    params,
    signal,
  });

  // Check response structure and return photos array or empty
  if (data && data.status === 'success' && data.data && Array.isArray(data.data.photos)) {
    return data.data.photos;
  }

  return [];
}

/**
 * Retrieves photos from `/images/get_images`.
 * Supports optional category filtering.
 *
 * @param category - optional filter for photo category
 * @param signal - optional AbortSignal for request cancellation
 * @returns Promise resolving to an array of Photo objects
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
 * Retrieves book images from `/images/get_book_images`.
 *
 * @param signal - optional AbortSignal
 * @returns Promise resolving to an array of Photo objects
 */
export async function getBookImagesApi(signal?: AbortSignal): Promise<Photo[]> {
  return fetchPhotos('/images/get_book_images', undefined, signal);
}

/**
 * Retrieves timeline images from `/images/get_timeline_images`.
 *
 * @param signal - optional AbortSignal
 * @returns Promise resolving to an array of Photo objects
 */
export async function getTimelineImagesApi(signal?: AbortSignal): Promise<Photo[]> {
  return fetchPhotos('/images/get_timeline_images', undefined, signal);
}

/**
 * Updates an existing photo on the server.
 *
 * @param data - object containing all editable photo fields
 * @throws Error if the API response indicates failure
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
    throw new Error(responseData?.title || 'Unknown error updating photo');
  }
}

/**
 * Deletes a photo by its ID.
 *
 * @param imageId - ID of the photo to delete
 * @throws Error if the API response indicates failure
 */
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
    throw new Error(data?.title || 'Unknown error deleting photo');
  }
}

/**
 * Uploads a new image to the server.
 *
 * @param formData - FormData containing the image file
 * @returns Promise resolving to an object with the uploaded image URL
 * @throws Error if the API response indicates failure
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
    throw new Error(data?.title || 'Unknown error uploading image');
  }
}

/**
 * Fetches all photos without filtering.
 * Primarily used for admin or edit purposes.
 *
 * @param signal - optional AbortSignal
 * @returns Promise resolving to an array of Photo objects
 */
export async function fetchPhotosApi(signal?: AbortSignal): Promise<Photo[]> {
  return fetchPhotos('/images/get_images', undefined, signal);
}
