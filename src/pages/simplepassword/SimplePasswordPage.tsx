import React, { type ChangeEvent, type FormEvent, useEffect, useState } from 'react';
import { Dog, Lock, Heart, Sparkles, Code } from 'lucide-react';
import './SimplePasswordPage.css';
import { useNavigate } from 'react-router-dom';

// Secret password to access the page (our relation ship date)
const SECRET = '27092022';

const SimplePasswordPage: React.FC = () => {
  const [password, setPassword] = useState<string>('');
  const [isShaking, setIsShaking] = useState<boolean>(false);
  const [showHearts, setShowHearts] = useState<boolean>(false);
  const navigate = useNavigate();

  /**
   * Handles password input change
   * @param {ChangeEvent<HTMLInputElement>} e - input change event
   */
  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);
  };

  /**
   * Handles form submission
   * - If password matches SECRET, show hearts, store auth in session, navigate to /home
   * - Otherwise, trigger shake animation and reset input
   * @param {FormEvent<HTMLFormElement>} e - form submit event
   */
  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (password === SECRET) {
      setShowHearts(true);

      setTimeout(() => {
        sessionStorage.setItem('auth', 'true');
        navigate('/home');
      }, 2000);
    } else {
      setIsShaking(true);
      setTimeout(() => setIsShaking(false), 600);
      setPassword('');
    }
  };

  // If user is already authenticated in sessionStorage, redirect to home
  useEffect(() => {
    if (sessionStorage.getItem('auth') === 'true') {
      navigate('/home');
    }
  });

  return (
    <div className="sp-page" aria-live="polite">
      {showHearts && (
        <div className="sp-hearts-layer" aria-hidden>
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="sp-heart"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 2}s`,
                animationDuration: `${1 + Math.random()}s`,
              }}
            >
              💕
            </div>
          ))}
        </div>
      )}

      <main className="sp-centered">
        <section className={`sp-card ${isShaking ? 'sp-shake' : ''}`}>
          <header className="sp-header">
            <div className="sp-icons">
              <Dog className="sp-icon sp-icon-beat" />
              <Lock className="sp-icon sp-icon-lock" />
              <Heart className="sp-icon sp-icon-beat delay" />
            </div>

            <h1 className="sp-title">Nuestro Espacio Secreto</h1>
            <p className="sp-sub">Ingresa la fecha que cambió nuestras vidas para siempre</p>

            <div className="sp-code-line">
              <Code className="sp-code-icon" />
              <span className="sp-code-text">&lt;3 protegido por amor /&gt;</span>
            </div>
          </header>

          <form onSubmit={handleSubmit} className="sp-form" noValidate>
            <div className="sp-input-row">
              <label className="sp-label" htmlFor="secret-password">
                Fecha especial (DDMMAAAA)
              </label>

              <div className="sp-input-wrap">
                <input
                  id="secret-password"
                  type="password"
                  inputMode="numeric"
                  maxLength={8}
                  value={password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className="sp-input"
                  aria-describedby="hint"
                  disabled={showHearts}
                  autoComplete="off"
                />
                <span className="sp-input-decor">📅</span>
              </div>

              <p id="hint" className="sp-hint">
                💡 Pista: el día en que nos convertimos en novios
              </p>
            </div>

            <button
              type="submit"
              className="sp-button"
              disabled={showHearts}
              aria-pressed={showHearts}
            >
              {showHearts ? (
                <>
                  <Heart className="sp-btn-icon pulse" />
                  ¡Bienvenidos a casa! 💕
                </>
              ) : (
                <>
                  Entrar a nuestro mundo
                  <Sparkles className="sp-btn-icon sparkle-on-hover" />
                </>
              )}
            </button>
          </form>

          <footer className="sp-footer">// Un lugar hecho con amor para los dos</footer>
        </section>
      </main>
    </div>
  );
};

export default SimplePasswordPage;
