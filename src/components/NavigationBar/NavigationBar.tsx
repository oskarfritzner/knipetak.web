import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { UserType } from "../../backend/interfaces/UserData";
import { useState, useEffect } from "react";
import "./NavigationBar.css";
import logo from "../../assets/images/logo.png";

function NavigationBar() {
  const { user, userType, isLoading, isPending } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
      if (window.innerWidth > 768) {
        setIsMenuOpen(false);
      }
    };

    handleResize(); // Initial check
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Close menu when clicking outside
  useEffect(() => {
    if (!isMenuOpen) return;

    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (
        !target.closest(".navLinks") &&
        !target.closest(".hamburger-button")
      ) {
        setIsMenuOpen(false);
      }
    };

    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, [isMenuOpen]);

  // Prevent body scroll when menu is open
  useEffect(() => {
    if (isMobile) {
      document.body.style.overflow = isMenuOpen ? "hidden" : "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isMenuOpen, isMobile]);

  // Show a minimal loading state during initial load
  if (isLoading) {
    return (
      <div className="navBar">
        <img src={logo} alt="LOGO" className="logo" />
        <div className="navLinks">
          <div className="loading-skeleton"></div>
        </div>
      </div>
    );
  }

  const isAdmin = userType === UserType.ADMIN;

  const navigationLinks = (
    <>
      {/* Standard navigation links */}
      <div className="standard-links">
        <Link
          to="/"
          className={isPending ? "link-pending" : ""}
          onClick={() => setIsMenuOpen(false)}
        >
          Hjem
        </Link>
          {/* <Link
            to="/book"
            className={isPending ? "link-pending" : ""}
            onClick={() => setIsMenuOpen(false)}
          >
            Book Time
          </Link> */}
        <Link
          to="/behandlinger"
          className={isPending ? "link-pending" : ""}
          onClick={() => setIsMenuOpen(false)}
        >
          Behandlinger
        </Link>
        <Link
          to="/kontakt"
          className={isPending ? "link-pending" : ""}
          onClick={() => setIsMenuOpen(false)}
        >
          Kontakt
        </Link>
      </div>

      {/* Admin specific links */}
      {isAdmin && (
        <div className="admin-links">
          <Link
            to="/admin-home-page"
            className={`admin-link ${isPending ? "link-pending" : ""}`}
            onClick={() => setIsMenuOpen(false)}
          >
            Admin Dashboard
          </Link>
          <Link
            to="/admin-calendar-page"
            className={`admin-link ${isPending ? "link-pending" : ""}`}
            onClick={() => setIsMenuOpen(false)}
          >
            Admin Kalender
          </Link>
        </div>
      )}

      {/* Auth links */}
      <div className="auth-links">
        {user && (
          <Link
            to="/profile"
            className={isPending ? "link-pending" : ""}
            onClick={() => setIsMenuOpen(false)}
          >
            Profil
          </Link>
        )}
        {/*
        {!user && (
          <Link
            to="/login"
            className={isPending ? "link-pending" : ""}
            onClick={() => setIsMenuOpen(false)}
          >
            Logg inn
          </Link>
        )}
        */}
      </div>
    </>
  );

  return (
    <div className={`navBar ${isPending ? "nav-pending" : ""}`}>
      <Link to="/" onClick={() => setIsMenuOpen(false)} className="button-logo">
        <img src={logo} alt="LOGO" className="logo" />
      </Link>

      {/* Hamburger Button */}
      <button
        className={`hamburger-button ${isMenuOpen ? "open" : ""}`}
        onClick={() => setIsMenuOpen(!isMenuOpen)}
        aria-label="Meny"
      >
        <span></span>
        <span></span>
        <span></span>
      </button>

      {/* Navigation Links */}
      <div className={`navLinks ${isMenuOpen ? "open" : ""}`}>
        {navigationLinks}
      </div>

      {/* Overlay for mobile */}
      {isMobile && isMenuOpen && <div className="mobile-overlay" />}
    </div>
  );
}

export default NavigationBar;
