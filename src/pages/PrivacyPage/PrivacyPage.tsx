import "./PrivacyPage.css";

function PrivacyPage() {
  return (
    <div className="privacy-page">
      <div className="privacy-page__container">
        <h1 className="privacy-page__title">Personvernerklæring</h1>

        <section className="privacy-page__section">
          <h2 className="privacy-page__section-title">
            1. Innledning og formål
          </h2>
          <p className="privacy-page__text">
            Knipetak er opptatt av å beskytte dine personopplysninger. Denne
            personvernerklæringen beskriver hvordan vi samler inn, bruker og
            beskytter personopplysningene dine når du bruker våre tjenester. Vi
            behandler dine personopplysninger i samsvar med den norske
            personopplysningsloven og EUs personvernforordning (GDPR).
          </p>
        </section>

        <section className="privacy-page__section">
          <h2 className="privacy-page__section-title">
            2. Behandlingsansvarlig
          </h2>
          <p className="privacy-page__text">
            Knipetak er ansvarlig for behandlingen av personopplysninger som
            samles inn gjennom vår nettside og booking-system. Du kan kontakte
            oss på:
          </p>
          <p className="privacy-page__text">
            E-post: helene@knipetak.no
            <br />
            Telefon: +47 902 75 748
            <br />
            Adresse: Tobrotet 48, 5355 Knarrevik
          </p>
        </section>

        <section className="privacy-page__section">
          <h2 className="privacy-page__section-title">
            3. Hvilke personopplysninger vi behandler
          </h2>
          <p className="privacy-page__text">
            Vi samler inn og behandler følgende typer personopplysninger:
          </p>
          <ul className="privacy-page__list">
            <li>Kontaktinformasjon (navn, e-postadresse, telefonnummer)</li>
            <li>Fødselsdato</li>
            <li>Helseinformasjon relatert til muskelskader og behandling</li>
            <li>Informasjon om tidligere behandlinger</li>
            <li>IP-adresse og informasjon om din bruk av nettsiden</li>
          </ul>
        </section>

        <section className="privacy-page__section">
          <h2 className="privacy-page__section-title">
            4. Formål med behandlingen
          </h2>
          <p className="privacy-page__text">
            Vi behandler dine personopplysninger for følgende formål:
          </p>
          <ul className="privacy-page__list">
            <li>
              Å administrere dine bookinger og gi deg best mulig behandling
            </li>
            <li>Å kommunisere med deg om dine timer og behandlinger</li>
            <li>Å sende deg relevant informasjon om våre tjenester</li>
            <li>Åforbedre våre tjenester og nettside</li>
            <li>Å overholde lovpålagte forpliktelser innen helsesektoren</li>
          </ul>
        </section>

        <section className="privacy-page__section">
          <h2 className="privacy-page__section-title">
            5. Rettslig grunnlag for behandling
          </h2>
          <p className="privacy-page__text">
            Vi behandler dine personopplysninger basert på følgende rettslige
            grunnlag:
          </p>
          <ul className="privacy-page__list">
            <li>Ditt samtykke</li>
            <li>Oppfyllelse av avtale (behandlingskontrakt)</li>
            <li>Rettslige forpliktelser som gjelder for helsetjenester</li>
            <li>
              Vår berettigede interesse i å drive og forbedre våre tjenester
            </li>
          </ul>
        </section>

        <section className="privacy-page__section">
          <h2 className="privacy-page__section-title">
            6. Lagring og sikkerhet
          </h2>
          <p className="privacy-page__text">
            Vi oppbevarer dine personopplysninger så lenge det er nødvendig for
            å oppfylle formålene beskrevet ovenfor, eller så lenge det er
            påkrevd av gjeldende lovgivning. For helseopplysninger følger vi
            helsepersonellovens krav om oppbevaring av pasientjournaler.
          </p>
          <p className="privacy-page__text">
            Vi bruker Google Firebase som teknisk plattform for autentisering,
            datalagring og drift av tjenesten. Personopplysninger lagres i
            Firebase Authentication, Firestore Database og Firebase Storage, og
            all data behandles i tråd med Googles sikkerhets- og
            personvernstandarder.
          </p>
          <p className="privacy-page__text">
            Vi har implementert både tekniske og organisatoriske
            sikkerhetstiltak for å beskytte dine personopplysninger mot
            uautorisert tilgang, tap eller endring. Kun autorisert personell har
            tilgang til helseopplysninger, og databehandlingen skjer innenfor
            rammen av inngåtte databehandleravtaler og GDPR-regelverket.
          </p>
        </section>

        <section className="privacy-page__section">
          <h2 className="privacy-page__section-title">
            7. Deling av personopplysninger
          </h2>
          <p className="privacy-page__text">
            Vi deler kun dine personopplysninger med:
          </p>
          <ul className="privacy-page__list">
            <li>
              Behandlere som er ansatt hos oss og som trenger informasjonen for
              å kunne gi deg best mulig behandling
            </li>
            <li>
              Leverandører av IT-tjenester som hjelper oss med å drifte våre
              systemer (under strenge databehandleravtaler)
            </li>
            <li>Offentlige myndigheter når det er påkrevet ved lov</li>
          </ul>
          <p className="privacy-page__text">
            Vi selger aldri dine personopplysninger til tredjeparter og deler
            dem ikke for markedsføringsformål uten ditt uttrykkelige samtykke.
          </p>
        </section>

        <section className="privacy-page__section">
          <h2 className="privacy-page__section-title">8. Dine rettigheter</h2>
          <p className="privacy-page__text">
            Som bruker av våre tjenester har du følgende rettigheter:
          </p>
          <ul className="privacy-page__list">
            <li>
              <strong>Rett til innsyn:</strong> Du kan se alle
              personopplysninger vi har om deg
            </li>
            <li>
              <strong>Rett til korrigering:</strong> Du kan be oss rette
              uriktige opplysninger
            </li>
            <li>
              <strong>Rett til sletting:</strong> Du kan be om å få
              opplysningene dine slettet (med unntak av lovpålagte
              journalopplysninger)
            </li>
            <li>
              <strong>Rett til begrensning:</strong> Du kan be oss begrense
              behandlingen av dine opplysninger
            </li>
            <li>
              <strong>Rett til dataportabilitet:</strong> Du kan få en kopi av
              dine data i et strukturert format
            </li>
            <li>
              <strong>Rett til å trekke tilbake samtykke:</strong> Du kan når
              som helst trekke tilbake samtykket ditt
            </li>
            <li>
              <strong>Rett til å klage:</strong> Du kan klage til Datatilsynet
              hvis du mener vi behandler dine opplysninger feil
            </li>
          </ul>
          <p className="privacy-page__text">
            <strong>Slik utøver du rettighetene dine:</strong>
          </p>
          <ul className="privacy-page__list">
            <li>
              <strong>Innsyn og eksport:</strong> Logg inn på din profil og bruk
              "Eksporter mine data"-funksjonen
            </li>
            <li>
              <strong>Sletting av konto:</strong> Logg inn og bruk "Slett min
              konto"-funksjonen i profilinnstillingene
            </li>
            <li>
              <strong>Endring av samtykke:</strong> Bruk samtykke-innstillingene
              på nettsiden
            </li>
            <li>
              <strong>Øvrige henvendelser:</strong> Kontakt oss på
              helene@knipetak.no
            </li>
          </ul>
          <p className="privacy-page__text">
            Vi vil svare på henvendelser om utøvelse av rettigheter innen 30
            dager.
          </p>
        </section>

        <section className="privacy-page__section">
          <h2 className="privacy-page__section-title">
            9. Cookies og sporingsteknologi
          </h2>
          <p className="privacy-page__text">
            Per i dag benytter ikke nettsiden informasjonskapsler (cookies) til
            analyse, sporing eller markedsføringsformål. Kun funksjonell
            informasjon som er nødvendig for tjenestens drift (som
            brukerinnlogging via Firebase) lagres. Skulle dette endres i
            fremtiden, vil det innhentes eksplisitt samtykke i henhold til
            gjeldende lovverk.
          </p>
        </section>

        <section className="privacy-page__section">
          <h2 className="privacy-page__section-title">
            10. Endringer i personvernerklæringen
          </h2>
          <p className="privacy-page__text">
            Vi forbeholder oss retten til å oppdatere denne
            personvernerklæringen ved behov. Ved vesentlige endringer vil vi
            informere deg via e-post eller ved varsel på vår nettside. Vi
            oppfordrer deg til å regelmessig sjekke denne siden for
            oppdateringer.
          </p>
        </section>

        <p className="privacy-page__last-updated">
          Sist oppdatert: {new Date().toLocaleDateString("nb-NO")}
        </p>
      </div>
    </div>
  );
}

export default PrivacyPage;
