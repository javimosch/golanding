// src/components/Notification.jsx
import React, { useEffect, useState } from 'react';
import useTranslation from '../hooks/useTranslation';

const Notification = ({ notification, onClose }) => {
  const { t } = useTranslation();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (notification) {
      setIsVisible(true);
    }
  }, [notification]);

  if (!notification) return null;

  const { message, type } = notification;

  const bgColor = type === 'success' ? 'bg-green-500' : 'bg-red-500';

  return (
    <div
      className={`fixed bottom-4 right-4 ${bgColor} text-white px-4 py-2 rounded shadow-lg animate__animated ${
        isVisible ? 'animate__fadeIn' : 'animate__fadeOut'
      }`}
      onAnimationEnd={() => {
        if (!isVisible) {
          onClose();
        }
      }}
    >
      <div className="flex justify-between items-center">
        <span>{t(message)}</span>
        <button onClick={() => setIsVisible(false)} className="ml-4 text-white focus:outline-none">
          &times;
        </button>
      </div>
    </div>
  );
};

export default Notification;
