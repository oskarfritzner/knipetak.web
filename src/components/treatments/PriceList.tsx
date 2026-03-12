import "./PriceList.css";

const prices = [
  { duration: "15 min", price: "450,-" },
  { duration: "30 min", price: "800,-" },
  { duration: "60 min", price: "1550,-" },
  { duration: "90 min", price: "2000,-" },
  { duration: "Klubbkveld (min 5 stk)", price: "25% rabatt" },
  { duration: "Event", price: "Ta kontakt" }
];

export function PriceList() {
  return (
    <section className="price-list">
      <div className="price-list__container">
        <h2 className="price-list__title">Eksempel: Prisliste</h2>
        
        <div className="price-list__info">
          <p>
            Jeg holder til i Bergen og kan kjøre innenfor en radius på 2 timer. Reisetid kommer i tillegg.
          </p>
          <p>
            Dette er en generell prisliste, og et endelig prisestimat vil gis etter vi har snakket sammen når jeg får kartlagt dine behov, og reisekostander for meg.
          </p>
        </div>

        <div className="price-list__table">
          {prices.map((item, index) => (
            <div key={index} className="price-item">
              <span className="price-item__duration">{item.duration}</span>
              <span className="price-item__dots"></span>
              <span className="price-item__price">{item.price}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
