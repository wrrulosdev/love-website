import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './UploadCardPage.css';
import './AdminSubPage.css';
import { uploadCardApi } from '../../../services/cardsApi';
import { ArrowLeft, AlertCircle, CheckCircle, Upload } from 'lucide-react';

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
      const response = await uploadCardApi({
        title: title.trim(),
        content: content.trim(),
        image_url: imageUrl.trim(),
        card_date: cardDate.trim(),
        author: author.trim(),
      });

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

  const handleBack = () => {
    navigate('/admin');
  };

  return (
    <section className="upload-card-page">
      <header className="admin-header">
        <div className="admin-header-content">
          <button onClick={handleBack}>
            <ArrowLeft size={20} />
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
                <AlertCircle size={20} />
                <span>{error}</span>
              </div>
            )}

            {success && (
              <div className="upload-card-message upload-card-success-message">
                <CheckCircle size={20} />
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
                  <Upload size={20} />
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
