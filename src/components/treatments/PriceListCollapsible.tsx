import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronDown } from "@fortawesome/free-solid-svg-icons";
import "./PriceListCollapsible.css";

const prices = [
  { duration: "15 min", price: "450,-" },
  { duration: "30 min", price: "800,-" },
  { duration: "60 min", price: "1550,-" },
  { duration: "90 min", price: "2000,-" },
  { duration: "Klubbkveld (min 5 stk)", price: "25% rabatt" },
  { duration: "Event", price: "Ta kontakt" }
];

export function PriceListCollapsible() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <section className="price-list-collapsible">
      <div className="price-list-collapsible__container">
        <div className="price-list-collapsible__header">
          <h2 className="price-list-collapsible__title">Lurer du på pris?</h2>
          <p className="price-list-collapsible__intro">
            Det kan variere utifra reisetid, flere behandlinger, eller noen av de forskjellige eventene over. 
            Men jeg skjønner at du lurer, så her er en generell prisliste vi kan jobbe ut ifra.
          </p>
          
          <button 
            className={`price-list-collapsible__toggle ${isOpen ? 'open' : ''}`}
            onClick={() => setIsOpen(!isOpen)}
            aria-expanded={isOpen}
            aria-controls="price-content"
          >
            <span>Se prisliste</span>
            <FontAwesomeIcon icon={faChevronDown} className="toggle-icon" />
          </button>
        </div>

        <div 
          id="price-content"
          className={`price-list-collapsible__content ${isOpen ? 'open' : ''}`}
        >
          <div className="price-list-collapsible__inner">
            <div className="price-table">
              {prices.map((item, index) => (
                <div key={index} className="price-item">
                  <span className="price-item__duration">{item.duration}</span>
                  <span className="price-item__dots"></span>
                  <span className="price-item__price">{item.price}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
