import React, { useEffect, useMemo, useCallback, useState } from 'react';
import './GaleryPage.css';
import type { FilterOption } from '../../../interfaces/photo';
import { useVirtualGrid } from '../../../hooks/useVirtualGrid';
import { usePhotos } from '../../../hooks/usePhotos';
import PhotoItem from './PhotoItem';
import type { Photo } from '../../../interfaces/api';
import { useLoading } from '../../../context/LoadingContext';
import ApiErrorState from '../../../components/errorstate/ApiErrorState';
import { ImagesIcon, ArrowUp, ArrowDown } from 'lucide-react';

// Filter categories for gallery
const FILTERS: FilterOption[] = ['Todas', 'Citas', 'Viajes', 'Casual'];

/**
 * Dropdown component for gallery filters.
 * Allows selecting a photo category and resetting the scroll position.
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
      Filtros <span className="galery-page-chev">▾</span>
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

/**
 * GaleryPage component displays a virtualized gallery of photos
 * fetched from the API with optional category filters.
 * Includes lightbox modal for viewing individual images in full size.
 */
const GaleryPage: React.FC = () => {
  const { show, hide } = useLoading();
  const { category, setCategory, photos, loading, error, refetch, source } = usePhotos(
    'Todas',
    'images'
  );

  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<Photo | null>(null);
  const { gridRef, endIndex, visibleSet, markVisible } = useVirtualGrid();
  const [sortAsc, setSortAsc] = useState<boolean>(false);

  /**
   * Filter photos by category.
   * If category is "Todas" or source is 'book', show all photos.
   */
  const baseFiltered = useMemo(
    () =>
      category === 'Todas' || source === 'book'
        ? photos
        : photos.filter((p) => p.category?.toLowerCase() === category.toLowerCase()),
    [category, photos, source]
  );

  /**
   * Sort the filtered results by date according to sortAsc.
   * We try several common date fields (date, created_at, taken_at, createdAt, timestamp).
   * If no date is parseable we fall back to 0 so those items appear first/last consistently.
   */
  const filtered = useMemo(() => {
    const getTime = (p: Photo): number => {
      const candidate =
        (p as Partial<Record<string, unknown>>).date ??
        (p as Partial<Record<string, unknown>>).created_at ??
        (p as Partial<Record<string, unknown>>).taken_at ??
        (p as Partial<Record<string, unknown>>).createdAt ??
        (p as Partial<Record<string, unknown>>).timestamp ??
        (p as Partial<Record<string, unknown>>).time ??
        null;

      if (candidate == null) return 0;
      if (typeof candidate === 'number') return candidate;
      const parsed = Date.parse(String(candidate));
      return isNaN(parsed) ? 0 : parsed;
    };

    const arr = [...baseFiltered];
    arr.sort((a, b) => {
      const ta = getTime(a);
      const tb = getTime(b);
      return sortAsc ? ta - tb : tb - ta;
    });
    return arr;
  }, [baseFiltered, sortAsc]);

  /**
   * Show or hide the global loader when photos are loading
   */
  useEffect(() => {
    if (loading) show('Loading photos...');
    else hide();
  }, [loading, show, hide]);

  /**
   * Mark photos as visible in the virtual grid once rendered.
   */
  useEffect(() => {
    if (filtered.length > 0 && endIndex >= 0) {
      markVisible(filtered);
    }
  }, [filtered, endIndex, markVisible]);

  /**
   * Preload image and select it for the lightbox.
   * Ensures smooth rendering by decoding images before display.
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

      if (img.decode) {
        img.decode().then(set).catch(set);
      } else {
        img.onload = set;
        img.onerror = set;
      }

      visibleSet.add(photo.id);
    },
    [visibleSet]
  );

  // Open image in lightbox
  const onOpenImage = useCallback((photo: Photo) => preloadAndSelect(photo), [preloadAndSelect]);

  /**
   * Navigate between images in the lightbox.
   *
   * @param {number} delta - Number of steps to move (1 = next, -1 = previous)
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

  /**
   * Keyboard navigation for lightbox:
   * - Esc closes the lightbox
   * - ArrowRight goes to next image
   * - ArrowLeft goes to previous image
   */
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
        message="No pudimos cargar las imágenes."
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

          <button
            type="button"
            className="galery-page-sort-btn"
            onClick={() => {
              setSortAsc((s) => !s);
              if (gridRef.current) gridRef.current.scrollTop = 0;
            }}
            aria-pressed={!sortAsc}
            aria-label={
              sortAsc
                ? 'Orden actual: viejas a nuevas. Cambiar a nuevas a viejas'
                : 'Orden actual: nuevas a viejas. Cambiar a viejas a nuevas'
            }
            title={sortAsc ? 'Viejas → Nuevas' : 'Nuevas → Viejas'}
          >
            {sortAsc ? <ArrowDown size={18} /> : <ArrowUp size={18} />}
          </button>
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
