import { useState, useEffect } from "react";
import emailjs from "@emailjs/browser";
import "./ContactPage.css";
import { useAuth } from "@/context/AuthContext";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPaperPlane, faEnvelope, faPhone } from "@fortawesome/free-solid-svg-icons";

function ContactPage() {
  const { user } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState(user?.email || "");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Scroll to top on component mount
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Update email when user changes (e.g., after login)
  useEffect(() => {
    if (user?.email) {
      setEmail(user.email);
    }
  }, [user]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { id, value } = e.target;
    setError("");
    setSuccess("");

    if (id === "name") setName(value);
    if (id === "message") setMessage(value);
    if (id === "email" && !user) setEmail(value); // Only update if not logged in
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const templateParams = {
        name: name,
        email: email,
        message: message,
      };

      await emailjs.send(
        "service_8cu23dq",
        "template_lvwabq4",
        templateParams,
        "zpYAgcaUsRUPATaGB",
      );

      setSuccess("Meldingen din har blitt sendt!");
      setName("");
      setMessage("");
    } catch (err) {
      console.error("Failed to send message:", err);
      setError("Kunne ikke sende meldingen. Vennligst prøv igjen.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="contact-container">
      <div className="contact-shell">
        <header className="contact-page-header">
          <h1 className="contact-page-title">Kontakt</h1>
          <p className="contact-page-subtitle">
            Send oss en melding, så svarer vi så fort vi kan.
          </p>
        </header>

        <div className="contact-grid">
          <aside className="contact-card contact-card--info contact-box--animated">
            <h2 className="contact-card-title">Kontaktinformasjon</h2>
            <p className="contact-card-text">
              Du kan også ringe eller sende e-post direkte.
            </p>

            <div className="contact-info">
              <div className="contact-info__item">
                <FontAwesomeIcon icon={faPhone} className="contact-info__icon" />
                <span className="contact-info__text">+47 902 75 748</span>
              </div>
              <div className="contact-info__divider"></div>
              <div className="contact-info__item">
                <FontAwesomeIcon icon={faEnvelope} className="contact-info__icon" />
                <span className="contact-info__text">helene@knipetak.no</span>
              </div>
            </div>
          </aside>

          <section className="contact-card contact-card--form contact-box--animated">
            <h2 className="contact-card-title">Send melding</h2>

            {error && <div className="error-message">{error}</div>}
            {success && <div className="success-message">{success}</div>}

            <form onSubmit={handleSubmit} className="contact-form">
              <div className="form-group">
                <label htmlFor="name" className="form-label">
                  Navn
                </label>
                <input
                  id="name"
                  type="text"
                  autoComplete="name"
                  value={name}
                  onChange={handleInputChange}
                  className="form-input"
                  placeholder="Ditt navn"
                  required
                  disabled={isLoading}
                />
              </div>

              <div className="form-group">
                <label htmlFor="email" className="form-label">
                  E-post
                </label>
                <input
                  id="email"
                  type="email"
                  inputMode="email"
                  autoComplete="email"
                  value={email}
                  onChange={handleInputChange}
                  className="form-input"
                  placeholder="navn@epost.no"
                  required
                  disabled={!!user || isLoading}
                />
                {user && (
                  <p className="form-hint">
                    E-post er hentet fra profilen din.
                  </p>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="message" className="form-label">
                  Beskjed
                </label>
                <textarea
                  id="message"
                  value={message}
                  onChange={handleInputChange}
                  className="form-input form-input--tall"
                  placeholder="Skriv meldingen din her..."
                  required
                  disabled={isLoading}
                />
              </div>

              <button
                type="submit"
                className="submit-button submit-button--animated"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <span>Sender</span>
                    <span className="loading-spinner" />
                  </>
                ) : (
                  <>
                    <FontAwesomeIcon icon={faPaperPlane} />
                    <span>Send</span>
                  </>
                )}
              </button>
            </form>
          </section>
        </div>
      </div>
    </div>
  );
}

export default ContactPage;
