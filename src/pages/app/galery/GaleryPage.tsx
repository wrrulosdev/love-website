import React, { useEffect, useMemo, useCallback, useState } from 'react';
import './GaleryPage.css';
import type { FilterOption } from '../../../interfaces/photo';
import { useVirtualGrid } from '../../../hooks/useVirtualGrid';
import { usePhotos } from '../../../hooks/usePhotos';
import PhotoItem from './PhotoItem';
import type { Photo } from '../../../interfaces/api';
import { useLoading } from '../../../context/LoadingContext';
import ApiErrorState from '../../../components/errorstate/ApiErrorState';
import { ImagesIcon } from 'lucide-react';

const FILTERS: FilterOption[] = ['Todas', 'Citas', 'Viajes', 'Casual'];

/**
 * Gallery filter dropdown.
 */
const GalleryFilters = ({
  open,
  category,
  setCategory,
  setOpen,
  gridRef,
}: {
  open: boolean;
  category: FilterOption;
  setCategory: (f: FilterOption) => void;
  setOpen: (v: boolean | ((prev: boolean) => boolean)) => void;
  gridRef: React.RefObject<HTMLDivElement | null>;
}) => (
  <div className="galery-page-filters-container">
    <button
      aria-haspopup="listbox"
      aria-expanded={open}
      className="galery-page-filters-btn"
      onClick={() => setOpen((s) => !s)}
      onBlur={() => setTimeout(() => setOpen(false), 120)}
      aria-controls="filters-list"
    >
      Filters <span className="galery-page-chev">▾</span>
    </button>

    <ul
      id="filters-list"
      role="listbox"
      aria-label="Gallery filters"
      className={`galery-page-filters ${open ? 'galery-page-filters-open' : ''}`}
    >
      {FILTERS.map((f) => (
        <li key={f}>
          <button
            className={`galery-page-filter-option ${category === f ? 'galery-page-filter-option-active' : ''}`}
            onClick={() => {
              setCategory(f);
              setOpen(false);
              if (gridRef.current) gridRef.current.scrollTop = 0;
            }}
          >
            {f}
          </button>
        </li>
      ))}
    </ul>
  </div>
);

const GaleryPage: React.FC = () => {
  const { show, hide } = useLoading();
  const { category, setCategory, photos, loading, error, refetch, source } = usePhotos(
    'Todas',
    'images'
  );

  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<Photo | null>(null);
  const { gridRef, endIndex, visibleSet, markVisible } = useVirtualGrid();

  // Filtered photo list depending on category
  const filtered = useMemo(
    () =>
      category === 'Todas' || source === 'book'
        ? photos
        : photos.filter((p) => p.category === category),
    [category, photos, source]
  );

  // Show or hide global loader
  useEffect(() => {
    if (loading) show('Loading photos...');
    else hide();
  }, [loading, show, hide]);

  // Efficiently mark visible photos in the virtualized grid
  useEffect(() => {
    if (filtered.length > 0 && endIndex >= 0) {
      markVisible(filtered);
    }
  }, [filtered, endIndex, markVisible]);

  /**
   * Ensures image is pre-decoded when possible before showing.
   */
  const preloadAndSelect = useCallback(
    (photo: Photo | null) => {
      if (!photo) {
        setSelected(null);
        return;
      }

      const img = new Image();
      img.src = photo.image_url;
      const set = () => setSelected(photo);

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      if ((img as any).decode) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (img as any).decode().then(set).catch(set);
      } else {
        img.onload = set;
        img.onerror = set;
      }

      visibleSet.add(photo.id);
    },
    [visibleSet]
  );

  const onOpenImage = useCallback((photo: Photo) => preloadAndSelect(photo), [preloadAndSelect]);

  /**
   * Handles left/right navigation within lightbox.
   */
  const navigate = useCallback(
    (delta: number) => {
      if (!selected || filtered.length === 0) return;
      const currentIndex = filtered.findIndex((p) => p.id === selected.id);

      if (currentIndex === -1) return;
      const nextIndex = (currentIndex + delta + filtered.length) % filtered.length;
      const target = filtered[nextIndex];

      if (target) preloadAndSelect(target);
    },
    [selected, filtered, preloadAndSelect]
  );

  // Keyboard shortcuts for navigation
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setSelected(null);
      else if (e.key === 'ArrowRight') navigate(1);
      else if (e.key === 'ArrowLeft') navigate(-1);
    };

    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [navigate]);

  if (error) {
    return (
      <ApiErrorState
        error={error}
        onRetry={() => refetch().catch(() => {})}
        message="Failed to load images."
      />
    );
  }

  return (
    <section
      className={`galery-page ${loading ? 'hidden' : ''} ${photos.length === 0 ? 'no-content' : ''}`}
      aria-labelledby="galery-title"
    >
      <article className="galery-page-header">
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <GalleryFilters
            open={open}
            category={category}
            setCategory={setCategory}
            setOpen={setOpen}
            gridRef={gridRef}
          />
        </div>
        <span className="galery-page-filter-status" id="galery-title">
          {category === 'Todas'
            ? `Mostrando ${Math.min(endIndex + 1, filtered.length)} de ${filtered.length} fotos`
            : `Filtrando por: ${category} (${Math.min(endIndex + 1, filtered.length)} de ${filtered.length})`}
        </span>
      </article>

      {!loading && !error && photos.length === 0 ? (
        <div className="default-empty-state">
          <ImagesIcon size={64} />
          <h3>No hay imágenes disponibles</h3>
          <p>Aún no se han subido imagenes en este universo</p>
          <button className="default-retry-button" onClick={() => refetch().catch(() => {})}>
            Reintentar
          </button>
        </div>
      ) : (
        <article
          className="galery-page-grid galery-page-grid-virtualized"
          ref={gridRef}
          aria-live="polite"
        >
          <div className="galery-page-grid-inner">
            {filtered.slice(0, endIndex + 1).map((photo, i) => {
              const animate = visibleSet.has(photo.id);
              return (
                <PhotoItem
                  key={photo.id}
                  photo={photo}
                  index={i}
                  onOpen={onOpenImage}
                  animate={animate}
                />
              );
            })}
          </div>
        </article>
      )}

      {selected && (
        <div
          className="galery-page-lightbox-overlay"
          role="dialog"
          aria-modal="true"
          aria-label="Expanded image"
          onClick={() => setSelected(null)}
        >
          <div className="galery-page-lightbox-content" onClick={(e) => e.stopPropagation()}>
            <button
              className="galery-page-lightbox-close"
              aria-label="Close"
              onClick={() => setSelected(null)}
            >
              ✕
            </button>

            <div
              className="galery-page-lightbox-nav galery-page-lightbox-prev"
              onClick={(e) => {
                e.stopPropagation();
                navigate(-1);
              }}
            >
              <button aria-label="Previous" className="galery-page-nav-btn">
                ‹
              </button>
            </div>

            <div className="galery-page-lightbox-inner">
              <img src={selected.image_url} alt={selected.title || `Large photo ${selected.id}`} />
            </div>

            <div
              className="galery-page-lightbox-nav galery-page-lightbox-next"
              onClick={(e) => {
                e.stopPropagation();
                navigate(1);
              }}
            >
              <button aria-label="Next" className="galery-page-nav-btn">
                ›
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default GaleryPage;
