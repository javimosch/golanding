// src/hooks/useErrorHandler.js
import { useState } from 'react';

const useErrorHandler = (initialError = null) => {

  const [error, setError] = useState(initialError);

  window.setError=setError

  const handleError = (error) => {
    console.error(error);

    if (error.response) {
      if (error.data) {
        if (typeof error.data === 'string') {
          setError(error.data);
        } else if (error.data.errors) {
          setError(error.data.errors.map(e => e.message).join(', '));
        } else {
          setError(JSON.stringify(error.data));
        }
      } else if (error.status === 429) {
        setError('Too many requests. Please try again later.');
      } else {
        setError(`${error.status}: ${error.statusText}`);
      }
    } else if (error instanceof Error) {
      setError(error.message);
    } else {
      setError('An unexpected error occurred');
    }
  };

  const clearError = () => {
    setError(null);
  };

  return { error, handleError, clearError };
};

export default useErrorHandler;
