import React, { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { getUserData } from "../../backend/firebase/services/firebase.userservice";
import { getUserBookings } from "../../backend/firebase/services/firebase.bookingservice";
import ConsentService from "../../services/consentService";
import "./DataExport.css";

interface ExportData {
  userData: any;
  bookings: any[];
  consentData: any;
  exportDate: string;
}

const DataExport: React.FC = () => {
  const { user } = useAuth();
  const [isExporting, setIsExporting] = useState(false);
  const [exportComplete, setExportComplete] = useState(false);

  const exportUserData = async () => {
    if (!user) {
      alert("Du må være logget inn for å eksportere data");
      return;
    }

    setIsExporting(true);
    setExportComplete(false);

    try {
      // Fetch user data
      const userData = await getUserData(user.uid);

      // Fetch user bookings
      const bookings = await getUserBookings(user.uid);

      // Get consent data using ConsentService
      const consentData = ConsentService.getConsent();
      const consentSummary = ConsentService.getConsentSummary();

      // Prepare export data
      const exportData: ExportData = {
        userData: {
          uid: userData?.uid,
          displayName: userData?.displayName,
          email: userData?.email,
          birthYear: userData?.birthYear,
          gender: userData?.gender,
          healthIssues: userData?.healthIssues,
          location: userData?.location,
          phoneNumber: userData?.phoneNumber,
          userType: userData?.userType,
          createdAt: userData?.createdAt,
        },
        bookings: bookings.map((booking) => ({
          bookingId: booking.bookingId,
          date: booking.date,
          duration: booking.duration,
          location: booking.location,
          price: booking.price,
          status: booking.status,
          customerMessage: booking.customerMessage,
          timeslot: booking.timeslot,
          treatmentId: booking.treatmentId,
          isGuestBooking: booking.isGuestBooking,
        })),
        consentData: {
          rawData: consentData,
          summary: consentSummary,
          preferences: ConsentService.getConsentPreferences(),
        },
        exportDate: new Date().toISOString(),
      };

      // Create and download JSON file
      const dataStr = JSON.stringify(exportData, null, 2);
      const dataBlob = new Blob([dataStr], { type: "application/json" });
      const url = URL.createObjectURL(dataBlob);

      const link = document.createElement("a");
      link.href = url;
      link.download = `knipetak-mine-data-${
        new Date().toISOString().split("T")[0]
      }.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      URL.revokeObjectURL(url);

      setExportComplete(true);
    } catch (error) {
      console.error("Feil ved eksport av data:", error);
      alert("Det oppsto en feil ved eksport av data. Vennligst prøv igjen.");
    } finally {
      setIsExporting(false);
    }
  };

  const exportUserDataAsCSV = async () => {
    if (!user) {
      alert("Du må være logget inn for å eksportere data");
      return;
    }

    setIsExporting(true);

    try {
      const userData = await getUserData(user.uid);
      const bookings = await getUserBookings(user.uid);

      // Create CSV content
      let csvContent = "data:text/csv;charset=utf-8,";

      // User data section
      csvContent += "BRUKERINFORMASJON\n";
      csvContent += "Felt,Verdi\n";
      csvContent += `Navn,${userData?.displayName || ""}\n`;
      csvContent += `E-post,${userData?.email || ""}\n`;
      csvContent += `Telefon,${userData?.phoneNumber || ""}\n`;
      csvContent += `Fødselsår,${userData?.birthYear || ""}\n`;
      csvContent += `Kjønn,${userData?.gender || ""}\n`;
      csvContent += `Helseopplysninger,${userData?.healthIssues || ""}\n`;
      csvContent += `Adresse,${userData?.location?.address || ""}\n`;
      csvContent += `By,${userData?.location?.city || ""}\n`;
      csvContent += `Postnummer,${userData?.location?.postalCode || ""}\n`;
      csvContent += `Opprettet,${userData?.createdAt || ""}\n\n`;

      // Bookings section
      csvContent += "BOOKINGER\n";
      csvContent +=
        "Booking ID,Dato,Tid,Behandling,Varighet,Pris,Status,Lokasjon,Melding\n";

      bookings.forEach((booking) => {
        const date =
          booking.date instanceof Date
            ? booking.date.toLocaleDateString("nb-NO")
            : booking.date;
        const startTime =
          booking.timeslot?.start instanceof Date
            ? booking.timeslot.start.toLocaleTimeString("nb-NO", {
                hour: "2-digit",
                minute: "2-digit",
              })
            : booking.timeslot?.start;
        const endTime =
          booking.timeslot?.end instanceof Date
            ? booking.timeslot.end.toLocaleTimeString("nb-NO", {
                hour: "2-digit",
                minute: "2-digit",
              })
            : booking.timeslot?.end;

        csvContent += `${booking.bookingId || ""},${
          date || ""
        },${startTime}-${endTime},${booking.treatmentId || ""},${
          booking.duration || ""
        } min,${booking.price || ""} kr,${booking.status || ""},${
          booking.location?.address || ""
        },${booking.customerMessage || ""}\n`;
      });

      // Create and download CSV file
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute(
        "download",
        `knipetak-mine-data-${new Date().toISOString().split("T")[0]}.csv`
      );
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      setExportComplete(true);
    } catch (error) {
      console.error("Feil ved CSV-eksport:", error);
      alert("Det oppsto en feil ved eksport av data. Vennligst prøv igjen.");
    } finally {
      setIsExporting(false);
    }
  };

  if (!user) {
    return (
      <div className="data-export">
        <p>Du må være logget inn for å eksportere dine data.</p>
      </div>
    );
  }

  return (
    <div className="data-export">
      <div className="data-export__header">
        <h3>📥 Eksporter mine data</h3>
        <p>
          Du har rett til å få en kopi av alle personopplysninger vi har om deg.
          Dette inkluderer profilinformasjon, bookinghistorikk og
          samtykkeinnstillinger.
        </p>
      </div>

      <div className="data-export__options">
        <div className="data-export__option">
          <h4>JSON-format</h4>
          <p>Komplett datasett i maskinlesbart format</p>
          <button
            onClick={exportUserData}
            disabled={isExporting}
            className="data-export__btn data-export__btn--primary"
          >
            {isExporting ? "Eksporterer..." : "Last ned JSON"}
          </button>
        </div>

        <div className="data-export__option">
          <h4>CSV-format</h4>
          <p>Lesbart format for Excel eller Google Sheets</p>
          <button
            onClick={exportUserDataAsCSV}
            disabled={isExporting}
            className="data-export__btn data-export__btn--secondary"
          >
            {isExporting ? "Eksporterer..." : "Last ned CSV"}
          </button>
        </div>
      </div>

      {exportComplete && (
        <div className="data-export__success">
          <p>✅ Dataene dine er eksportert og lastet ned!</p>
        </div>
      )}

      <div className="data-export__info">
        <h4>Hva inkluderes i eksporten?</h4>
        <ul>
          <li>Profilinformasjon (navn, kontaktdetaljer, helseopplysninger)</li>
          <li>Bookinghistorikk med alle detaljer</li>
          <li>Samtykkeinnstillinger for cookies og databehandling</li>
          <li>Tidspunkt for når dataene ble eksportert</li>
        </ul>

        <p className="data-export__note">
          <strong>Merk:</strong> Denne eksporten inneholder sensitive
          helseopplysninger. Oppbevar filen sikkert og slett den når du ikke
          lenger trenger den.
        </p>
      </div>
    </div>
  );
};

export default DataExport;
