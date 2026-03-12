import React, { useState, useEffect, useCallback, useRef } from "react";
import "./RatingsComponent.css";

interface Review {
  author: string;
  reviewText: string;
  feedback: string;
}

const RatingsComponent: React.FC = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const reviews: Review[] = [
    {
      author: "Mette",
      reviewText: "Skikkelig fornøyd",
      feedback:
        "Helene gav en utrolig bra opplevelse både med sin gode massasje. Hun lytter og tilpasser behandling etter dine behov, enten det er plager/smerter eller behandling å vedlikeholde et aktivt treningsliv. Du føler deg sett, trygg og oppnår avslapning og hvile i hennes hender! Jeg er skikkelig fornøyd!",
    },
    {
      author: "Anonym",
      reviewText: "Må oppleves",
      feedback:
        "Helene hos Knipetak er utrolig flink og profesjonell. Hun lytter til kunden sine og viser er genuint interessert for å finne årsaken til plagene. Hun har hjulpet meg. Kan virkelig anbefale Helene og knipetak",
    },
    {
      author: "Rune Johansen",
      reviewText: "Kjempe god behandling.",
      feedback:
        "Kjempe god behandling. Lever opp til navnet Knipetak da det ikke var pusebehandling. Flink dyktig massør som kom til avtalt tid.",
    },
    {
      author: "Lars",
      reviewText: "Fantastisk opplevelse",
      feedback: "Helene leverte en fantastisk opplevelse fra start til slutt. Hun er ikke bare en dyktig massør, men også en god lytter som virkelig forstår kundens behov. Behandlingen var både avslappende og effektiv, og jeg følte meg som en ny person etterpå. Helene tar seg tid til å forklare hva hun gjør og hvorfor, noe som gir en ekstra trygghet. Jeg kan ikke anbefale henne nok, og jeg ser frem til neste behandling!",
}
  ];

  const startTimer = useCallback(() => {
    // Rydd opp i eksisterende timer hvis den finnes
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }

    // Start ny timer
    timerRef.current = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % reviews.length);
    }, 8000);
  }, [reviews.length]);

  useEffect(() => {
    startTimer();
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [startTimer]);

  const nextReview = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % reviews.length);
    startTimer();
  };

  const prevReview = () => {
    setCurrentIndex((prevIndex) => (prevIndex - 1 + reviews.length) % reviews.length);
    startTimer();
  };

  return (
    <section className="reviews-section">
      <h2 className="reviews-title">Hva våre kunder sier</h2>
      <div className="reviews-container">
        <button className="carousel-button prev" onClick={prevReview} aria-label="Forrige anmeldelse">
          &#10094;
        </button>
        
        <div className="reviews-carousel">
          {reviews.map((review, index) => (
            <div
              key={index}
              className={`review-card ${index === currentIndex ? 'active' : ''}`}
              style={{
                transform: `translateX(${(index - currentIndex) * 100}%)`,
              }}
            >
              <div className="review-content">
                <div className="review-header">
                  <h3 className="review-author">{review.author}</h3>
                  <div className="stars-container">
                    {[...Array(5)].map((_, i) => (
                      <span key={i} className="star">&#9733;</span>
                    ))}
                  </div>
                </div>
                <h4 className="review-title">{review.reviewText}</h4>
                <p className="review-feedback">{review.feedback}</p>
              </div>
            </div>
          ))}
        </div>

        <button className="carousel-button next" onClick={nextReview} aria-label="Neste anmeldelse">
          &#10095;
        </button>
      </div>
      
      <div className="carousel-indicators">
        {reviews.map((_, index) => (
          <button
            key={index}
            className={`indicator ${index === currentIndex ? 'active' : ''}`}
            onClick={() => {
              setCurrentIndex(index);
              startTimer();
            }}
            aria-label={`Gå til anmeldelse ${index + 1}`}
          />
        ))}
      </div>
    </section>
  );
};

export default RatingsComponent;
