import { useEffect, useState } from "react";
import { fetchUsers } from "../../backend/firebase/services/firebase.userservice";
import "./AdminHomePage.css";
import { AdminAvailabilityManager } from "../../components/AdminAvailabilityManager/AdminAvailabilityManager";
import HandleBookings from "../../components/AdminBookingInterface/HandleBookings";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { UserType } from "../../backend/interfaces/UserData";
import "./AdminHomePage.css";

type AdminSection = "availability" | "bookings" | null;

function AdminHomePage() {
  const { user, userType, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedSection, setExpandedSection] = useState<AdminSection>(null);

  // Redirect hvis ikke admin
  useEffect(() => {
    if (!authLoading && (!user || userType !== UserType.ADMIN)) {
      navigate("/");
    }
  }, [user, userType, authLoading, navigate]);

  // Hent brukerdata kun én gang ved innlasting
  useEffect(() => {
    const getData = async () => {
      try {
        await fetchUsers(); // We still fetch users but don't store them since they're not used
      } catch (error: unknown) {
        console.error("Error fetching users:", error);
        setError("Kunne ikke laste data. Vennligst prøv igjen.");
      } finally {
        setLoading(false);
      }
    };
    getData();
  }, []);

  const handleSectionToggle = (section: AdminSection) => {
    setExpandedSection(expandedSection === section ? null : section);
  };

  if (authLoading || loading) {
    return (
      <>
        <div className="admin-content">
          <div className="loading">Laster...</div>
        </div>
      </>
    );
  }

  if (error) {
    return (
      <>
        <div className="admin-content">
          <div className="error">{error}</div>
        </div>
      </>
    );
  }

  return (
    <>
      <div className="admin-content">
        <h1 className="admin-title">Admin Dashboard</h1>
        <div className="admin-sections">
          <div className="section-button-group">
            <button
              className={`section-button ${
                expandedSection === "availability" ? "active" : ""
              }`}
              onClick={() => handleSectionToggle("availability")}
            >
              <div className="button-content">
                <span className="button-title">Tilgjengelighet</span>
                <span className="button-description">
                  Administrer arbeidstider og overstyr tidspunkter
                </span>
              </div>
              <span className="expand-icon">
                {expandedSection === "availability" ? "−" : "+"}
              </span>
            </button>

            <button
              className={`section-button ${
                expandedSection === "bookings" ? "active" : ""
              }`}
              onClick={() => handleSectionToggle("bookings")}
            >
              <div className="button-content">
                <span className="button-title">Behandlinger</span>
                <span className="button-description">
                  Administrer aktive og tidligere behandlinger
                </span>
              </div>
              <span className="expand-icon">
                {expandedSection === "bookings" ? "−" : "+"}
              </span>
            </button>
          </div>

          <div className="section-content">
            {expandedSection === "availability" && (
              <div className="expanded-section">
                <AdminAvailabilityManager />
              </div>
            )}

            {expandedSection === "bookings" && (
              <div className="expanded-section">
                <HandleBookings isExpanded={expandedSection === "bookings"} />
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

export default AdminHomePage;
