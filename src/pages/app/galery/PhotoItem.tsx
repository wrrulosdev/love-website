import React from 'react';
import type { Photo } from '../../../interfaces/api';

/**
 * PhotoItem represents a single photo in the GaleryPage grid.
 * It supports lazy loading, animation on appear, and click to open in lightbox.
 *
 * Wrapped with React.memo for performance to prevent unnecessary re-renders.
 *
 * @param {Photo} photo - Photo data object from API
 * @param {number} index - Index in the list, used to calculate animation delay
 * @param {(p: Photo) => void} onOpen - Callback when photo is clicked (opens lightbox)
 * @param {boolean} animate - Whether to apply entry animation
 */
export default React.memo(function PhotoItem({
  photo,
  index,
  onOpen,
  animate,
}: {
  photo: Photo;
  index: number;
  onOpen: (p: Photo) => void;
  animate: boolean;
}) {
  const delay = Math.min(index * 40, 600);

  return (
    <div
      className={`galery-page-item ${animate ? 'galery-page-item-is-visible' : ''}`}
      data-photo-id={photo.id}
      data-index={index}
      style={{
        transitionDelay: `${delay}ms`,
      }}
    >
      <button
        className="galery-page-img-btn"
        onClick={() => onOpen(photo)}
        aria-label={`Open image ${photo.title || photo.id}`}
      >
        <img
          src={photo.image_url}
          alt={photo.title ? `Photo ${photo.title}` : `Photo ${photo.id}`}
          loading="lazy"
          decoding="async"
        />
      </button>
      <div className="galery-page-caption">{photo.category}</div>
      {photo.title && <div className="galery-page-title">{photo.title}</div>}
    </div>
  );
});
