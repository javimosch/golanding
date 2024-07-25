// src/hooks/useNotification.js
import { useState, useCallback } from 'react';

const useNotification = () => {
  const [notification, setNotification] = useState(null);
  const [isVisible, setIsVisible] = useState(false);

  const showNotification = useCallback((message, type = 'success', duration = 3000) => {
    setNotification({ message, type });
    setIsVisible(true);
    setTimeout(() => {
      setIsVisible(false);
    }, duration);
  }, []);

  const clearNotification = useCallback(() => {
    setNotification(null);
  }, []);

  return {
    notification,
    isVisible,
    showNotification,
    clearNotification
  };
};

export default useNotification;
