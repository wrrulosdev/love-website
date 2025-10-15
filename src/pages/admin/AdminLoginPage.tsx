import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './AdminLoginPage.css';
import { HeartIcon, LockIcon, UserIcon } from 'lucide-react';

const AdminLoginPage: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const auth = useAuth();
  const navigate = useNavigate();

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await auth.login(username, password);
      navigate('/admin');
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      const msg = err?.response?.data?.detail ?? err?.message ?? 'Error al iniciar sesión';
      setError(String(msg));
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="admin-login-page">
      <div className="login-card">
        <div className="login-header">
          <div className="heart-icon">
            <HeartIcon size={48} />
          </div>
          <h1>Nuestro Universo</h1>
          <p>Acceso al panel de administración</p>
        </div>

        <form onSubmit={submit} className="login-form">
          <div className="form-group">
            <label htmlFor="username">Usuario</label>
            <div className="input-wrapper">
              <UserIcon className="input-icon" />
              <input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Ingresa tu usuario"
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="password">Contraseña</label>
            <div className="input-wrapper">
              <LockIcon className="input-icon" />
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Ingresa tu contraseña"
                required
              />
            </div>
          </div>

          {error && (
            <div className="error-message">
              <svg
                width="16"
                height="16"
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

          <button type="submit" className="submit-button" disabled={loading}>
            {loading ? (
              <>
                <span className="loading-spinner"></span>
                Entrando...
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
                  <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"></path>
                  <polyline points="10 17 15 12 10 7"></polyline>
                  <line x1="15" y1="12" x2="3" y2="12"></line>
                </svg>
                Iniciar Sesión
              </>
            )}
          </button>
        </form>
      </div>
    </section>
  );
};

export default AdminLoginPage;
