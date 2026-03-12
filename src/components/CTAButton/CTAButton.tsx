import React from "react";
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { IconDefinition } from "@fortawesome/fontawesome-svg-core";
import "./CTAButton.css";

interface CTAButtonProps {
  to: string;
  icon?: IconDefinition;
  children: React.ReactNode;
  variant?: "primary" | "secondary";
  onClick?: () => void;
}

const CTAButton: React.FC<CTAButtonProps> = ({
  to,
  icon,
  children,
  variant = "primary",
  onClick,
}) => {
  return (
    <Link to={to} className={`cta-button cta-button--${variant}`} onClick={onClick}>
      {icon && <FontAwesomeIcon icon={icon} className="cta-button__icon" />}
      <span className="cta-button__text">{children}</span>
    </Link>
  );
};

export default CTAButton;
