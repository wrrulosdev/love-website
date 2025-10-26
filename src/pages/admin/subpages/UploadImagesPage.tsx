import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { EditIcon, ImageIcon, ArrowLeft, AlertCircle, CheckCircle, Upload } from 'lucide-react';
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

  /** Handles image selection and validation */
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
      reader.onloadend = () => setImagePreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  /** Handles the upload form submission */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!imageFile) return setError('Debes seleccionar una imagen');
    if (!category) return setError('Debes seleccionar una categoría');
    if (!location) return setError('Debes seleccionar una ubicación');
    if (!date) return setError('Debes seleccionar una fecha');
    if (!title.trim()) return setError('Debes ingresar un título');

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
    } catch (err: any) {
      console.error('Error uploading image:', err);
      setError(err?.message || 'Error al subir la imagen. Por favor, intenta nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => navigate('/admin');

  return (
    <section className="upload-images-page">
      <header className="admin-header">
        <div className="admin-header-content">
          <button onClick={handleBack}>
            <ArrowLeft size={20} />
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
                <AlertCircle size={20} />
                <span>{error}</span>
              </div>
            )}

            {success && (
              <div className="upload-images-message upload-images-success-message">
                <CheckCircle size={20} />
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
                  <Upload size={20} />
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
