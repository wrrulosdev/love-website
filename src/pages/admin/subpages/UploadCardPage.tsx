import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './UploadCardPage.css';
import './AdminSubPage.css';
import { uploadCardApi } from '../../../services/cardsApi';

const UploadCardPage: React.FC = () => {
  const navigate = useNavigate();

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [cardDate, setCardDate] = useState('');
  const [author, setAuthor] = useState('');
  const [imageUrl, setImageUrl] = useState<string>('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  /**
   * Handles form submission for uploading a new card.
   * Performs field validation and sends data to the API.
   *
   * @param {React.FormEvent} e - Form submission event
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!imageUrl.trim()) {
      setError('La URL de la imagen es obligatoria.');
      return;
    }

    if (!title.trim()) {
      setError('El título es obligatorio.');
      return;
    }

    if (!content.trim()) {
      setError('El contenido es obligatorio.');
      return;
    }

    if (!cardDate) {
      setError('La fecha es obligatoria.');
      return;
    }

    if (!author.trim()) {
      setError('El autor es obligatorio.');
      return;
    }

    setError(null);
    setLoading(true);
    setSuccess(false);

    try {
      const formData = new FormData();
      formData.append('image_url', imageUrl.trim());
      formData.append('title', title.trim());
      formData.append('content', content.trim());
      formData.append('card_date', cardDate);
      formData.append('author', author.trim());

      const response = await uploadCardApi(formData);

      setSuccess(true);
      setTitle('');
      setContent('');
      setCardDate('');
      setAuthor('');
      setImageUrl('');
      console.log('Card uploaded successfully:', response);
    } catch (err: any) {
      console.error('Error uploading card:', err);
      setError(
        err?.message || 'Ocurrió un error al subir la carta. Por favor, intenta nuevamente.'
      );
    } finally {
      setLoading(false);
    }
  };

  /**
   * Navigates back to the admin dashboard.
   */
  const handleBack = () => {
    navigate('/admin');
  };

  return (
    <section className="upload-card-page">
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
            <h1>Subir Nueva Carta</h1>
            <p>Agrega una nueva carta especial a la colección</p>
          </div>
        </div>
      </header>

      <main className="upload-card-main">
        <div className="upload-card-container">
          <div className="upload-card-form">
            <div className="upload-card-form-grid">
              <div className="upload-card-form-group">
                <label htmlFor="imageUrl">URL de la Imagen</label>
                <input
                  id="imageUrl"
                  type="text"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  placeholder="https://enlace-de-imagen.com"
                  required
                  disabled={loading}
                />
              </div>

              <div className="upload-card-form-group">
                <label htmlFor="title">Título</label>
                <input
                  id="title"
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Título de la carta"
                  required
                  disabled={loading}
                />
              </div>

              <div className="upload-card-form-group">
                <label htmlFor="author">Autor</label>
                <input
                  id="author"
                  type="text"
                  value={author}
                  onChange={(e) => setAuthor(e.target.value)}
                  placeholder="¿Quién escribió esta carta?"
                  required
                  disabled={loading}
                />
              </div>

              <div className="upload-card-form-group">
                <label htmlFor="cardDate">Fecha</label>
                <input
                  id="cardDate"
                  type="date"
                  value={cardDate}
                  onChange={(e) => setCardDate(e.target.value)}
                  required
                  disabled={loading}
                />
              </div>

              <div className="upload-card-form-group upload-card-full-width">
                <label htmlFor="content">Contenido</label>
                <textarea
                  id="content"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Escribe el contenido de la carta..."
                  rows={8}
                  required
                  disabled={loading}
                />
              </div>
            </div>

            {error && (
              <div className="upload-card-message upload-card-error-message">
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
                <span>{error}</span>
              </div>
            )}

            {success && (
              <div className="upload-card-message upload-card-success-message">
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
                <span>¡Carta subida exitosamente!</span>
              </div>
            )}

            <button
              type="button"
              onClick={handleSubmit}
              className="upload-card-submit-button"
              disabled={
                loading ||
                !imageUrl.trim() ||
                !title.trim() ||
                !content.trim() ||
                !cardDate ||
                !author.trim()
              }
            >
              {loading ? (
                <>
                  <span className="upload-card-loading-spinner"></span>
                  Subiendo...
                </>
              ) : (
                <>
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                    <polyline points="17 8 12 3 7 8"></polyline>
                    <line x1="12" y1="3" x2="12" y2="15"></line>
                  </svg>
                  Subir Carta
                </>
              )}
            </button>
          </div>
        </div>
      </main>
    </section>
  );
};

export default UploadCardPage;
