import React, { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { deleteUser } from "firebase/auth";
import {
  doc,
  deleteDoc,
  collection,
  query,
  where,
  getDocs,
} from "firebase/firestore";
import { db } from "../../backend/firebase/firebase";
import "./DeleteAccount.css";

const DeleteAccount: React.FC = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [confirmationText, setConfirmationText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteStep, setDeleteStep] = useState(1);

  const handleDeleteRequest = () => {
    setShowConfirmation(true);
    setDeleteStep(1);
  };

  const handleConfirmDelete = async () => {
    if (!user) return;

    if (confirmationText !== "SLETT MIN KONTO") {
      alert('Du må skrive "SLETT MIN KONTO" for å bekrefte slettingen');
      return;
    }

    setIsDeleting(true);
    setDeleteStep(2);

    try {
      // 1. Delete user bookings
      const bookingsQuery = query(
        collection(db, "bookings"),
        where("customerId", "==", user.uid)
      );
      const bookingsSnapshot = await getDocs(bookingsQuery);

      for (const bookingDoc of bookingsSnapshot.docs) {
        await deleteDoc(doc(db, "bookings", bookingDoc.id));
      }

      setDeleteStep(3);

      // 2. Delete user document
      await deleteDoc(doc(db, "users", user.uid));

      setDeleteStep(4);

      // 3. Clear local storage
      localStorage.removeItem("gdpr-consent");
      localStorage.removeItem("user-preferences");

      setDeleteStep(5);

      // 4. Delete Firebase Auth user (must be last)
      await deleteUser(user);

      // 5. Sign out and redirect
      await signOut();

      // Show success message and redirect
      alert(
        "Din konto er permanent slettet. Du blir nå omdirigert til forsiden."
      );
      navigate("/");
    } catch (error: any) {
      console.error("Feil ved sletting av konto:", error);

      if (error.code === "auth/requires-recent-login") {
        alert(
          "For sikkerhet må du logge inn på nytt før du kan slette kontoen din. Vennligst logg ut, logg inn igjen, og prøv på nytt."
        );
      } else {
        alert(
          "Det oppsto en feil ved sletting av kontoen. Vennligst kontakt oss på helene@knipetak.no for hjelp."
        );
      }

      setIsDeleting(false);
      setShowConfirmation(false);
      setDeleteStep(1);
    }
  };

  const handleCancel = () => {
    setShowConfirmation(false);
    setConfirmationText("");
    setDeleteStep(1);
    setIsDeleting(false);
  };

  if (!user) {
    return (
      <div className="delete-account">
        <p>Du må være logget inn for å slette kontoen din.</p>
      </div>
    );
  }

  if (showConfirmation) {
    return (
      <div className="delete-account delete-account--confirmation">
        <div className="delete-account__modal">
          <div className="delete-account__header">
            <h3>⚠️ Slett min konto permanent</h3>
          </div>

          {deleteStep === 1 && (
            <div className="delete-account__content">
              <div className="delete-account__warning">
                <p>
                  <strong>ADVARSEL:</strong> Denne handlingen kan ikke angres!
                </p>
                <p>
                  Ved å slette kontoen din vil følgende data bli permanent
                  fjernet:
                </p>
                <ul>
                  <li>All profilinformasjon</li>
                  <li>Bookinghistorikk</li>
                  <li>Helseopplysninger</li>
                  <li>Samtykkeinnstillinger</li>
                  <li>Alle andre personopplysninger</li>
                </ul>
              </div>

              <div className="delete-account__alternatives">
                <h4>Alternativer til sletting:</h4>
                <ul>
                  <li>
                    <strong>Midlertidig deaktivering:</strong> Kontakt oss på
                    helene@knipetak.no
                  </li>
                  <li>
                    <strong>Dataeksport:</strong> Last ned dine data før
                    sletting
                  </li>
                  <li>
                    <strong>Oppdater samtykke:</strong> Endre
                    personverninnstillinger
                  </li>
                </ul>
              </div>

              <div className="delete-account__confirmation">
                <label htmlFor="confirmation-text">
                  For å bekrefte slettingen, skriv:{" "}
                  <strong>SLETT MIN KONTO</strong>
                </label>
                <input
                  id="confirmation-text"
                  type="text"
                  value={confirmationText}
                  onChange={(e) => setConfirmationText(e.target.value)}
                  className="delete-account__input"
                  placeholder="Skriv: SLETT MIN KONTO"
                />
              </div>

              <div className="delete-account__buttons">
                <button
                  onClick={handleCancel}
                  className="delete-account__btn delete-account__btn--cancel"
                  disabled={isDeleting}
                >
                  Avbryt
                </button>
                <button
                  onClick={handleConfirmDelete}
                  className="delete-account__btn delete-account__btn--delete"
                  disabled={
                    isDeleting || confirmationText !== "SLETT MIN KONTO"
                  }
                >
                  Slett kontoen permanent
                </button>
              </div>
            </div>
          )}

          {deleteStep > 1 && (
            <div className="delete-account__progress">
              <h4>Sletter din konto...</h4>
              <div className="delete-account__steps">
                <div
                  className={`delete-account__step ${
                    deleteStep >= 2 ? "completed" : ""
                  }`}
                >
                  {deleteStep >= 2 ? "✅" : "⏳"} Sletter bookinger
                </div>
                <div
                  className={`delete-account__step ${
                    deleteStep >= 3 ? "completed" : ""
                  }`}
                >
                  {deleteStep >= 3 ? "✅" : "⏳"} Sletter profildata
                </div>
                <div
                  className={`delete-account__step ${
                    deleteStep >= 4 ? "completed" : ""
                  }`}
                >
                  {deleteStep >= 4 ? "✅" : "⏳"} Rydder lokal lagring
                </div>
                <div
                  className={`delete-account__step ${
                    deleteStep >= 5 ? "completed" : ""
                  }`}
                >
                  {deleteStep >= 5 ? "✅" : "⏳"} Sletter brukerkonto
                </div>
              </div>
              <p className="delete-account__progress-note">
                Vennligst ikke lukk denne siden mens slettingen pågår.
              </p>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="delete-account">
      <div className="delete-account__header">
        <h3>🗑️ Slett min konto</h3>
        <p>
          Hvis du ikke lenger ønsker å bruke våre tjenester, kan du slette
          kontoen din permanent.
        </p>
      </div>

      <div className="delete-account__info">
        <h4>Hva skjer når du sletter kontoen?</h4>
        <ul>
          <li>All profilinformasjon blir permanent slettet</li>
          <li>Bookinghistorikk og helseopplysninger fjernes</li>
          <li>Du kan ikke lenger logge inn med denne e-postadressen</li>
          <li>Slettingen kan ikke angres</li>
        </ul>
      </div>

      <div className="delete-account__recommendations">
        <h4>Før du sletter:</h4>
        <ul>
          <li>Avbryt alle fremtidige bookinger</li>
          <li>Last ned en kopi av dine data hvis ønskelig</li>
          <li>Vurder om midlertidig deaktivering er et bedre alternativ</li>
        </ul>
      </div>

      <div className="delete-account__contact">
        <p>
          <strong>Trenger du hjelp?</strong> Kontakt oss på{" "}
          <a href="mailto:helene@knipetak.no">helene@knipetak.no</a> før du sletter
          kontoen.
        </p>
      </div>

      <div className="delete-account__actions">
        <button
          onClick={handleDeleteRequest}
          className="delete-account__btn delete-account__btn--delete"
        >
          Slett min konto permanent
        </button>
      </div>
    </div>
  );
};

export default DeleteAccount;
