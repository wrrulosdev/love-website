import React, { useState, useEffect } from 'react';
import { MailIcon, XIcon, CalendarIcon, UserIcon } from 'lucide-react';
import { useLoading } from '../../../context/LoadingContext';
import ApiErrorState from '../../../components/errorstate/ApiErrorState';
import { useCards } from '../../../hooks/useCards';
import type { Card } from '../../../interfaces/api';
import './CardsPage.css';

const CardsPage: React.FC = () => {
  const { show, hide } = useLoading();
  const { cards, loading, error, refetch } = useCards();
  const [selectedcard, setSelectedcard] = useState<Card | null>(null);
  const photos = [1];

  /**
   * Toggles the loading spinner when the cards are being fetched.
   */
  useEffect(() => {
    if (loading) {
      show('Cargando cartas...');
    } else {
      hide();
    }
  }, [loading, show, hide]);

  /**
   * Opens a specific card in the modal view.
   *
   * @param {Card} card - The card to display.
   */
  const opencard = (card: Card) => {
    setSelectedcard(card);
  };

  /**
   * Closes the open card modal.
   */
  const closecard = () => {
    setSelectedcard(null);
  };

  /**
   * Allows closing the modal by pressing the "Escape" key.
   */
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closecard();
    };

    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  if (error) {
    return (
      <ApiErrorState
        error={error}
        onRetry={() => refetch().catch(() => {})}
        message="No pudimos cargar las cartas."
      />
    );
  }

  return (
    <section className="cards-page">
      <main className="cards-page-main">
        <div className="cards-page-container">
          {!loading && !error && photos.length === 0 ? (
            <div className="default-empty-state">
              <MailIcon size={64} />
              <h3>No hay cartas disponibles</h3>
              <p>Aún no se han escrito mensajes en este universo</p>
              <button className="default-retry-button" onClick={() => refetch().catch(() => {})}>
                Reintentar
              </button>
            </div>
          ) : (
            <div className="cards-page-grid">
              {cards.map((card, index) => (
                <article
                  key={card.id}
                  className="cards-page-card cards-page-card-visible"
                  onClick={() => opencard(card)}
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className="cards-page-card-header">
                    <div className="cards-page-card-icon">
                      <MailIcon size={24} />
                    </div>
                    <div className="cards-page-card-meta">
                      <h3>{card.title}</h3>
                      <div className="cards-page-card-info">
                        <span>
                          <CalendarIcon size={14} />
                          {new Date(card.card_date).toLocaleDateString('es-ES', {
                            day: 'numeric',
                            month: 'long',
                            year: 'numeric',
                          })}
                        </span>
                        <span>
                          <UserIcon size={14} />
                          {card.author}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="cards-page-card-preview">
                    <p>{card.content.substring(0, 150)}...</p>
                  </div>

                  <div className="cards-page-card-footer">
                    <span className="cards-page-card-read">Leer carta completa</span>
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <line x1="5" y1="12" x2="19" y2="12"></line>
                      <polyline points="12 5 19 12 12 19"></polyline>
                    </svg>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </main>

      {selectedcard && (
        <div
          className="cards-page-modal-overlay"
          onClick={closecard}
          role="dialog"
          aria-modal="true"
          aria-labelledby="card-title"
        >
          <div className="cards-page-modal-content" onClick={(e) => e.stopPropagation()}>
            <button
              className="cards-page-modal-close"
              onClick={closecard}
              aria-label="Cerrar carta"
            >
              <XIcon size={24} />
            </button>

            <div className="cards-page-modal-inner">
              {selectedcard.image_url && (
                <div className="cards-page-modal-image">
                  <img src={selectedcard.image_url} alt={selectedcard.title} />
                </div>
              )}

              <div className="cards-page-modal-card">
                <div className="cards-page-modal-header">
                  <div className="cards-page-modal-seal">
                    <MailIcon size={32} />
                  </div>
                  <h2 id="card-title">{selectedcard.title}</h2>
                  <div className="cards-page-modal-meta">
                    <span>
                      <CalendarIcon size={16} />
                      {new Date(selectedcard.card_date).toLocaleDateString('es-ES', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric',
                      })}
                    </span>
                    <span>
                      <UserIcon size={16} />
                      {selectedcard.author}
                    </span>
                  </div>
                </div>

                <div className="cards-page-modal-body">
                  <div className="cards-page-modal-content-text">
                    {selectedcard.content.split('\n').map((paragraph, index) => (
                      <p key={index}>{paragraph}</p>
                    ))}
                  </div>
                </div>

                <div className="cards-page-modal-footer">
                  <div className="cards-page-modal-signature">
                    <div className="cards-page-modal-signature-line"></div>
                    <span>Con amor, {selectedcard.author}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default CardsPage;
