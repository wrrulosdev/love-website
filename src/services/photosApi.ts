import type { ApiResponse } from '../interfaces/api';
import type { FilterOption, Photo } from '../interfaces/photo';
import { api } from './api';

const categoryMap: { [key: string]: FilterOption } = {
  citas: 'Citas',
  viajes: 'Viajes',
  casual: 'Casual',
};

function mapApiPhotoToPhoto(
  apiPhoto: NonNullable<NonNullable<ApiResponse['data']>['photos']>[number]
): Photo {
  return {
    id: apiPhoto.id,
    hash: `img${apiPhoto.id}`,
    category: categoryMap[(apiPhoto.category || '').toLowerCase()] || 'Casual',
    thumb: apiPhoto.image_url,
    full: apiPhoto.image_url,
    title: apiPhoto.title ?? '',
    description: apiPhoto.description ?? '',
    date: apiPhoto.date ?? '',
    location: apiPhoto.location ?? '',
    in_book: !!apiPhoto.in_book,
    in_timeline: !!apiPhoto.in_timeline,
    created_at: apiPhoto.created_at ?? '',
    updated_at: apiPhoto.updated_at ?? '',
  };
}

async function fetchAndMap(
  path: string,
  params?: Record<string, any>,
  signal?: AbortSignal
): Promise<Photo[]> {
  const { data } = await api.get<ApiResponse>(path, {
    params,
    signal,
  });

  if (data && data.status === 'success' && data.data && Array.isArray(data.data.photos)) {
    return data.data.photos.map(mapApiPhotoToPhoto);
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
  return fetchAndMap('/images/get_images', categoryParam, signal);
}

/**
 * Retrieves book images from /images/get_book_images
 */
export async function getBookImagesApi(signal?: AbortSignal): Promise<Photo[]> {
  return fetchAndMap('/images/get_book_images', undefined, signal);
}

/**
 * Retrieves timeline images from /images/get_timeline_images
 */
export async function getTimelineImagesApi(signal?: AbortSignal): Promise<Photo[]> {
  return fetchAndMap('/images/get_timeline_images', undefined, signal);
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

  try {
    const { data: responseData } = await api.put<ApiResponse>('/images/update', formData);

    if (responseData && responseData.status === 'success') {
      return;
    } else {
      throw new Error(responseData?.title || 'Error desconocido al actualizar la imagen');
    }
  } catch (error: any) {
    if (error.response) {
      console.error('Error response.data:', error.response.data);
      console.error('Status:', error.response.status);
      throw new Error(error.response.data?.title || `Error servidor: ${error.response.status}`);
    } else {
      console.error('Error', error.message);
      throw error;
    }
  }
}

export async function deletePhotoApi(imageId: number): Promise<void> {
  const formData = new FormData();
  formData.append('image_id', String(imageId));

  const { data } = await api.delete<ApiResponse>('/images/remove', {
    data: formData,
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });

  if (data && data.status === 'success') {
    return;
  } else {
    throw new Error(data?.title || 'Error desconocido al eliminar la imagen');
  }
}

/**
 * Uploads an image to the server
 */
export async function uploadImageApi(formData: FormData): Promise<{ url: string }> {
  const { data } = await api.put<ApiResponse>('/images/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });

  if (data && data.status === 'success') {
    return { url: data.data.url };
  } else {
    throw new Error(data?.title || 'Error desconocido al subir la imagen');
  }
}

/**
 * Fetches all photos (for admin/edit purposes)
 */
export async function fetchPhotosApi(signal?: AbortSignal): Promise<Photo[]> {
  return fetchAndMap('/images/get_images', undefined, signal);
}
