import { useState, useEffect } from "react";
import "../../styles/SuccessModal.css";

interface SuccessModalProps {
  message: string;
  onClose?: () => void;
}

export default function SuccessModal({ message, onClose }: SuccessModalProps) {
  const [visible, setVisible] = useState(true);

  // Если модалка скрыта — не рендерим её
  if (!visible) return null;

  return (
    <div className="modal-overlay">
      <div className="success-modal">
        <button
          className="close-button"
          onClick={() => {
            setVisible(false);
            if (onClose) onClose();
          }}
        >
          <img src="/close.svg" alt="Закрыть" />
        </button>
        <div className="wrapper">
          <svg
            className="checkmark"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 52 52"
          >
            <circle
              className="checkmark__circle"
              cx="26"
              cy="26"
              r="25"
              fill="none"
            />
            <path
              className="checkmark__check"
              fill="none"
              d="M14.1 27.2l7.1 7.2 16.7-16.8"
            />
          </svg>
        </div>
        <p className="modal-message">{message}</p>
      </div>
    </div>
  );
}
