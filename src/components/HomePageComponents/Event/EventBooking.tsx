import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUsers, faEnvelope } from "@fortawesome/free-solid-svg-icons";
import CTAButton from "@/components/CTAButton/CTAButton";
import "./EventBooking.css";

const EventBooking: React.FC = () => {
  return (
    <div className="home-event-section">
      <div className="event-content">
        <div className="event-info">
          <h2>Gruppebookinger & Spesielle Eventer</h2>

          <div className="booking-type">
            <FontAwesomeIcon icon={faUsers} className="booking-icon" />
            <h3 style={{ marginBottom: '1rem', color: '#2c5f2d' }}>Klubbkveld for Damer</h3>
            <p>
              Den mest populære gruppebehandlingen! Jeg kommer hjem til en av dere med
              massasjeutstyr, og damene kommer én etter én for behandling. En hyggelig
              og avslappende måte å tilbringe kvelden sammen med venninner.
            </p>
            <p style={{ marginTop: '1rem', fontStyle: 'italic' }}>
              Helene har vært med på flere spennende eventer som Besseggløpet, 
              Finseregatta, Fjellkjør og Bluescruise på Havila.
            </p>
            <CTAButton to="/kontakt" icon={faEnvelope}>
              Kontakt Helene
            </CTAButton>
          </div>
        </div>

      </div>
    </div>
  );
};

export default EventBooking;
