import React from "react";
import { faCalendarCheck } from "@fortawesome/free-solid-svg-icons";
import CTAButton from "@/components/CTAButton/CTAButton";
import "./Cta-Book.css";

const CTABook: React.FC = () => {
  return (
    <div className="cta-container">
      <CTAButton to="/kontakt" icon={faCalendarCheck}>
        Book Time
      </CTAButton>
    </div>
  );
};

export default CTABook;
