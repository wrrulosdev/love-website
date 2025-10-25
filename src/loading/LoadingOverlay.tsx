import React from 'react';
import './LoadingOverlay.css';

type LoadingOverlayProps = {
  visible: boolean;
  message?: string;
  gifSrc: string;
  size?: number;
  backdropBlur?: boolean;
};

/**
 * LoadingOverlay component renders a fullscreen overlay with a loading GIF and optional message.
 *
 * @param visible - toggles the overlay visibility
 * @param message - text displayed under the loading GIF
 * @param gifSrc - path or URL to the loading GIF
 * @param size - maximum width and height for the GIF
 * @param backdropBlur - applies a blur effect to the background when true
 */
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
