import React from "react";
import { useNavigate } from "react-router-dom";
import "./GuestLoginModal.css";

interface GuestLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onContinueAsGuest: () => void;
}

const GuestLoginModal: React.FC<GuestLoginModalProps> = ({
  isOpen,
  onClose,
  onContinueAsGuest,
}) => {
  const navigate = useNavigate();

  if (!isOpen) return null;

  const handleLogin = () => {
    onClose();
    navigate("/login");
  };

  return (
    <div className="guest-login-modal-overlay">
      <div className="guest-login-modal">
        <h3>Logg inn eller fortsett som gjest</h3>
        <p>
          Du er ikke logget inn. Vil du logge inn med en eksisterende konto,
          registrer deg eller fortsette som gjest?
        </p>
        <div className="guest-login-modal-actions">
          <button
            className="guest-login-button primary"
            onClick={onContinueAsGuest}
          >
            Fortsett som gjest
          </button>
          <button
            className="guest-login-button secondary"
            onClick={handleLogin}
          >
            Logg inn / Registrer
          </button>
          <button className="guest-login-button cancel" onClick={onClose}>
            Avbryt
          </button>
        </div>
      </div>
    </div>
  );
};

export default GuestLoginModal;
