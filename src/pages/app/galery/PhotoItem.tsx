import React from 'react';
import type { Photo } from '../../../interfaces/api';

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
        aria-label={`Abrir imagen ${photo.title || photo.id}`}
      >
        <img
          src={photo.image_url}
          alt={photo.title ? `Foto ${photo.title}` : `Foto ${photo.id}`}
          loading="lazy"
          decoding="async"
        />
      </button>
      <div className="galery-page-caption">{photo.category}</div>
      {photo.title && <div className="galery-page-title">{photo.title}</div>}
    </div>
  );
});
