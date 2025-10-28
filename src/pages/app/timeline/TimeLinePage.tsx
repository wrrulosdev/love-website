import React, { useState, useEffect, useMemo } from 'react';
import './TimeLinePage.css';
import { usePhotos } from '../../../hooks/usePhotos';
import { useLoading } from '../../../context/LoadingContext';
import ApiErrorState from '../../../components/errorstate/ApiErrorState';
import type { Photo } from '../../../interfaces/api';
import { ImagesIcon } from 'lucide-react';

const TimelinePage: React.FC = () => {
  const { show, hide } = useLoading();
  const { photos, loading, error, refetch } = usePhotos('Todas', 'timeline');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  useEffect(() => {
    if (loading) {
      show('Cargando eventos...');
    } else {
      hide();
    }
  }, [loading, show, hide]);

  /**
   * Extracts a valid timestamp number from various possible date fields in a Photo object.
   * Supports formats like ISO, YYYY-MM-DD, DD/MM/YYYY, and numeric timestamps.
   * Returns 0 if no valid date is found to ensure consistent sorting.
   */
  const getTime = (p: Photo): number => {
    const candidate =
      (p as Record<string, unknown>).date ??
      (p as Record<string, unknown>).created_at ??
      (p as Record<string, unknown>).taken_at ??
      (p as Record<string, unknown>).createdAt ??
      (p as Record<string, unknown>).timestamp ??
      (p as Record<string, unknown>).time ??
      null;

    if (candidate == null) return 0;

    if (typeof candidate === 'number') return candidate;

    const value = String(candidate).trim();

    // Handle DD/MM/YYYY format
    if (/^\d{2}\/\d{2}\/\d{4}$/.test(value)) {
      const [day, month, year] = value.split('/').map(Number);
      return new Date(year, month - 1, day).getTime();
    }

    // Handle ISO or YYYY-MM-DD
    const parsed = Date.parse(value);
    if (!isNaN(parsed)) return parsed;

    return 0;
  };

  /**
   * Sort the photos chronologically from oldest to newest.
   * This ensures the timeline displays events in correct historical order.
   */
  const sortedPhotos = useMemo(() => {
    const arr = [...photos];
    arr.sort((a, b) => getTime(a) - getTime(b));
    return arr;
  }, [photos]);

  /**
   * Opens the lightbox with the selected image.
   *
   * @param {string} imageUrl - URL of the clicked image
   */
  const handleImageClick = (imageUrl: string) => {
    setSelectedImage(imageUrl);
  };

  /**
   * Closes the lightbox overlay.
   */
  const handleCloseLightbox = () => {
    setSelectedImage(null);
  };

  // Display API error state if fetching photos fails
  if (error) {
    return (
      <ApiErrorState
        error={error}
        onRetry={() => refetch().catch(() => {})}
        message="No pudimos cargar los eventos."
      />
    );
  }

  return (
    <section className="timeline-page">
      {!loading && !error && sortedPhotos.length === 0 ? (
        <div className="default-empty-state">
          <ImagesIcon size={64} />
          <h3>No hay imágenes disponibles</h3>
          <p>Aún no se han subido imágenes a esta línea temporal</p>
          <button className="default-retry-button" onClick={() => refetch().catch(() => {})}>
            Reintentar
          </button>
        </div>
      ) : (
        <div className="timeline-container">
          <div className="timeline">
            {sortedPhotos.map((event: Photo, index: number) => (
              <div
                key={event.id}
                className={`timeline-event ${
                  index % 2 === 0 ? 'timeline-event-left' : 'timeline-event-right'
                }`}
              >
                <div className="timeline-event-content">
                  <div className="timeline-event-date">{event.date}</div>
                  <div className="timeline-event-location">{event.location}</div>
                  <h3 className="timeline-event-title">{event.title}</h3>
                  <p className="timeline-event-description">{event.description}</p>

                  {event.image_url && (
                    <div
                      className="timeline-event-image"
                      onClick={() => handleImageClick(event.image_url)}
                    >
                      <img src={event.image_url} alt={event.title} className="timeline-event-img" />
                      <div className="timeline-event-image-overlay">
                        <span className="timeline-event-image-icon">🔍</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {selectedImage && (
        <div className="timeline-lightbox-overlay" onClick={handleCloseLightbox}>
          <div className="timeline-lightbox-content" onClick={(e) => e.stopPropagation()}>
            <button
              className="timeline-lightbox-close"
              onClick={handleCloseLightbox}
              aria-label="Cerrar"
            >
              ✕
            </button>
            <div className="timeline-lightbox-image-container">
              <img src={selectedImage} alt="Imagen ampliada" className="timeline-lightbox-image" />
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default TimelinePage;
