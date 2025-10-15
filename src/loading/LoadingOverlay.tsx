import React from 'react';
import './LoadingOverlay.css';

type LoadingOverlayProps = {
  visible: boolean;
  message?: string;
  gifSrc: string;
  size?: number;
  backdropBlur?: boolean;
};

const LoadingOverlay: React.FC<LoadingOverlayProps> = ({
  visible,
  message = 'Cargando...',
  gifSrc,
  size = 120,
  backdropBlur = true,
}) => {
  if (!visible) return null;

  return (
    <div
      className={`loading-overlay ${backdropBlur ? 'blur' : ''}`}
      role="status"
      aria-live="polite"
      aria-label={message}
    >
      <div className="loading-card">
        <img
          src={gifSrc}
          alt="Cargando"
          className="loading-gif"
          style={{ maxWidth: size, maxHeight: size }}
        />
        <div className="loading-message">{message}</div>
      </div>
    </div>
  );
};

export default LoadingOverlay;
