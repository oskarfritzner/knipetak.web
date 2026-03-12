import React from "react";
import "./InfoComponent.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faLocationDot,
  faAward,
  faUserGear,
} from "@fortawesome/free-solid-svg-icons";
import Massasje2 from "../../../assets/images/Massasje2.jpg";

const InfoComponent: React.FC = () => {
  return (
    <div className="info-page">
      <div className="content-wrapper">
        {/* Introduction Section */}
        <div className="intro-section">
          <div className="intro-content">
            <div className="intro-text">
              <h2 className="greeting">Hei!</h2>
              <p className="name-intro">
                Mitt navn er Helene og er muskelterapeut.
              </p>
              <p className="additional-intro">
                Jeg er tilgjengelig til å komme der hvor du er.
              </p>
            </div>
            <div className="intro-image">
              <img
                src={Massasje2}
                alt="Helene muskelterapeut"
                draggable="false"
              />
            </div>
          </div>
        </div>

        {/* Benefits Section */}
        <div className="benefits-container">
          <div className="benefit-box">
            <div className="benefit-icon">
              <FontAwesomeIcon icon={faLocationDot} />
            </div>
            <h3>Fleksibel Behandling</h3>
            <p>
              Kommer til deg - enten på jobb eller hjemme. Tilpasser
              behandlingen etter dine behov.
            </p>
          </div>
          <div className="benefit-box">
            <div className="benefit-icon">
              <FontAwesomeIcon icon={faAward} />
            </div>
            <h3>Profesjonell Erfaring</h3>
            <p>
              Lang erfaring med ulike behandlingsformer og teknikker for best
              mulig resultat.
            </p>
          </div>
          <div className="benefit-box">
            <div className="benefit-icon">
              <FontAwesomeIcon icon={faUserGear} />
            </div>
            <h3>Personlig Tilpasning</h3>
            <p>
              Hver behandling er skreddersydd til dine spesifikke behov og
              ønsker.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InfoComponent;
