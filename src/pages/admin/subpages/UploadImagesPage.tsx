import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { EditIcon, ImageIcon } from 'lucide-react';
import { uploadImageApi } from '../../../services/photosApi';
import './UploadImagesPage.css';
import './AdminSubPage.css';

const UploadImagesPage: React.FC = () => {
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState('');
  const [category, setCategory] = useState('');
  const [location, setLocation] = useState('');
  const [showInBook, setShowInBook] = useState(false);
  const [showInTimeline, setShowInTimeline] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];

    if (file) {
      if (file.size > 50 * 1024 * 1024) {
        setError('El archivo es demasiado grande. Máximo 50MB permitido.');
        return;
      }

      const validTypes = ['image/jpeg', 'image/png', 'image/gif'];
      if (!validTypes.includes(file.type)) {
        setError('Formato de archivo no válido. Solo se permiten JPG, PNG o GIF.');
        return;
      }

      setImageFile(file);
      setError(null);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!imageFile) {
      setError('Debes seleccionar una imagen');
      return;
    }

    if (!category) {
      setError('Debes seleccionar una categoría');
      return;
    }

    if (!location) {
      setError('Debes seleccionar una ubicación');
    }

    if (!date) {
      setError('Debes seleccionar una fecha');
      return;
    }

    if (!title.trim()) {
      setError('Debes ingresar un título');
      return;
    }

    setError(null);
    setLoading(true);
    setSuccess(false);

    try {
      const formData = new FormData();
      formData.append('file', imageFile);
      formData.append('title', title.trim());
      formData.append('description', description.trim());
      formData.append('date', date);
      formData.append('category', category);
      formData.append('location', location);
      formData.append('in_book', String(showInBook));
      formData.append('in_timeline', String(showInTimeline));

      const response = await uploadImageApi(formData);

      setSuccess(true);
      setTitle('');
      setDescription('');
      setDate('');
      setCategory('');
      setLocation('');
      setShowInBook(false);
      setShowInTimeline(false);
      setImageFile(null);
      setImagePreview(null);

      const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
      if (fileInput) fileInput.value = '';

      console.log('Imagen subida exitosamente:', response.url);
    } catch (err: any) {
      console.error('Error al subir imagen:', err);
      setError(err?.message || 'Error al subir la imagen. Por favor, intenta nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    navigate('/admin');
  };

  return (
    <section className="upload-images-page">
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
            <h1>Subir Nueva Imagen</h1>
            <p>Añade una nueva fotografía a nuestra galería estelar</p>
          </div>
        </div>
      </header>

      <main className="upload-images-main">
        <div className="upload-images-container">
          <div className="upload-images-form">
            <div className="upload-images-form-section">
              <label>
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/gif"
                  onChange={handleImageChange}
                  disabled={loading}
                />
                <div className="upload-images-upload-area">
                  {imagePreview ? (
                    <div className="upload-images-preview">
                      <img src={imagePreview} alt="Preview" />
                      <div className="upload-images-change-image">
                        <EditIcon size={24} />
                        <span>Cambiar imagen</span>
                      </div>
                    </div>
                  ) : (
                    <div className="upload-images-placeholder">
                      <ImageIcon size={48} />
                      <span>Selecciona una imagen</span>
                      <span className="upload-images-hint">JPG, PNG o GIF - Máx 10MB</span>
                    </div>
                  )}
                </div>
              </label>
            </div>

            <div className="upload-images-form-grid">
              <div className="upload-images-form-group">
                <label htmlFor="title">Título</label>
                <input
                  id="title"
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Título de la imagen"
                  required
                  disabled={loading}
                />
              </div>

              <div className="upload-images-form-group">
                <label htmlFor="date">Fecha</label>
                <input
                  id="date"
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  required
                  disabled={loading}
                />
              </div>

              <div className="upload-images-form-group upload-images-full-width">
                <label htmlFor="description">Descripción</label>
                <textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Escribe una descripción del recuerdo..."
                  rows={4}
                  disabled={loading}
                />
              </div>

              <div className="upload-images-form-group">
                <label htmlFor="category">Categoría</label>
                <select
                  id="category"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  required
                  disabled={loading}
                >
                  <option value="">Selecciona una categoría</option>
                  <option value="Citas">Citas</option>
                  <option value="Viajes">Viajes</option>
                  <option value="Casual">Casual</option>
                </select>
              </div>

              <div className="upload-images-form-group">
                <label htmlFor="location">Ubicación</label>
                <input
                  id="location"
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="Ubicación de la imagen"
                  required
                  disabled={loading}
                />
              </div>

              <div className="upload-images-form-group upload-images-checkbox-group">
                <label className="upload-images-checkbox-label">
                  <input
                    type="checkbox"
                    checked={showInBook}
                    onChange={(e) => setShowInBook(e.target.checked)}
                    disabled={loading}
                  />
                  <span className="upload-images-checkbox-custom"></span>
                  <span>Mostrar en el libro</span>
                </label>

                <label className="upload-images-checkbox-label">
                  <input
                    type="checkbox"
                    checked={showInTimeline}
                    onChange={(e) => setShowInTimeline(e.target.checked)}
                    disabled={loading}
                  />
                  <span className="upload-images-checkbox-custom"></span>
                  <span>Mostrar en línea de tiempo</span>
                </label>
              </div>
            </div>

            {error && (
              <div className="upload-images-message upload-images-error-message">
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
              <div className="upload-images-message upload-images-success-message">
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
                <span>¡Imagen subida exitosamente!</span>
              </div>
            )}

            <button
              type="button"
              onClick={handleSubmit}
              className="upload-images-submit-button"
              disabled={loading || !imageFile || !category || !date || !title.trim()}
            >
              {loading ? (
                <>
                  <span className="upload-images-loading-spinner"></span>
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
                  Subir Imagen
                </>
              )}
            </button>
          </div>
        </div>
      </main>
    </section>
  );
};

export default UploadImagesPage;
