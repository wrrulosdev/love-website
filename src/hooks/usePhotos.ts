import { useCallback, useEffect, useState } from 'react';
import type { FilterOption } from '../interfaces/photo';
import type { Photo } from '../interfaces/api';
import { getBookImagesApi, getPhotosApi, getTimelineImagesApi } from '../services/photosApi';

export type PhotosSource = 'images' | 'book' | 'timeline';

/**
 * Custom hook to manage photo fetching, loading state, and errors.
 *
 * Handles three sources:
 * - 'images': general gallery images (optionally filtered by category)
 * - 'book': book-specific images
 * - 'timeline': timeline images (events)
 *
 * @param initialCategory - default category filter for 'images' source
 * @param initialSource - default source of photos
 */
export function usePhotos(
  initialCategory: FilterOption = 'Todas',
  initialSource: PhotosSource = 'images'
) {
  const [category, setCategory] = useState<FilterOption>(initialCategory);
  const [source, setSource] = useState<PhotosSource>(initialSource);
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  /**
   * Fetch photos based on category and source.
   * Sets loading and error states appropriately.
   *
   * @param cat - optional category override
   * @param src - optional source override
   */
  const fetchPhotos = useCallback(
    async (cat?: FilterOption, src?: PhotosSource) => {
      setLoading(true);
      setError(null);

      try {
        const useCat = cat ?? category;
        const useSrc = src ?? source;
        let result: Photo[] = [];

        if (useSrc === 'book') {
          result = await getBookImagesApi();
        } else if (useSrc === 'timeline') {
          result = await getTimelineImagesApi();
        } else {
          result = await getPhotosApi(useCat);
        }

        setPhotos(result || []);
      } catch (err) {
        const msg =
          err && typeof err === 'object' && 'message' in err
            ? (err as any).message
            : 'Unknown error loading images';
        setError(String(msg));
        setPhotos([]);
      } finally {
        setLoading(false);
      }
    },
    [category, source]
  );

  useEffect(() => {
    fetchPhotos();
  }, [fetchPhotos]);

  /**
   * Refetch function to manually reload photos.
   * Can override category or source if needed.
   */
  const refetch = useCallback(
    (cat?: FilterOption, src?: PhotosSource) => {
      return fetchPhotos(cat, src);
    },
    [fetchPhotos]
  );

  // Return state and actions to use in components
  return {
    category,
    setCategory,
    source,
    setSource,
    photos,
    loading,
    error,
    refetch,
  };
}
