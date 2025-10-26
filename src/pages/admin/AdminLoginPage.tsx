import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './AdminLoginPage.css';
import { HeartIcon, LockIcon, UserIcon, LogInIcon, AlertCircleIcon } from 'lucide-react';

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
              <UserIcon className="input-icon" size={20} />
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
              <LockIcon className="input-icon" size={20} />
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
              <AlertCircleIcon size={16} />
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
                <LogInIcon size={20} />
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
