import React, { useState } from "react";
import { Treatment } from "../../../../backend/interfaces/Treatment";
import { Location as BookingLocation } from "../../../../backend/interfaces/Location";
import QrCodeModal from "../../../QrCode/QrCodeModal";
import { Link } from "react-router-dom";
import "./CompletedBooking.css";

interface CompletedBookingProps {
  bookingId: string;
  date: Date;
  time: string;
  treatment: Treatment;
  duration: number;
  isGroup: boolean;
  groupSize?: number;
  location: BookingLocation;
  onClose: () => void;
}

const CompletedBooking: React.FC<CompletedBookingProps> = ({
  bookingId,
  date,
  time,
  treatment,
  duration,
  isGroup,
  groupSize,
  location,
  onClose,
}) => {
  const [showQrModal, setShowQrModal] = useState(false);

  return (
    <div className="completed-booking-modal">
      <div className="completed-booking-content">
        <h3>Booking Bekreftet! 🎉</h3>
        <p className="booking-id">Booking ID: {bookingId}</p>

        <div className="booking-details">
          <h4>Detaljer for din booking:</h4>
          <p>
            <strong>Dato:</strong>{" "}
            {date.toLocaleDateString("nb-NO", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </p>
          <p>
            <strong>Tid:</strong> {time}
          </p>
          <p>
            <strong>Behandling:</strong> {treatment.name}
          </p>
          {isGroup ? (
            <>
              <p>
                <strong>Gruppestørrelse:</strong> {groupSize} personer
              </p>
              <p>
                <strong>Total varighet:</strong> {duration} minutter
              </p>
            </>
          ) : (
            <p>
              <strong>Varighet:</strong> {duration} minutter
            </p>
          )}

          <div className="location-details">
            <h4>Sted:</h4>
            <p>{location.address}</p>
            <p>
              {location.postalCode} {location.city}
            </p>
          </div>
          <div className="payment-details">
            <h4>Betalingsinformasjon:</h4>
            <p>Du har to betalingsmuligheter:</p>
            <ul>
              <li>Betal ved oppmøte (kort eller kontant)</li>
              <li>
                Forhåndsbetal via Vipps -{" "}
                <button
                  type="button"
                  className="link-button"
                  onClick={() => setShowQrModal(true)}
                >
                  Se priser og QR-kode
                </button>
              </li>
            </ul>
            <div className="payment-note">
              <p>
                <strong>Merk:</strong> Prisene som vises i Vipps er
                standardpriser. Faktisk pris kan avvike på grunn av reisetid
                eller andre faktorer. Eventuelle prisforskjeller kan betales ved
                oppmøte.
              </p>
            </div>
          </div>
        </div>
        <div className="cancellation-policy">
          <h4>Avbestillingsregler:</h4>
          <div className="policy-content">
            <p>Vennligst merk følgende regler for avbestilling:</p>
            <ul>
              <li>Avbestilling mer enn 48 timer før timen: Ingen gebyr</li>
              <li>
                Avbestilling 24-48 timer før timen: 50% av prisen belastes
              </li>
              <li>
                Avbestilling mindre enn 24 timer før timen eller uteblivelse:
                Full pris belastes
              </li>
            </ul>
            <p className="policy-note">
              Ved sykdom eller andre særskilte forhold, ta kontakt så raskt som
              mulig. Se våre fullstendige{" "}
              <Link to="/terms" target="_blank" rel="noopener noreferrer">
                vilkår
              </Link>{" "}
              for mer informasjon.
            </p>
          </div>
        </div>

        <button className="close-button" onClick={onClose}>
          Lukk
        </button>

        <QrCodeModal
          isOpen={showQrModal}
          onClose={() => setShowQrModal(false)}
        />
      </div>
    </div>
  );
};

export default CompletedBooking;
