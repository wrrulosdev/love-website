import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import './EditImagesPage.css';
import './AdminSubPage.css';
import { Trash2Icon, SaveIcon, XIcon, ImageIcon } from 'lucide-react';
import type { Photo } from '../../../interfaces/api';
import { fetchPhotosApi, updatePhotoApi, deletePhotoApi } from '../../../services/photosApi';

const EditImagesPage: React.FC = () => {
  const navigate = useNavigate();

  const [, setImages] = useState<Photo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [modalOpen, setModalOpen] = useState(false);
  const [modalImages, setModalImages] = useState<Photo[]>([]);
  const [modalEndIndex, setModalEndIndex] = useState(20);
  const [modalSearch, setModalSearch] = useState('');

  const [selectedImage, setSelectedImage] = useState<Photo | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState('');
  const [category, setCategory] = useState('');
  const [location, setLocation] = useState('');
  const [showInBook, setShowInBook] = useState(false);
  const [showInTimeline, setShowInTimeline] = useState(false);

  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const modalScrollRef = useRef<HTMLDivElement>(null);
  const modalImagesRef = useRef<Photo[]>([]);
  const filteredRef = useRef<Photo[]>([]);

  useEffect(() => {
    loadImages();
  }, []);

  /**
   * Fetches the photo list and simulates a large dataset
   * by repeating items from the API for testing and scrolling.
   */
  const loadImages = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchPhotosApi();

      const repeated = Array.from({ length: 1000 }, (_, i) => ({
        ...data[0],
        id: `fake-${i}`,
        title: `${data[0].title || 'Image'} ${i + 1}`,
      }));

      setImages(repeated);
      setModalImages(repeated);
      modalImagesRef.current = repeated;
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to load images');
    } finally {
      setLoading(false);
    }
  };

  /** Keeps the modal reference in sync when modalImages changes. */
  useEffect(() => {
    modalImagesRef.current = modalImages;
  }, [modalImages]);

  /** Filters images in the modal by title (case-insensitive). */
  const filteredModalImages = useMemo(() => {
    const q = modalSearch.trim().toLowerCase();
    if (!q) return modalImages;
    return modalImages.filter((img) => (img.title || '').toLowerCase().includes(q));
  }, [modalImages, modalSearch]);

  /**
   * Keeps the filtered reference up to date and resets scroll index
   * whenever the search query changes.
   */
  useEffect(() => {
    filteredRef.current = filteredModalImages;
    setModalEndIndex(20);
    if (modalScrollRef.current) modalScrollRef.current.scrollTop = 0;
  }, [modalSearch, filteredModalImages]);

  /**
   * Handles scroll events inside the modal grid.
   * When near the bottom, loads 20 more items.
   */
  const handleModalScroll = useCallback(() => {
    const el = modalScrollRef.current;
    if (!el) return;
    const { scrollTop, scrollHeight, clientHeight } = el;
    const scrollPercentage = (scrollTop + clientHeight) / scrollHeight;

    if (scrollPercentage > 0.8) {
      setModalEndIndex((prev) => {
        const total = filteredRef.current.length;
        if (prev >= total) return prev;
        return Math.min(prev + 20, total);
      });
    }
  }, []);

  /**
   * Registers and cleans up scroll listener only when the modal is open.
   */
  useEffect(() => {
    if (!modalOpen) return;
    const el = modalScrollRef.current;
    if (!el) return;

    el.addEventListener('scroll', handleModalScroll, { passive: true });
    return () => el.removeEventListener('scroll', handleModalScroll);
  }, [modalOpen, handleModalScroll]);

  /**
   * Opens the modal and ensures:
   * - Initial index reset
   * - Scroll starts at top
   * - Expands items until scroll becomes available
   */
  const openModal = () => {
    setModalOpen(true);
    setModalEndIndex(20);

    setTimeout(() => {
      if (modalScrollRef.current) modalScrollRef.current.scrollTop = 0;

      let tries = 0;
      const maxTries = 10;
      const expandInterval = setInterval(() => {
        const el = modalScrollRef.current;
        const total = filteredRef.current.length;
        if (!el || tries >= maxTries) {
          clearInterval(expandInterval);
          return;
        }

        if (el.scrollHeight > el.clientHeight || modalEndIndex >= total) {
          clearInterval(expandInterval);
          return;
        }

        setModalEndIndex((prev) => Math.min(prev + 20, total));
        tries++;
      }, 60);
    }, 0);
  };

  /** Handles selecting an image and populates the form fields. */
  const handleSelectImage = (image: Photo) => {
    setSelectedImage(image);
    setTitle(image.title || '');
    setDescription(image.description || '');
    const formattedDate = image.date ? new Date(image.date).toISOString().split('T')[0] : '';
    setDate(formattedDate);
    setCategory(image.category || '');
    setLocation(image.location || '');
    setShowInBook(image.in_book || false);
    setShowInTimeline(image.in_timeline || false);
    setModalOpen(false);
    setActionError(null);
    setSuccess(false);
  };

  /**
   * Updates the selected image with form data.
   * Displays success and error states accordingly.
   */
  const handleUpdate = async () => {
    if (!selectedImage) return;

    if (!title.trim()) {
      setActionError('Title is required');
      return;
    }
    if (!category) {
      setActionError('Category is required');
      return;
    }
    if (!date) {
      setActionError('Date is required');
      return;
    }

    setSaving(true);
    setActionError(null);
    setSuccess(false);

    try {
      const updateData = {
        id: selectedImage.id,
        title: title.trim(),
        description: description.trim(),
        date: date,
        category: category,
        location: location.trim(),
        in_book: showInBook,
        in_timeline: showInTimeline,
      };

      await updatePhotoApi(updateData);

      const updatedImage = { ...selectedImage, ...updateData };

      setImages((prev) => prev.map((img) => (img.id === selectedImage.id ? updatedImage : img)));
      setModalImages((prev) =>
        prev.map((img) => (img.id === selectedImage.id ? updatedImage : img))
      );

      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: unknown) {
      setActionError(err instanceof Error ? err.message : 'Failed to update image');
    } finally {
      setSaving(false);
    }
  };

  /**
   * Deletes the selected image after user confirmation.
   * Removes it from both state lists.
   */
  const handleDelete = async () => {
    if (!selectedImage) return;

    const confirmed = window.confirm(
      'Are you sure you want to delete this image? This action cannot be undone.'
    );
    if (!confirmed) return;

    setDeleting(true);
    setActionError(null);

    try {
      await deletePhotoApi(selectedImage.id);
      setImages((prev) => prev.filter((img) => img.id !== selectedImage.id));
      setModalImages((prev) => prev.filter((img) => img.id !== selectedImage.id));
      setSelectedImage(null);
      setTitle('');
      setDescription('');
      setDate('');
      setCategory('');
      setLocation('');
      setShowInBook(false);
      setShowInTimeline(false);
    } catch (err: unknown) {
      setActionError(err instanceof Error ? err.message : 'Failed to delete image');
    } finally {
      setDeleting(false);
    }
  };

  /** Navigates back to the admin main page. */
  const handleBack = () => {
    navigate('/admin');
  };

  return (
    <section className="edit-images-page">
      <header className="admin-header">
        <div className="admin-header-content">
          <button onClick={handleBack}>
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <line x1="19" y1="12" x2="5" y2="12"></line>
              <polyline points="12 19 5 12 12 5"></polyline>
            </svg>
            <span>Volver</span>
          </button>
          <div>
            <h1>Editar Imágenes</h1>
            <p>Modifica las constelaciones de recuerdos capturados</p>
          </div>
        </div>
      </header>

      <main className="edit-images-main">
        <div className="edit-images-container">
          {loading ? (
            <div className="edit-images-loading-state">
              <div className="edit-images-loading-spinner-large"></div>
              <p>Cargando imágenes...</p>
            </div>
          ) : error ? (
            <div className="edit-images-error-state">
              <svg
                width="64"
                height="64"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="12" y1="8" x2="12" y2="12"></line>
                <line x1="12" y1="16" x2="12.01" y2="16"></line>
              </svg>
              <p>{error}</p>
              <button onClick={loadImages} className="edit-images-retry-button">
                Reintentar
              </button>
            </div>
          ) : (
            <div className="edit-images-content">
              {!selectedImage ? (
                <div className="edit-images-empty-state">
                  <ImageIcon size={64} />
                  <h3>Selecciona una imagen para editar</h3>
                  <p>Haz clic en el botón para ver todas las imágenes disponibles</p>
                  <button onClick={openModal} className="edit-images-select-button">
                    <ImageIcon size={20} />
                    Seleccionar Imagen
                  </button>
                </div>
              ) : (
                <div className="edit-images-form">
                  <div className="edit-images-form-header">
                    <h2>Editando Imagen</h2>
                    <button onClick={openModal} className="edit-images-change-button">
                      <ImageIcon size={18} />
                      Cambiar Imagen
                    </button>
                  </div>

                  <div className="edit-images-current-image">
                    <img
                      src={selectedImage.image_url}
                      alt={selectedImage.title || 'Imagen seleccionada'}
                    />
                    <div className="edit-images-image-info">
                      <span>ID: {selectedImage.id}</span>
                      {selectedImage.created_at && (
                        <span>
                          Creada: {new Date(selectedImage.created_at).toLocaleDateString('es-ES')}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="edit-images-form-grid">
                    <div className="edit-images-form-group">
                      <label htmlFor="edit-title">Título *</label>
                      <input
                        id="edit-title"
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="Título de la imagen"
                        disabled={saving || deleting}
                      />
                    </div>

                    <div className="edit-images-form-group">
                      <label htmlFor="edit-date">Fecha *</label>
                      <input
                        id="edit-date"
                        type="date"
                        value={date}
                        onChange={(e) => setDate(e.target.value)}
                        disabled={saving || deleting}
                      />
                    </div>

                    <div className="edit-images-form-group edit-images-full-width">
                      <label htmlFor="edit-description">Descripción</label>
                      <textarea
                        id="edit-description"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="Escribe una descripción del recuerdo..."
                        rows={4}
                        disabled={saving || deleting}
                      />
                    </div>

                    <div className="edit-images-form-group">
                      <label htmlFor="edit-category">Categoría *</label>
                      <select
                        id="edit-category"
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        disabled={saving || deleting}
                      >
                        <option value="">Selecciona una categoría</option>
                        <option value="Citas">Citas</option>
                        <option value="Viajes">Viajes</option>
                        <option value="Casual">Casual</option>
                      </select>
                    </div>

                    <div className="edit-images-form-group">
                      <label htmlFor="edit-location">Ubicación</label>
                      <input
                        id="edit-location"
                        type="text"
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                        placeholder="Ubicación de la imagen"
                        disabled={saving || deleting}
                      />
                    </div>

                    <div className="edit-images-form-group edit-images-checkbox-group">
                      <label className="edit-images-checkbox-label">
                        <input
                          type="checkbox"
                          checked={showInBook}
                          onChange={(e) => setShowInBook(e.target.checked)}
                          disabled={saving || deleting}
                        />
                        <span className="edit-images-checkbox-custom"></span>
                        <span>Mostrar en el libro</span>
                      </label>

                      <label className="edit-images-checkbox-label">
                        <input
                          type="checkbox"
                          checked={showInTimeline}
                          onChange={(e) => setShowInTimeline(e.target.checked)}
                          disabled={saving || deleting}
                        />
                        <span className="edit-images-checkbox-custom"></span>
                        <span>Mostrar en línea de tiempo</span>
                      </label>
                    </div>
                  </div>

                  {actionError && (
                    <div className="edit-images-message edit-images-error-message">
                      <svg
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <circle cx="12" cy="12" r="10"></circle>
                        <line x1="12" y1="8" x2="12" y2="12"></line>
                        <line x1="12" y1="16" x2="12.01" y2="16"></line>
                      </svg>
                      <span>{actionError}</span>
                    </div>
                  )}

                  {success && (
                    <div className="edit-images-message edit-images-success-message">
                      <svg
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <polyline points="20 6 9 17 4 12"></polyline>
                      </svg>
                      <span>¡Imagen actualizada exitosamente!</span>
                    </div>
                  )}

                  <div className="edit-images-actions">
                    <button
                      onClick={handleDelete}
                      className="edit-images-delete-button"
                      disabled={saving || deleting}
                    >
                      {deleting ? (
                        <>
                          <span className="edit-images-loading-spinner"></span>
                          Eliminando...
                        </>
                      ) : (
                        <>
                          <Trash2Icon size={20} />
                          Eliminar
                        </>
                      )}
                    </button>

                    <button
                      onClick={handleUpdate}
                      className="edit-images-save-button"
                      disabled={saving || deleting || !title.trim() || !category || !date}
                    >
                      {saving ? (
                        <>
                          <span className="edit-images-loading-spinner"></span>
                          Guardando...
                        </>
                      ) : (
                        <>
                          <SaveIcon size={20} />
                          Guardar Cambios
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </main>

      {modalOpen && (
        <div className="edit-images-modal-overlay" onClick={() => setModalOpen(false)}>
          <div className="edit-images-modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="edit-images-modal-header">
              <h2>Selecciona una imagen</h2>
              <button
                onClick={() => setModalOpen(false)}
                className="edit-images-modal-close"
                aria-label="Cerrar"
              >
                <XIcon size={24} />
              </button>
            </div>

            <div className="edit-images-modal-search">
              <input
                type="search"
                placeholder="Buscar por título..."
                value={modalSearch}
                onChange={(e) => setModalSearch(e.target.value)}
                aria-label="Buscar imágenes por título"
              />
              {modalSearch && (
                <button
                  type="button"
                  className="edit-images-modal-clear"
                  onClick={() => setModalSearch('')}
                  aria-label="Limpiar búsqueda"
                >
                  ×
                </button>
              )}
              <span className="edit-images-modal-meta">
                {filteredModalImages.length} resultados
              </span>
            </div>

            <div className="edit-images-modal-grid" ref={modalScrollRef}>
              {filteredModalImages.length === 0 ? (
                <div className="edit-images-modal-empty">
                  <p>{modalSearch ? 'No se encontraron resultados' : 'No hay imágenes'}</p>
                </div>
              ) : (
                <>
                  {filteredModalImages.slice(0, modalEndIndex).map((image) => (
                    <div
                      key={image.id}
                      className="edit-images-modal-item"
                      onClick={() => handleSelectImage(image)}
                    >
                      <div className="edit-images-modal-thumbnail">
                        <img src={image.image_url} alt={image.title || `Imagen ${image.id}`} />
                        <div className="edit-images-modal-overlay-info">
                          <span className="edit-images-modal-category">{image.category}</span>
                          {image.in_book && <span className="edit-images-modal-book">📖</span>}
                          {image.in_timeline && (
                            <span className="edit-images-modal-timeline">📅</span>
                          )}
                        </div>
                      </div>
                      <div className="edit-images-modal-info">
                        <h3>{image.title || 'Sin título'}</h3>
                        <p>
                          {image.date
                            ? new Date(image.date).toLocaleDateString('es-ES')
                            : 'Sin fecha'}
                        </p>
                      </div>
                    </div>
                  ))}

                  {modalEndIndex < filteredModalImages.length && (
                    <div className="edit-images-modal-loading">
                      <div className="edit-images-loading-spinner-small"></div>
                      <p>Cargando más imágenes...</p>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default EditImagesPage;
