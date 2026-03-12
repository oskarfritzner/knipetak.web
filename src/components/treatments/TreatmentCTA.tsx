import { faEnvelope } from "@fortawesome/free-solid-svg-icons";
import CTAButton from "@/components/CTAButton/CTAButton";

type Props = {
  title?: string;
  subtitle?: string;
};

export function TreatmentCTA({
  title = "Klar for en avslappende behandling?",
  subtitle = "Ta kontakt i dag, så finner vi en tid som passer",
}: Props) {
  return (
    <section className="treatments__cta">
      <div className="treatments__cta-content">
        <h2>{title}</h2>
        <p>{subtitle}</p>
        <CTAButton to="/kontakt" icon={faEnvelope}>
          Kontakt oss
        </CTAButton>
      </div>
    </section>
  );
}
