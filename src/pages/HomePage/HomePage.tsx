import React from "react";
import { Helmet } from "react-helmet-async";
import HeroHomePage from "../../components/HomePageComponents/HeroHomePage/HeroHomePage";
import InfoComponent from "../../components/HomePageComponents/InfoComponent/InfoComponent";
import RatingsComponent from "../../components/HomePageComponents/RatingsComponent/RatingsComponent";
import "../HomePage/HomePage.css";
import CTABook from "@/components/HomePageComponents/InfoComponent/CTA-Book/Cta-Book";

const HomePage: React.FC = () => {
  return (
    <>
      <Helmet>
        <title>Knipetak – Muskelterapeut på hjul i Bergen</title>
        <meta
          name="description"
          content="Knipetak er en mobil muskelterapeut i Bergen som kommer til deg – hjemme eller på jobb. Book profesjonell massasje og muskelterapi enkelt online."
        />
        <link rel="canonical" href="https://knipetak.no/" />
        <meta property="og:url" content="https://knipetak.no/" />
        <meta property="og:title" content="Knipetak – Muskelterapeut på hjul i Bergen" />
      </Helmet>
      <HeroHomePage />
      <div className="mainContentHomepage">
        <InfoComponent />
        <RatingsComponent />
        {/* Full width additional info section */}
        <div className="full-width-section">
          <div className="content-wrapper">
            <div className="additional-info">
              <p>
                Noen massasjebehandlinger krever en liggende massasje, mens
                andre massasjebehandlinger krever at du sitter på en stol. Jeg
                har både stol og benk i bilen. Gi gjerne beskjed hvilken type
                behandling du ønsker ved bestilling.
              </p>

              <div className="treatment-types">
                <div className="treatment-type">
                  <h4>Massasje på stol</h4>
                  <p>
                    Utføres med klær, uten olje på en ergonomisk tilpasset stol.
                    Enkelt, behagelig og tidseffektivt.
                  </p>
                </div>
                <div className="treatment-type">
                  <h4>Massasje på benk</h4>
                  <p>
                    Utføres med olje /flytende voks (bievoks) direkte på huden.
                    Foregår liggende på behandlerbenk.
                  </p>
                </div>
              </div>

              <CTABook />
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default HomePage;
