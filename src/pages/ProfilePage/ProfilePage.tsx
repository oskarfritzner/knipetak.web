import "./ProfilePage.css";
import React, { useState, useEffect } from "react";
import {
  getUserData,
  updateUserProfile,
} from "../../backend/firebase/services/firebase.userservice";
import { useNavigate } from "react-router-dom";
import { getUserBookings } from "../../backend/firebase/services/firebase.bookingservice";
import { BookingData } from "../../backend/interfaces/BookingData";
import { getTreatments } from "../../backend/firebase/services/firebase.treatmentservice";
import { Treatment } from "../../backend/interfaces/Treatment";
import { Gender, UserData } from "../../backend/interfaces/UserData";
import { useAuth } from "@/context/AuthContext";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import defaultProfileIcon from "../../assets/images/defaultProfileIcon.png";
import DataExport from "../../components/DataExport/DataExport";
import DeleteAccount from "../../components/DeleteAccount/DeleteAccount";

const Profile: React.FC = () => {
  // Use AuthContext instead of managing our own user state
  const { user, signOut: authSignOut, isLoading: authLoading } = useAuth();
  const [profileImage, setProfileImage] = useState<string>("");
  const [, setUserData] = useState<Partial<UserData> | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [bookings, setBookings] = useState<BookingData[]>([]);
  const [treatments, setTreatments] = useState<Treatment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [gender, setGender] = useState<Gender | "">("");
  const [birthYear, setBirthYear] = useState<number | "">("");
  const [address, setAddress] = useState<string>("");
  const [city, setCity] = useState<string>("");
  const [postalCode, setPostalCode] = useState<number | null>(null);
  const [healthIssues, setHealthIssues] = useState<string>("");
  const [addressError, setAddressError] = useState<string>("");
  const [birthYearError, setBirthYearError] = useState<string>("");
  const [phoneNumber, setPhoneNumber] = useState<string>("");
  const [phoneError, setPhoneError] = useState<string>("");
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string>("");
  const [showDeleteAccount, setShowDeleteAccount] = useState(false);
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);
  const [showDataExportModal, setShowDataExportModal] = useState(false);

  useEffect(() => {
    const loadUserData = async () => {
      if (user) {
        try {
          const [userDataResult, userBookings, treatmentsData] =
            await Promise.all([
              getUserData(user.uid),
              getUserBookings(user.uid),
              getTreatments(),
            ]);

          if (userDataResult) {
            setUserData(userDataResult);
            setGender(userDataResult.gender || "");
            setBirthYear(userDataResult.birthYear || "");
            setHealthIssues(userDataResult.healthIssues || "");
            setPhoneNumber(userDataResult.phoneNumber || "");
            setProfileImage(userDataResult.profileImage || "");
            if (userDataResult.location) {
              setAddress(userDataResult.location.address || "");
              setCity(userDataResult.location.city || "");
              setPostalCode(userDataResult.location.postalCode || null);
            }
          }

          setBookings(userBookings);
          setTreatments(treatmentsData);
        } catch (error) {
          console.error("Error fetching user data:", error);
        } finally {
          setIsLoading(false);
        }
      } else {
        setIsLoading(false);
      }
    };

    loadUserData();
  }, [user]); // Only depend on user from AuthContext

  // Handle escape key and body scroll lock for modals
  useEffect(() => {
    if (showDeleteAccount || showPrivacyModal || showDataExportModal) {
      // Lock body scroll
      document.body.style.overflow = "hidden";

      // Handle escape key
      const handleEscape = (e: KeyboardEvent) => {
        if (e.key === "Escape") {
          setShowDeleteAccount(false);
          setShowPrivacyModal(false);
          setShowDataExportModal(false);
        }
      };

      document.addEventListener("keydown", handleEscape);

      return () => {
        // Unlock body scroll
        document.body.style.overflow = "unset";
        document.removeEventListener("keydown", handleEscape);
      };
    }
  }, [showDeleteAccount, showPrivacyModal, showDataExportModal]);

  const handleImageUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file || !user) return;

    // Valider filtype
    if (!file.type.match(/image\/(jpeg|png)/)) {
      setUploadError("Kun JPG og PNG bilder er tillatt");
      return;
    }

    // Valider filstørrelse (maks 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setUploadError("Bildet er for stort. Maksimal størrelse er 5MB");
      return;
    }

    setIsUploading(true);
    setUploadError("");

    try {
      const storage = getStorage();
      const storageRef = ref(
        storage,
        `profile_images/${user.uid}/${file.name}`
      );

      // Last opp bildet
      await uploadBytes(storageRef, file);

      // Hent nedlastingslenke
      const downloadURL = await getDownloadURL(storageRef);

      // Oppdater brukerens profilbilde i Firestore
      await updateUserProfile(user.uid, { profileImage: downloadURL });

      // Oppdater lokal state
      setProfileImage(downloadURL);
    } catch (error) {
      console.error("Error uploading image:", error);
      setUploadError("Det oppsto en feil ved opplasting av bildet");
    } finally {
      setIsUploading(false);
    }
  };

  const navigate = useNavigate();

  const handleSignOut = async () => {
    try {
      await authSignOut(); // Use the signOut from AuthContext
      navigate("/");
    } catch (error) {
      console.error("Error signing out: ", error);
    }
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("nb-NO", {
      year: "numeric",
      month: "long",
      day: "numeric",
      weekday: "long",
    });
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString("nb-NO", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getTreatmentName = (treatmentId: string): string => {
    const treatment = treatments.find((t) => t.id === treatmentId);
    return treatment?.name || "Ukjent behandling";
  };

  // Valideringsfunksjoner
  const validateBirthYear = (value: string) => {
    const numValue = parseInt(value);
    const currentYear = new Date().getFullYear();

    if (isNaN(numValue)) {
      setBirthYearError("Fødselsår må være et tall");
      return false;
    }
    if (numValue < 1900 || numValue > currentYear) {
      setBirthYearError(`Fødselsår må være mellom 1900 og ${currentYear}`);
      return false;
    }
    if (!Number.isInteger(numValue)) {
      setBirthYearError("Fødselsår må være et helt tall");
      return false;
    }
    setBirthYearError("");
    return true;
  };

  const validateAddress = (value: string) => {
    // Norsk adresseformat: Gatenavn nummer, f.eks. "Kongens gate 1" eller "Slottsplassen 1"
    const addressRegex = /^[a-zA-ZæøåÆØÅ\s]+ \d+$/;
    if (!addressRegex.test(value)) {
      setAddressError("Ugyldig adresse. Må være på format: Gatenavn nummer");
      return false;
    }
    setAddressError("");
    return true;
  };

  const validatePhoneNumber = (value: string) => {
    // Norsk telefonnummerformat: 8 siffer, kan starte med +47 eller 0047
    const phoneRegex = /^(\+47|0047)?\s*[2-9]\d{7}$/;
    if (!phoneRegex.test(value.replace(/\s/g, ""))) {
      setPhoneError(
        "Ugyldig telefonnummer. Må være 8 siffer og kan starte med +47"
      );
      return false;
    }
    setPhoneError("");
    return true;
  };

  const handleSave = async () => {
    if (!user) return;

    // Validerer kun de feltene som faktisk er endret
    const updatedData: Partial<UserData> = {};

    if (birthYear !== "") {
      const isBirthYearValid = validateBirthYear(birthYear.toString());
      if (!isBirthYearValid) return;
      updatedData.birthYear = Number(birthYear);
    }

    if (address !== "") {
      const isAddressValid = validateAddress(address);
      if (!isAddressValid) return;
      updatedData.location = {
        id: "default-id",
        name: "default-name",
        address,
        city,
        postalCode: postalCode || 0,
      };
    }

    if (phoneNumber !== "") {
      const isPhoneValid = validatePhoneNumber(phoneNumber);
      if (!isPhoneValid) return;
      updatedData.phoneNumber = phoneNumber;
    }

    if (gender !== "") {
      updatedData.gender = gender as Gender;
    }

    if (healthIssues !== "") {
      updatedData.healthIssues = healthIssues;
    }

    // Hvis ingen felt er endret, avbryt
    if (Object.keys(updatedData).length === 0) {
      setIsEditing(false);
      return;
    }

    setIsSaving(true);
    try {
      await updateUserProfile(user.uid, updatedData);
      setUserData((prev) => ({ ...prev, ...updatedData }));
      setIsEditing(false);
    } catch (error) {
      console.error("Feil ved lagring av profil:", error);
      alert(
        "Det oppsto en feil ved lagring av profilen. Vennligst prøv igjen."
      );
    } finally {
      setIsSaving(false);
    }
  };

  if (authLoading) {
    return <div>Loading...</div>;
  }

  return (
    <>
      <div className="main-container">
        <div className="profile-container">
          <div className="profile-sidebar">
            <div className="profile-header">
              <div className="profile-image-container">
                <img
                  src={profileImage || defaultProfileIcon}
                  alt="Profile"
                  className="profile-image"
                  draggable="false"
                />
                <label className="image-upload-label">
                  <input
                    type="file"
                    onChange={handleImageUpload}
                    accept="image/jpeg,image/png"
                    className="image-upload-input"
                    disabled={isUploading}
                  />
                  <span className="image-upload-icon">
                    {isUploading ? "📤" : "📷"}
                  </span>
                </label>
                {uploadError && (
                  <span className="error-message">{uploadError}</span>
                )}
              </div>
              <h2 className="profile-name">{user?.displayName || "Bruker"}</h2>
              <p className="profile-email">
                {user?.email || "Ingen e-post tilgjengelig"}
              </p>
            </div>

            <div className="profile-actions">
              <button
                className={`action-button ${isEditing ? "active" : ""}`}
                onClick={() => setIsEditing(!isEditing)}
              >
                {isEditing ? "Avbryt" : "Rediger Profil"}
              </button>
              <button
                className="action-button delete"
                onClick={() => setShowDeleteAccount(true)}
              >
                Slett Profil
              </button>
              <button
                className="action-button privacy"
                onClick={() => setShowPrivacyModal(true)}
              >
                🛡️ Personvern
              </button>
              <button className="action-button logout" onClick={handleSignOut}>
                Logg ut
              </button>
            </div>
          </div>

          <div className="profile-content">
            <div className="profile-section">
              <h3>Personlig Informasjon</h3>
              {isLoading ? (
                <p>Laster inn brukerdata...</p>
              ) : (
                <div className="info-grid">
                  <div className="info-item">
                    <label>Kjønn</label>
                    <p>
                      {isEditing ? (
                        <select
                          value={gender}
                          onChange={(e) => setGender(e.target.value as Gender)}
                          className="form-select"
                        >
                          <option value="">Velg kjønn</option>
                          {Object.values(Gender).map((genderOption) => (
                            <option key={genderOption} value={genderOption}>
                              {genderOption}
                            </option>
                          ))}
                        </select>
                      ) : (
                        gender || "Ikke spesifisert"
                      )}
                    </p>
                  </div>
                  <div className="info-item">
                    <label>Fødselsår</label>
                    <p>
                      {isEditing ? (
                        <div className="input-with-error">
                          <input
                            type="number"
                            value={birthYear}
                            onChange={(e) => {
                              const value = e.target.value;
                              setBirthYear(value === "" ? "" : parseInt(value));
                              validateBirthYear(value);
                            }}
                            min="1900"
                            max={new Date().getFullYear()}
                            step="1"
                          />
                          {birthYearError && (
                            <span className="error-message">
                              {birthYearError}
                            </span>
                          )}
                        </div>
                      ) : (
                        birthYear || "Ikke spesifisert"
                      )}
                    </p>
                  </div>
                  <div className="info-item">
                    <label>Adresse</label>
                    <p>
                      {isEditing ? (
                        <div className="input-with-error">
                          <input
                            type="text"
                            value={address}
                            onChange={(e) => {
                              const value = e.target.value;
                              setAddress(value);
                              validateAddress(value);
                            }}
                            placeholder="F.eks: Kongens gate 1"
                          />
                          {addressError && (
                            <span className="error-message">
                              {addressError}
                            </span>
                          )}
                          <input
                            type="text"
                            value={city}
                            onChange={(e) => setCity(e.target.value)}
                            placeholder="By"
                            className="mt-2"
                          />
                          <input
                            type="number"
                            value={postalCode || ""}
                            onChange={(e) =>
                              setPostalCode(
                                e.target.value ? parseInt(e.target.value) : null
                              )
                            }
                            placeholder="Postnummer"
                            className="mt-2"
                          />
                        </div>
                      ) : address ? (
                        `${address}, ${postalCode} ${city}`
                      ) : (
                        "Ikke spesifisert"
                      )}
                    </p>
                  </div>
                  <div className="info-item">
                    <label>Telefonnummer</label>
                    <p>
                      {isEditing ? (
                        <div className="input-with-error">
                          <input
                            type="tel"
                            value={phoneNumber}
                            onChange={(e) => {
                              const value = e.target.value;
                              setPhoneNumber(value);
                              validatePhoneNumber(value);
                            }}
                            placeholder="F.eks: +47 12345678"
                          />
                          {phoneError && (
                            <span className="error-message">{phoneError}</span>
                          )}
                        </div>
                      ) : (
                        phoneNumber || "Ikke spesifisert"
                      )}
                    </p>
                  </div>
                  <div className="info-item full-width">
                    <label>Helseproblemer</label>
                    <p>
                      {isEditing ? (
                        <textarea
                          value={healthIssues}
                          onChange={(e) => setHealthIssues(e.target.value)}
                          placeholder="Beskriv eventuelle helseproblemer her..."
                        />
                      ) : (
                        healthIssues || "Ingen spesifisert"
                      )}
                    </p>
                  </div>
                </div>
              )}
              <div className="save-button-container">
                {isEditing && (
                  <button
                    className="action-button save"
                    onClick={handleSave}
                    disabled={
                      !!birthYearError ||
                      !!addressError ||
                      !!phoneError ||
                      isSaving
                    }
                  >
                    {isSaving ? "Lagrer..." : "Lagre endringer"}
                  </button>
                )}
              </div>
            </div>

            <div className="profile-section">
              <h3>Behandlingshistorikk</h3>
              <div className="treatment-history">
                {isLoading ? (
                  <p>Laster inn behandlinger...</p>
                ) : bookings.length > 0 ? (
                  bookings.map((booking, index) => {
                    console.log("Rendering booking:", booking);
                    const treatmentName = getTreatmentName(booking.treatmentId);
                    console.log("Treatment name:", treatmentName);
                    return (
                      <div key={index} className="treatment-item">
                        <div className="treatment-info">
                          <h4>{treatmentName}</h4>
                          <p>
                            {formatDate(booking.date)} (
                            {formatTime(booking.timeslot.start)} -{" "}
                            {formatTime(booking.timeslot.end)})
                          </p>
                          <p>Varighet: {booking.duration} minutter</p>
                          <p>
                            Sted: {booking.location.address},{" "}
                            {booking.location.postalCode}{" "}
                            {booking.location.city}
                          </p>
                          <p>Pris: {booking.price} kr</p>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <p>Ingen behandlinger funnet</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Delete Account Modal */}
      {showDeleteAccount && (
        <div
          className="delete-modal-overlay"
          onClick={() => setShowDeleteAccount(false)}
        >
          <div
            className="delete-modal-content"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="delete-modal-header">
              <h3>🗑️ Slett min konto</h3>
              <button
                className="delete-modal-close"
                onClick={() => setShowDeleteAccount(false)}
              >
                ✕
              </button>
            </div>
            <div className="delete-modal-body">
              <DeleteAccount />
            </div>
          </div>
        </div>
      )}

      {/* Privacy Modal */}
      {showPrivacyModal && (
        <div
          className="privacy-modal-overlay"
          onClick={() => setShowPrivacyModal(false)}
        >
          <div
            className="privacy-modal-content"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="privacy-modal-header">
              <h3>🛡️ Personvern og dine rettigheter</h3>
              <button
                className="privacy-modal-close"
                onClick={() => setShowPrivacyModal(false)}
              >
                ✕
              </button>
            </div>
            <div className="privacy-modal-body">
              <div className="privacy-section">
                <h4>Dine personvernrettigheter</h4>
                <p>Som bruker av våre tjenester har du følgende rettigheter:</p>
                <ul>
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
                    opplysningene dine slettet
                  </li>
                  <li>
                    <strong>Rett til dataportabilitet:</strong> Du kan få en
                    kopi av dine data
                  </li>
                  <li>
                    <strong>Rett til å trekke tilbake samtykke:</strong> Du kan
                    når som helst trekke tilbake samtykket ditt
                  </li>
                </ul>
              </div>

              <div className="privacy-section">
                <h4>Hvilke data vi samler</h4>
                <ul>
                  <li>Kontaktinformasjon (navn, e-post, telefon)</li>
                  <li>Fødselsdato og kjønn</li>
                  <li>Helseinformasjon relatert til behandling</li>
                  <li>Adresse for hjemmebehandling</li>
                  <li>Bookinghistorikk og preferanser</li>
                </ul>
              </div>

              <div className="privacy-section">
                <h4>Hvordan vi bruker dataene</h4>
                <ul>
                  <li>Administrere dine bookinger og behandlinger</li>
                  <li>Kommunisere med deg om dine timer</li>
                  <li>Gi deg personlig tilpasset behandling</li>
                  <li>Forbedre våre tjenester</li>
                  <li>Overholde lovpålagte forpliktelser</li>
                </ul>
              </div>

              <div className="privacy-section">
                <h4>Lagring og sikkerhet</h4>
                <p>
                  Vi bruker Google Firebase som teknisk plattform for sikker
                  lagring av dine data. All data behandles i tråd med
                  GDPR-regelverket og Googles sikkerhets- og
                  personvernstandarder.
                </p>
                <p>
                  Helseopplysninger oppbevares i henhold til helsepersonellovens
                  krav om oppbevaring av pasientjournaler.
                </p>
              </div>

              <div className="privacy-section">
                <h4>Kontakt oss</h4>
                <p>
                  For spørsmål om personvern eller for å utøve dine rettigheter,
                  kontakt oss på:
                </p>
                <p>
                  <strong>E-post:</strong> helene@knipetak.no
                  <br />
                  <strong>Telefon:</strong> +47 902 75 748
                  <br />
                  <strong>Adresse:</strong> Tobrotet 48, 5355 Knarrevik
                </p>
              </div>

              <div className="privacy-actions">
                <p>
                  <strong>Ønsker du å utøve dine rettigheter?</strong>
                </p>
                <div className="privacy-buttons">
                  <button
                    className="privacy-action-btn primary"
                    onClick={() => {
                      setShowPrivacyModal(false);
                      setShowDataExportModal(true);
                    }}
                  >
                    📥 Eksporter mine data
                  </button>
                  <button
                    className="privacy-action-btn secondary"
                    onClick={() => {
                      setShowPrivacyModal(false);
                      setShowDeleteAccount(true);
                    }}
                  >
                    🗑️ Slett min konto
                  </button>
                  <a
                    href="/privacy"
                    className="privacy-action-btn tertiary"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    📋 Les full personvernerklæring
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Data Export Modal */}
      {showDataExportModal && (
        <div
          className="data-export-modal-overlay"
          onClick={() => setShowDataExportModal(false)}
        >
          <div
            className="data-export-modal-content"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="data-export-modal-header">
              <h3>📥 Eksporter mine data</h3>
              <button
                className="data-export-modal-close"
                onClick={() => setShowDataExportModal(false)}
              >
                ✕
              </button>
            </div>
            <div className="data-export-modal-body">
              <DataExport />
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Profile;
