import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { treatmentData } from "@/data/treatmentData";
import type { TreatmentType } from "@/interfaces/treatment.interface";
import { TreatmentCategoryCard } from "@/components/treatments/TreatmentCategoryCard";
import { TreatmentContent } from "@/components/treatments/TreatmentContent";
import { TreatmentCTA } from "@/components/treatments/TreatmentCTA";
import { SpecialServices } from "@/components/treatments/SpecialServices";
import { PriceListCollapsible } from "@/components/treatments/PriceListCollapsible";
import "./TreatmentsPage.css";
import heroImage from "@/assets/images/massasje_stol.jpg";
import Bildemassaje from "@/assets/images/BildeMassasje.jpg";
import Massasje2 from "@/assets/images/Massasje2.jpg";
import KnipetakBilde from "@/assets/images/KnipetakBilde.jpg";

interface Slide {
  src: string;
  alt: string;
}

const heroSlides: Slide[] = [
  { src: heroImage, alt: "Behandlingsrom" },
  { src: Bildemassaje, alt: "Profesjonell massasje" },
  { src: Massasje2, alt: "Avslappende behandling" },
  { src: KnipetakBilde, alt: "Knipetak massasje" },
];

const HeroSlider = () => {
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
    }, 4000); // Change slide every 4 seconds

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="treatments__hero-slider">
      {heroSlides.map((slide, index) => (
        <img
          key={index}
          className={`treatments__hero-slider-image ${
            currentSlide === index ? "active" : "hidden"
          }`}
          src={slide.src}
          alt={slide.alt}
          draggable={false}
        />
      ))}
    </div>
  );
};

function TreatmentsPage() {
  const [activeSection, setActiveSection] = useState<TreatmentType | null>(
    null,
  );
  const contentRef = useRef<HTMLDivElement>(null);

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const toggleSection = (section: TreatmentType) => {
    setActiveSection(activeSection === section ? null : section);
  };

  const currentContent = activeSection ? treatmentData[activeSection] : null;

  useEffect(() => {
    if (!activeSection || !contentRef.current) return;

    const timer = window.setTimeout(() => {
      contentRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 100);

    return () => window.clearTimeout(timer);
  }, [activeSection]);

  return (
    <div className="treatments-page">
      <section className="treatments__hero">
        <motion.div
          className="treatments__hero-content"
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.7 }}
        >
          <h1 className="treatments__title">Behandlinger</h1>
          <h2 className="treatments__subtitle">Profesjonell Muskelterapi & Massasje</h2>
          <div className="treatments__hero-description">
            <p>Jeg kommer hjem til deg med profesjonell massasje og muskelterapi tilpasset dine behov.</p>
            <p>Utforsk våre behandlingsalternativer, tjenester for ulike anledninger, samt prisliste.</p>
            <p>Enten du trenger lindring fra smerter, avslapning, eller massasje til en spesiell anledning - jeg har løsningen.</p>
          </div>
          
          <div className="treatments__hero-nav">
            <button 
              onClick={() => scrollToSection('special-services')}
              className="treatments__hero-nav-btn"
            >
              Ulike Anledninger
            </button>
            <button 
              onClick={() => scrollToSection('price-list')}
              className="treatments__hero-nav-btn"
            >
              Se Priser
            </button>
          </div>
        </motion.div>

        <motion.div
          className="treatments__hero-image"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.7, delay: 0.2 }}
        >
          <HeroSlider />
        </motion.div>
      </section>

      <section className="treatments__overview">
        <div className="treatments__content">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <h3 className="treatments__section-title">
              Massasje kan benyttes ved følgende tilstander:
            </h3>
          </motion.div>

          <div className="treatments__categories">
            {(Object.entries(treatmentData) as [TreatmentType, typeof treatmentData.smerter][]).map(
              ([key, section], index) => (
                <motion.div
                  key={key}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.08, duration: 0.4 }}
                >
                  <TreatmentCategoryCard
                    type={key}
                    section={section}
                    isActive={activeSection === key}
                    onClick={() => toggleSection(key)}
                  />
                </motion.div>
              ),
            )}
          </div>

          <TreatmentContent content={currentContent} contentRef={contentRef} />
        </div>
      </section>

      <div id="special-services">
        <SpecialServices />
      </div>

      <div id="price-list">
        <PriceListCollapsible />
      </div>

      <TreatmentCTA />
    </div>
  );
}

export default TreatmentsPage;
