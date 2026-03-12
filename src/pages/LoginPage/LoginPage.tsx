import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import {
  validateUsername,
  validatePassword,
  calculatePasswordStrength,
} from "../../utils/contentValidation";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile,
  GoogleAuthProvider,
  signInWithPopup,
  getAuth,
  UserCredential,
  AuthError,
} from "firebase/auth";
import { createUserDocument } from "../../backend/firebase/services/firebase.userservice";
import { UserType } from "../../backend/interfaces/UserData";
import "./LoginPage.css";

function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [username, setUsername] = useState("");
  const [error, setError] = useState("");
  const [isRegistering, setIsRegistering] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState({
    strength: 0,
    message: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [showPasswordRequirements, setShowPasswordRequirements] =
    useState(false);
  const navigate = useNavigate();
  const { user } = useAuth();
  const auth = getAuth();

  if (user) {
    navigate("/");
    return null;
  }

  const handleGoogleSignIn = async () => {
    try {
      setIsLoading(true);
      setError("");

      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);

      if (result.user) {
        const credential = result as UserCredential & {
          additionalUserInfo?: { isNewUser?: boolean };
        };
        const isNewUser = credential.additionalUserInfo?.isNewUser;

        if (isNewUser) {
          await createUserDocument(result.user.uid, {
            uid: result.user.uid,
            displayName: result.user.displayName || "",
            email: result.user.email || "",
            userType: UserType.CUSTOMER,
            createdAt: new Date(),
            birthYear: 0,
            healthIssues: "",
            location: {
              id: "",
              name: "",
              address: "",
              city: "",
              postalCode: 0,
            },
            phoneNumber: "",
          });
        }

        navigate("/");
      }
    } catch (error) {
      console.error("Google sign-in error:", error);
      const authError = error as AuthError;
      switch (authError.code) {
        case "auth/popup-closed-by-user":
          setError("Pålogging avbrutt. Vennligst prøv igjen.");
          break;
        case "auth/popup-blocked":
          setError(
            "Popup ble blokkert. Vennligst tillat popups for denne nettsiden.",
          );
          break;
        default:
          setError("Kunne ikke logge inn med Google. Prøv igjen.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const passwordRequirements = [
    "Minst 6 tegn",
    "Minst én stor bokstav",
    "Minst én liten bokstav",
    "Minst ett tall",
    'Minst ett spesialtegn (!@#$%^&*(),.?":{}|<>)',
  ];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setError("");

    switch (id) {
      case "email":
        setEmail(value);
        break;
      case "password":
        setPassword(value);
        if (isRegistering) {
          setPasswordStrength(calculatePasswordStrength(value));
        }
        break;
      case "confirmPassword":
        setConfirmPassword(value);
        break;
      case "username":
        setUsername(value);
        break;
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigate("/");
    } catch (error) {
      console.error("Login error:", error);
      const authError = error as AuthError;
      switch (authError.code) {
        case "auth/invalid-email":
          setError("Ugyldig e-postadresse.");
          break;
        case "auth/user-disabled":
          setError("Denne kontoen er deaktivert.");
          break;
        case "auth/user-not-found":
        case "auth/wrong-password":
          setError("Feil e-post eller passord.");
          break;
        case "auth/too-many-requests":
          setError("For mange mislykkede forsøk. Prøv igjen senere.");
          break;
        default:
          setError("Kunne ikke logge inn. Vennligst prøv igjen.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();

    const usernameValidation = validateUsername(username);
    if (!usernameValidation.valid) {
      setError(usernameValidation.reason || "Ugyldig brukernavn");
      return;
    }

    const passwordValidation = validatePassword(password);
    if (!passwordValidation.valid) {
      setError(passwordValidation.reason || "Ugyldig passord");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passordene er ikke like");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password,
      );
      const user = userCredential.user;

      await updateProfile(user, { displayName: username });

      await createUserDocument(user.uid, {
        uid: user.uid,
        displayName: username,
        email: email,
        userType: UserType.CUSTOMER,
        createdAt: new Date(),
        birthYear: 0,
        healthIssues: "",
        location: {
          id: "",
          name: "",
          address: "",
          city: "",
          postalCode: 0,
        },
        phoneNumber: "",
      });

      navigate("/");
    } catch (error) {
      console.error("Registration error:", error);
      const authError = error as AuthError;
      switch (authError.code) {
        case "auth/email-already-in-use":
          setError("En konto med denne e-postadressen eksisterer allerede.");
          break;
        case "auth/invalid-email":
          setError("Vennligst oppgi en gyldig e-postadresse.");
          break;
        case "auth/operation-not-allowed":
          setError("Registrering med e-post og passord er ikke aktivert.");
          break;
        case "auth/weak-password":
          setError("Passordet er for svakt. Det må være minst 6 tegn langt.");
          break;
        default:
          setError("Kunne ikke opprette konto. Vennligst prøv igjen.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <div className="login-container">
        <div className="login-box">
          <h1>{isRegistering ? "Registrer deg" : "Logg Inn"}</h1>
          {error && <p className="error-message">{error}</p>}
          <form onSubmit={isRegistering ? handleRegister : handleLogin}>
            {isRegistering && (
              <div className="form-group">
                <label htmlFor="username">Navn</label>
                <input
                  type="text"
                  id="username"
                  value={username}
                  onChange={handleInputChange}
                  required
                  placeholder="Velg et brukernavn"
                  disabled={isLoading}
                />
              </div>
            )}
            <div className="form-group">
              <label htmlFor="email">E-post</label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={handleInputChange}
                required
                disabled={isLoading}
              />
            </div>
            <div className="form-group">
              <label htmlFor="password">
                Passord
                {isRegistering && (
                  <button
                    type="button"
                    className="info-button"
                    onClick={() =>
                      setShowPasswordRequirements(!showPasswordRequirements)
                    }
                    aria-label="Vis passordkrav"
                  >
                    ?
                  </button>
                )}
              </label>
              {showPasswordRequirements && (
                <div className="password-requirements">
                  <h4>Et sterkt passord inneholder:</h4>
                  <ul>
                    {passwordRequirements.map((req, index) => (
                      <li key={index}>{req}</li>
                    ))}
                  </ul>
                </div>
              )}
              <div className="password-input-container">
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  value={password}
                  onChange={handleInputChange}
                  required
                  disabled={isLoading}
                />
                <button
                  type="button"
                  className="toggle-password-button"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? "Skjul passord" : "Vis passord"}
                  disabled={isLoading}
                >
                  {showPassword ? "Skjul" : "Vis"}
                </button>
              </div>
              {isRegistering && password && (
                <div className="password-strength-container">
                  <div className="password-strength-bar">
                    {[...Array(5)].map((_, index) => (
                      <div
                        key={index}
                        className={`strength-segment strength-${
                          index <= passwordStrength.strength
                            ? passwordStrength.strength
                            : ""
                        }`}
                      />
                    ))}
                  </div>
                  <span className="password-strength-text">
                    Passordstyrke: {passwordStrength.message}
                  </span>
                </div>
              )}
            </div>
            {isRegistering && (
              <div className="form-group">
                <label htmlFor="confirmPassword">Bekreft passord</label>
                <div className="password-input-container">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    id="confirmPassword"
                    value={confirmPassword}
                    onChange={handleInputChange}
                    required
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    className="toggle-password-button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    aria-label={
                      showConfirmPassword ? "Skjul passord" : "Vis passord"
                    }
                    disabled={isLoading}
                  >
                    {showConfirmPassword ? "Skjul" : "Vis"}
                  </button>
                </div>
              </div>
            )}
            <button type="submit" className="login-button" disabled={isLoading}>
              {isLoading ? (
                <span></span>
              ) : isRegistering ? (
                "Registrer deg"
              ) : (
                "Logg Inn"
              )}
            </button>
          </form>

          <button
            className="google-button"
            onClick={handleGoogleSignIn}
            disabled={isLoading}
          >
            {isRegistering ? "Registrer deg med Google" : "Logg inn med Google"}
          </button>

          <div className="toggle-form">
            <button
              className="change-button"
              onClick={() => {
                setIsRegistering(!isRegistering);
                setError("");
                setUsername("");
                setPassword("");
                setConfirmPassword("");
                setShowPasswordRequirements(false);
              }}
              disabled={isLoading}
            >
              {isRegistering
                ? "Har du allerede en konto? Logg inn"
                : "Ny bruker? Registrer deg"}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

export default LoginPage;
