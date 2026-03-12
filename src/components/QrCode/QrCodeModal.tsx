import React from "react";
import "./QrCodeModal.css";
import qrCodeImage from "../../assets/images/knipetak_qr_kode.png";

interface QrCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const QrCodeModal: React.FC<QrCodeModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="qr-code-modal-overlay" onClick={onClose}>
      <div
        className="qr-code-modal-content"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          className="close-qrInfo-btn"
          onClick={onClose}
          aria-label="Lukk"
        >
          &times;
        </button>

        <div className="qr-code-modal-header">
          <h2>Betalingsinformasjon</h2>
        </div>

        <div className="qr-code-modal-body">
          <div className="payment-info">
            <h3>Betalingsalternativer:</h3>
            <ul>
              <li>Betal ved oppmøte (kort eller kontant)</li>
              <li>Forhåndsbetal via Vipps (scan QR-koden under)</li>
            </ul>

            <div className="price-disclaimer">
              <p>
                <strong>Merk:</strong> Prisene som vises i Vipps er
                standardpriser.
              </p>
              <p>Faktisk pris kan avvike på grunn av:</p>
              <ul>
                <li>Reisetid og distanse</li>
                <li>Spesielle behandlingsbehov</li>
                <li>Andre tilleggstjenester</li>
              </ul>
              <p>Eventuelle prisforskjeller kan betales ved oppmøte.</p>
            </div>
          </div>

          <div className="qr-code-container">
            <h3>Scan QR-kode for å se priser og betale</h3>
            <img
              src={qrCodeImage}
              alt="Vipps QR-kode for betaling"
              className="qr-code-image"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default QrCodeModal;
