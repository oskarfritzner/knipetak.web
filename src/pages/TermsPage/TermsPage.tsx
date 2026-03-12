import "./TermsPage.css";

function TermsPage() {
  return (
    <div className="terms-page">
      <div className="terms-page__container">
        <h1 className="terms-page__title">Vilkår for bruk</h1>

        <section className="terms-page__section">
          <h2 className="terms-page__section-title">
            1. Tjenestens innhold og formål
          </h2>
          <p className="terms-page__text">
            Knipetak tilbyr online booking av muskelterapi-tjenester. Tjenesten
            er tilgjengelig for alle som ønsker å booke behandling hos vår
            terapeut. Ved å bruke tjenesten godtar du disse vilkårene.
          </p>
        </section>

        <section className="terms-page__section">
          <h2 className="terms-page__section-title">2. Avbestillingsregler</h2>
          <p className="terms-page__text">
            Ved bestilling av time hos Knipetak gjelder følgende
            avbestillingsregler:
          </p>
          <ul className="terms-page__list">
            <li>
              Avbestilling må skje senest 48 timer før avtalt time for å unngå
              gebyr
            </li>
            <li>
              Ved avbestilling mellom 48 og 24 timer før avtalt time belastes
              50% av timeprisen
            </li>
            <li>
              Ved avbestilling mindre enn 24 timer før avtalt time, eller ved
              uteblivelse, belastes full timepris
            </li>
            <li>Alle bestillinger gjennom vårt bookingsystem er bindende</li>
            <li>
              Ved sykdom eller andre særskilte forhold kan gebyr frafalles etter
              vurdering
            </li>
          </ul>
          <p className="terms-page__text">
            Ved å gjennomføre en booking aksepterer du disse
            avbestillingsreglene.
          </p>
        </section>

        <section className="terms-page__section">
          <h2 className="terms-page__section-title">3. Gruppebooking</h2>
          <p className="terms-page__text">
            Ved gruppebooking gjelder følgende tilleggsvilkår:
          </p>
          <ul className="terms-page__list">
            <li>
              Personen som foretar gruppebookingen er økonomisk ansvarlig for
              alle timene som bestilles
            </li>
            <li>
              Det fulle beløpet for alle deltakere skal gjøres opp av den
              ansvarlige bestilleren
            </li>
            <li>Avbestillingsreglene gjelder for hele gruppen samlet</li>
            <li>
              Ved delvis avbestilling (enkeltpersoner i gruppen) gjelder de
              samme avbestillingsreglene som for individuelle timer
            </li>
            <li>
              Det er bestillerens ansvar å informere alle gruppedeltakere om
              disse vilkårene
            </li>
          </ul>
        </section>

        <section className="terms-page__section">
          <h2 className="terms-page__section-title">3. Brukerens ansvar</h2>
          <p className="terms-page__text">
            Som bruker av tjenesten er du ansvarlig for:
          </p>
          <ul className="terms-page__list">
            <li>Å oppgi korrekt og fullstendig informasjon ved booking</li>
            <li>Å respektere avtalte behandlingstider</li>
            <li>
              Å ikke misbruke tjenesten eller bruke den til ulovlige formål
            </li>
            <li>
              Å ikke dele eller distribuere innhold fra tjenesten uten
              tillatelse
            </li>
          </ul>
        </section>

        <section className="terms-page__section">
          <h2 className="terms-page__section-title">4. Konto og personvern</h2>
          <p className="terms-page__text">
            For å bruke tjenesten må du opprette en konto. Du er ansvarlig for å
            holde dine påloggingsdetaljer konfidensielle. Vi behandler dine
            personopplysninger i henhold til vår personvernerklæring.
          </p>
        </section>

        <section className="terms-page__section">
          <h2 className="terms-page__section-title">
            5. Immaterielle rettigheter
          </h2>
          <p className="terms-page__text">
            Alt innhold på nettsiden, inkludert tekst, bilder, logoer og
            programkode, er beskyttet av opphavsrett og tilhører Knipetak eller
            våre partnere. Du har ikke rett til å kopiere, distribuere eller
            bruke innholdet uten vår skriftlige tillatelse.
          </p>
        </section>

        <section className="terms-page__section">
          <h2 className="terms-page__section-title">6. Ansvarsfraskrivelse</h2>
          <p className="terms-page__text">
            Vi gjør vårt beste for å sikre at tjenesten fungerer som forventet,
            men vi kan ikke garantere at den alltid vil være tilgjengelig eller
            feilfri. Vi er ikke ansvarlige for:
          </p>
          <ul className="terms-page__list">
            <li>Midlertidig nede-tid eller tekniske problemer</li>
            <li>Tap av data eller informasjon</li>
            <li>Indirekte skader eller tap som følge av bruk av tjenesten</li>
          </ul>
        </section>

        <section className="terms-page__section">
          <h2 className="terms-page__section-title">
            7. Endringer i vilkårene
          </h2>
          <p className="terms-page__text">
            Vi forbeholder oss retten til å endre disse vilkårene når som helst.
            Endringer vil bli publisert på nettsiden, og fortsatt bruk av
            tjenesten etter endringer betraktes som aksept av de nye vilkårene.
          </p>
        </section>

        <section className="terms-page__section">
          <h2 className="terms-page__section-title">
            8. Gjeldende lov og jurisdiksjon
          </h2>
          <p className="terms-page__text">
            Disse vilkårene er regulert av norsk lov. Eventuelle tvister skal
            løses ved forhandlinger, og ved manglende enighet skal Oslo tingrett
            være rettens sted.
          </p>
        </section>

        <section className="terms-page__section">
          <h2 className="terms-page__section-title">9. Kontaktinformasjon</h2>
          <p className="terms-page__text">
            For spørsmål om disse vilkårene, vennligst kontakt oss på:
            <br />
            E-post: helene@knipetak.no
            <br />
            Telefon: +47 474 74 747
          </p>
        </section>

        <p className="terms-page__last-updated">
          Sist oppdatert: {new Date().toLocaleDateString("nb-NO")}
        </p>
      </div>
    </div>
  );
}

export default TermsPage;
