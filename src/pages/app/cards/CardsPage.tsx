import React, { useState, useEffect } from 'react';
import './cardsPage.css';
import { MailIcon, XIcon, CalendarIcon, UserIcon } from 'lucide-react';
import { useLoading } from '../../../context/LoadingContext';

interface Card {
  id: string;
  title: string;
  date: string;
  content: string;
  author: string;
  imageUrl?: string;
}

const fetchcardsApi = async (): Promise<Card[]> => {
  await new Promise((resolve) => setTimeout(resolve, 800));

  return [
    {
      id: '1',
      title: 'Ejemplo',
      date: '2025-10-02',
      content: 'Ejemplo',
      author: 'Pedro',
      imageUrl: 'https://images.pedroysofia.com/images/IMG_20250402_200622.jpg',
    },
    {
      id: '2',
      title: 'Ejemplo',
      date: '2025-10-04',
      content: 'Ejemplo',
      author: 'Pedro',
      imageUrl: 'https://images.pedroysofia.com/images/IMG_20250402_200622.jpg',
    },
    {
      id: '3',
      title: 'Ejemplo',
      date: '2025-10-05',
      content: 'Ejemplo',
      author: 'Pedro',
      imageUrl: 'https://images.pedroysofia.com/images/IMG_20250402_200622.jpg0',
    },
  ];
};

const CardsPage: React.FC = () => {
  const { show, hide } = useLoading();
  const [cards, setcards] = useState<Card[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedcard, setSelectedcard] = useState<Card | null>(null);
  const photos = [1];

  useEffect(() => {
    if (loading) {
      show('Cargando cartas...');
    } else {
      hide();
    }
  }, [loading, show, hide]);

  useEffect(() => {
    loadcards();
  }, []);

  const loadcards = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchcardsApi();
      setcards(data);
    } catch (err: any) {
      setError(err?.message || 'Error al cargar las cartas');
    } finally {
      setLoading(false);
    }
  };

  const opencard = (card: Card) => {
    setSelectedcard(card);
  };

  const closecard = () => {
    setSelectedcard(null);
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closecard();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

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
                          {new Date(card.date).toLocaleDateString('es-ES', {
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
              {selectedcard.imageUrl && (
                <div className="cards-page-modal-image">
                  <img src={selectedcard.imageUrl} alt={selectedcard.title} />
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
                      {new Date(selectedcard.date).toLocaleDateString('es-ES', {
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
