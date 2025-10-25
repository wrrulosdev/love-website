import React from 'react';
import './ApiErrorState.css';

type ApiErrorStateProps = {
  error: unknown;
  onRetry?: () => void;
  message?: string;
};

/**
 * ApiErrorState
 *
 * Displays a friendly UI when an API call fails.
 * Shows an error icon, a title, optional custom message, error details,
 * and optionally a retry button if `onRetry` is provided.
 */
const ApiErrorState: React.FC<ApiErrorStateProps> = ({ error, onRetry, message }) => {
  return (
    <div className="api-error">
      <div className="api-error-card">
        <div className="api-error-icon">⚠️</div>
        <h2 className="api-error-title">Ups, algo salió mal</h2>
        <p className="api-error-message">{message ?? 'Ocurrió un error al cargar los datos.'}</p>
        <p className="api-error-details">{String(error)}</p>
        {onRetry && (
          <button className="api-error-retry" onClick={onRetry}>
            Reintentar
          </button>
        )}
      </div>
    </div>
  );
};

export default ApiErrorState;
