import React from "react";
import { faCalendarCheck } from "@fortawesome/free-solid-svg-icons";
import CTAButton from "@/components/CTAButton/CTAButton";
import "./HeroHomePage.css";

const HeroHomePage: React.FC = () => {
  return (
    <div className="hero-container">
      <div className="hero-background" />
      <div className="hero-overlay" />
      <div className="hero-content">
        <div className="hero-text-container">
          <h1 className="hero-title">Knipetak - En muskelterapeut på hjul!</h1>
          <div className="hero-divider" />
          <p className="hero-subtitle">
            Profesjonell muskelterapi der du er - hjemme eller på jobb
          </p>
          <CTAButton to="/kontakt" icon={faCalendarCheck}>
            Book Time
          </CTAButton>
        </div>
      </div>
    </div>
  );
};

export default HeroHomePage;
