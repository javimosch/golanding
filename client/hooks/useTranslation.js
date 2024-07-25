// src/hooks/useTranslation.js
import { useCallback } from 'react';

const useTranslation = () => {
  const t = useCallback((key) => {
    // Assuming window.t is the global translation function set up in your HTML
    if (typeof window !== 'undefined' && window.t) {
      return window.t(key);
    }
    // Fallback if window.t is not available (e.g., during server-side rendering)
    return key;
  }, []);

  return { t };
};

export default useTranslation;
