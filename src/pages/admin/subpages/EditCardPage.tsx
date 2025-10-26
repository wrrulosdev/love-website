import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import './EditCardPage.css';
import './AdminSubPage.css';
import {
  Trash2Icon,
  SaveIcon,
  XIcon,
  FileTextIcon,
  Loader2Icon,
  AlertCircleIcon,
  CheckCircleIcon,
  ArrowLeftIcon,
} from 'lucide-react';
import type { Card } from '../../../interfaces/api';
import { getCards, updateCardApi, deleteCardApi } from '../../../services/cardsApi';

const EditCardPage: React.FC = () => {
  const navigate = useNavigate();

  const [, setCards] = useState<Card[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [modalOpen, setModalOpen] = useState(false);
  const [modalCards, setModalCards] = useState<Card[]>([]);
  const [modalEndIndex, setModalEndIndex] = useState(20);
  const [modalSearch, setModalSearch] = useState('');

  const [selectedCard, setSelectedCard] = useState<Card | null>(null);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [cardDate, setCardDate] = useState('');
  const [author, setAuthor] = useState('');
  const [imageUrl, setImageUrl] = useState('');

  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const modalScrollRef = useRef<HTMLDivElement>(null);
  const modalCardsRef = useRef<Card[]>([]);
  const filteredRef = useRef<Card[]>([]);

  useEffect(() => {
    loadCards();
  }, []);

  const loadCards = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getCards();
      setCards(data);
      setModalCards(data);
      modalCardsRef.current = data;
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error al cargar las cartas');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    modalCardsRef.current = modalCards;
  }, [modalCards]);

  const filteredModalCards = useMemo(() => {
    const q = modalSearch.trim().toLowerCase();
    if (!q) return modalCards;
    return modalCards.filter(
      (card) =>
        (card.title || '').toLowerCase().includes(q) ||
        (card.author || '').toLowerCase().includes(q) ||
        (card.content || '').toLowerCase().includes(q)
    );
  }, [modalCards, modalSearch]);

  useEffect(() => {
    filteredRef.current = filteredModalCards;
    setModalEndIndex(20);
    if (modalScrollRef.current) modalScrollRef.current.scrollTop = 0;
  }, [modalSearch, filteredModalCards]);

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

  useEffect(() => {
    if (!modalOpen) return;
    const el = modalScrollRef.current;
    if (!el) return;

    el.addEventListener('scroll', handleModalScroll, { passive: true });
    return () => el.removeEventListener('scroll', handleModalScroll);
  }, [modalOpen, handleModalScroll]);

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

  const handleSelectCard = (card: Card) => {
    setSelectedCard(card);
    setTitle(card.title || '');
    setContent(card.content || '');
    const formattedDate = card.card_date
      ? new Date(card.card_date).toISOString().split('T')[0]
      : '';
    setCardDate(formattedDate);
    setAuthor(card.author || '');
    setImageUrl(card.image_url || '');
    setModalOpen(false);
    setActionError(null);
    setSuccess(false);
  };

  const handleUpdate = async () => {
    if (!selectedCard) return;

    if (!title.trim()) return setActionError('El título es requerido');
    if (!content.trim()) return setActionError('El contenido es requerido');
    if (!cardDate) return setActionError('La fecha es requerida');
    if (!author.trim()) return setActionError('El autor es requerido');
    if (!imageUrl.trim()) return setActionError('La URL de la imagen es requerida');

    setSaving(true);
    setActionError(null);
    setSuccess(false);

    try {
      const updateData = {
        title: title.trim(),
        content: content.trim(),
        card_date: cardDate,
        author: author.trim(),
        image_url: imageUrl.trim(),
      };

      await updateCardApi(selectedCard.id, updateData);

      const updatedCard = { ...selectedCard, ...updateData };
      setCards((prev) => prev.map((card) => (card.id === selectedCard.id ? updatedCard : card)));
      setModalCards((prev) =>
        prev.map((card) => (card.id === selectedCard.id ? updatedCard : card))
      );

      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: unknown) {
      setActionError(err instanceof Error ? err.message : 'Error al actualizar la carta');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedCard) return;

    const confirmed = window.confirm('¿Estás seguro de que quieres eliminar esta carta?');
    if (!confirmed) return;

    setDeleting(true);
    setActionError(null);

    try {
      await deleteCardApi(selectedCard.id);
      setCards((prev) => prev.filter((card) => card.id !== selectedCard.id));
      setModalCards((prev) => prev.filter((card) => card.id !== selectedCard.id));
      setSelectedCard(null);
      setTitle('');
      setContent('');
      setCardDate('');
      setAuthor('');
      setImageUrl('');
    } catch (err: unknown) {
      setActionError(err instanceof Error ? err.message : 'Error al eliminar la carta');
    } finally {
      setDeleting(false);
    }
  };

  const handleBack = () => navigate('/admin');

  return (
    <section className="edit-card-page">
      <header className="admin-header">
        <div className="admin-header-content">
          <button onClick={handleBack}>
            <ArrowLeftIcon size={20} />
            <span>Volver</span>
          </button>
          <div>
            <h1>Editar Cartas</h1>
            <p>Modifica las cartas especiales de la colección</p>
          </div>
        </div>
      </header>

      <main className="edit-card-main">
        <div className="edit-card-container">
          {loading ? (
            <div className="edit-card-loading-state">
              <Loader2Icon className="edit-card-loading-spinner-large" size={64} />
              <p>Cargando cartas...</p>
            </div>
          ) : error ? (
            <div className="edit-card-error-state">
              <AlertCircleIcon size={64} />
              <p>{error}</p>
              <button onClick={loadCards} className="edit-card-retry-button">
                Reintentar
              </button>
            </div>
          ) : (
            <div className="edit-card-content">
              {!selectedCard ? (
                <div className="edit-card-empty-state">
                  <FileTextIcon size={64} />
                  <h3>Selecciona una carta para editar</h3>
                  <p>Haz clic en el botón para ver todas las cartas disponibles</p>
                  <button onClick={openModal} className="edit-card-select-button">
                    <FileTextIcon size={20} />
                    Seleccionar Carta
                  </button>
                </div>
              ) : (
                <div className="edit-card-form">
                  <div className="edit-card-form-header">
                    <h2>Editando Carta</h2>
                    <button onClick={openModal} className="edit-card-change-button">
                      <FileTextIcon size={18} />
                      Cambiar Carta
                    </button>
                  </div>

                  <div className="edit-card-current-image">
                    <img
                      src={selectedCard.image_url}
                      alt={selectedCard.title || 'Carta seleccionada'}
                    />
                    <div className="edit-card-image-info">
                      <span>ID: {selectedCard.id}</span>
                      {selectedCard.created_at && (
                        <span>
                          Creada: {new Date(selectedCard.created_at).toLocaleDateString('es-ES')}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="edit-card-form-grid">
                    <div className="edit-card-form-group">
                      <label htmlFor="edit-title">Título *</label>
                      <input
                        id="edit-title"
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="Título de la carta"
                        disabled={saving || deleting}
                      />
                    </div>

                    <div className="edit-card-form-group">
                      <label htmlFor="edit-author">Autor *</label>
                      <input
                        id="edit-author"
                        type="text"
                        value={author}
                        onChange={(e) => setAuthor(e.target.value)}
                        placeholder="¿Quién escribió esta carta?"
                        disabled={saving || deleting}
                      />
                    </div>

                    <div className="edit-card-form-group">
                      <label htmlFor="edit-date">Fecha *</label>
                      <input
                        id="edit-date"
                        type="date"
                        value={cardDate}
                        onChange={(e) => setCardDate(e.target.value)}
                        disabled={saving || deleting}
                      />
                    </div>

                    <div className="edit-card-form-group">
                      <label htmlFor="edit-image-url">URL de la Imagen *</label>
                      <input
                        id="edit-image-url"
                        type="url"
                        value={imageUrl}
                        onChange={(e) => setImageUrl(e.target.value)}
                        placeholder="https://ejemplo.com/imagen.jpg"
                        disabled={saving || deleting}
                      />
                    </div>

                    <div className="edit-card-form-group edit-card-full-width">
                      <label htmlFor="edit-content">Contenido *</label>
                      <textarea
                        id="edit-content"
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        placeholder="Escribe el contenido de la carta..."
                        rows={8}
                        disabled={saving || deleting}
                      />
                    </div>
                  </div>

                  {actionError && (
                    <div className="edit-card-message edit-card-error-message">
                      <AlertCircleIcon size={20} />
                      <span>{actionError}</span>
                    </div>
                  )}

                  {success && (
                    <div className="edit-card-message edit-card-success-message">
                      <CheckCircleIcon size={20} />
                      <span>¡Carta actualizada exitosamente!</span>
                    </div>
                  )}

                  <div className="edit-card-actions">
                    <button
                      onClick={handleDelete}
                      className="edit-card-delete-button"
                      disabled={saving || deleting}
                    >
                      {deleting ? (
                        <>
                          <Loader2Icon className="edit-card-loading-spinner" size={20} />
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
                      className="edit-card-save-button"
                      disabled={
                        saving ||
                        deleting ||
                        !title.trim() ||
                        !content.trim() ||
                        !cardDate ||
                        !author.trim() ||
                        !imageUrl.trim()
                      }
                    >
                      {saving ? (
                        <>
                          <Loader2Icon className="edit-card-loading-spinner" size={20} />
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
        <div className="edit-card-modal-overlay" onClick={() => setModalOpen(false)}>
          <div className="edit-card-modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="edit-card-modal-header">
              <h2>Selecciona una carta</h2>
              <button
                onClick={() => setModalOpen(false)}
                className="edit-card-modal-close"
                aria-label="Cerrar"
              >
                <XIcon size={24} />
              </button>
            </div>

            <div className="edit-card-modal-search">
              <input
                type="search"
                placeholder="Buscar por título, autor o contenido..."
                value={modalSearch}
                onChange={(e) => setModalSearch(e.target.value)}
                aria-label="Buscar cartas"
              />
              {modalSearch && (
                <button
                  type="button"
                  className="edit-card-modal-clear"
                  onClick={() => setModalSearch('')}
                  aria-label="Limpiar búsqueda"
                >
                  <XIcon size={20} />
                </button>
              )}
              <span className="edit-card-modal-meta">{filteredModalCards.length} resultados</span>
            </div>

            <div className="edit-card-modal-grid" ref={modalScrollRef}>
              {filteredModalCards.length === 0 ? (
                <div className="edit-card-modal-empty">
                  <p>{modalSearch ? 'No se encontraron resultados' : 'No hay cartas'}</p>
                </div>
              ) : (
                <>
                  {filteredModalCards.slice(0, modalEndIndex).map((card) => (
                    <div
                      key={card.id}
                      className="edit-card-modal-item"
                      onClick={() => handleSelectCard(card)}
                    >
                      <div className="edit-card-modal-thumbnail">
                        <img src={card.image_url} alt={card.title || `Carta ${card.id}`} />
                        <div className="edit-card-modal-overlay-info">
                          <span className="edit-card-modal-author">{card.author}</span>
                        </div>
                      </div>
                      <div className="edit-card-modal-info">
                        <h3>{card.title || 'Sin título'}</h3>
                        <p className="edit-card-modal-text">
                          {card.content && card.content.length > 80
                            ? `${card.content.substring(0, 80)}...`
                            : card.content || 'Sin contenido'}
                        </p>
                        <p className="edit-card-modal-date">
                          {card.card_date
                            ? new Date(card.card_date).toLocaleDateString('es-ES')
                            : 'Sin fecha'}
                        </p>
                      </div>
                    </div>
                  ))}

                  {modalEndIndex < filteredModalCards.length && (
                    <div className="edit-card-modal-loading">
                      <Loader2Icon className="edit-card-loading-spinner-small" size={20} />
                      <p>Cargando más cartas...</p>
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

export default EditCardPage;
