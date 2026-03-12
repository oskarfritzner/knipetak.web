import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { 
  faCalendarAlt,
  faUserGroup,
  faGift,
  faGraduationCap
} from "@fortawesome/free-solid-svg-icons";
import "./SpecialServices.css";

const services = [
  {
    icon: faCalendarAlt,
    title: "Gruppebooking",
    description: "Et eksempel er vår mest populære gruppebehandlingen. La oss kalle det klubbkveld for damer! Jeg kommer hjem til dere, og dere kommer én etter én for litt behandling. Perfekt for en hyggelig samling med venner."
  },
  {
    icon: faUserGroup,
    title: "Eventer",
    description: "Jeg har deltatt på ulike eventer slik som Strikkehelgen i Myrkdalen, Besseggløpet, Finseregatta, Fjellkjør, Bluescruise på Havila og diverse utdrikningslag. Perfekt for team-building eller spesielle anledninger."
  },
  {
    icon: faGift,
    title: "Gave",
    description: "Gi bort en opplevelse som ikke blir glemt! Gavekort til massasje er den perfekte gaven til noen som fortjener å slappe av."
  },
  {
    icon: faGraduationCap,
    title: "Eksamen",
    description: "Trenger du å slappe av etter en hektisk eksamensperiode? Eller kanskje den perfekte belønningen for bestått eksamen?"
  }
];

export function SpecialServices() {
  return (
    <section className="special-services">
      <div className="special-services__container">
        <h2 className="special-services__title">Ulike Anledninger</h2>
        
        <div className="special-services__grid">
          {services.map((service, index) => (
            <div key={index} className="special-service-card">
              <div className="special-service-card__icon">
                <FontAwesomeIcon icon={service.icon} />
              </div>
              <h3 className="special-service-card__title">{service.title}</h3>
              <p className="special-service-card__description">{service.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
