import React from "react";
import AdminGoogleCalendar from "../../components/AdminGoogleCalendar/AdminGoogleCalendar";
import "./AdminCalendarPage.css";

const AdminCalendarPage: React.FC = () => {
  return (
    <>
      <div className="calendar-container">
        <div className="calendar-section">
          <AdminGoogleCalendar />
        </div>
      </div>
    </>
  );
};

export default AdminCalendarPage;
