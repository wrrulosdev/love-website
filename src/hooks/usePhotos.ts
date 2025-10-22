import { useCallback, useEffect, useState } from 'react';
import type { FilterOption } from '../interfaces/photo';
import type { Photo } from '../interfaces/api';
import { getBookImagesApi, getPhotosApi, getTimelineImagesApi } from '../services/photosApi';

export type PhotosSource = 'images' | 'book' | 'timeline';

export function usePhotos(
  initialCategory: FilterOption = 'Todas',
  initialSource: PhotosSource = 'images'
) {
  const [category, setCategory] = useState<FilterOption>(initialCategory);
  const [source, setSource] = useState<PhotosSource>(initialSource);
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
            : 'Error desconocido al cargar imágenes';
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

  const refetch = useCallback(
    (cat?: FilterOption, src?: PhotosSource) => {
      return fetchPhotos(cat, src);
    },
    [fetchPhotos]
  );

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
