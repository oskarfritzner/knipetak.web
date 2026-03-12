import { Routes, Route } from "react-router-dom";
import HomePage from "../pages/HomePage/HomePage.tsx";
import TreatmentsPage from "../pages/TreatmentsPage/TreatmentsPage.tsx";
import ContactPage from "../pages/ContactPage/ContactPage.tsx";
import LoginPage from "../pages/LoginPage/LoginPage.tsx";
import ProfilePage from "../pages/ProfilePage/ProfilePage.tsx";
import AdminHomePage from "../pages/AdminHomePage/AdminHomePage.tsx";
import AdminCalendarPage from "../pages/AdminCalendarPage/AdminCalendarPage.tsx";
import TermsPage from "../pages/TermsPage/TermsPage.tsx";
import PrivacyPage from "../pages/PrivacyPage/PrivacyPage.tsx";

const AppRoutes = () => (
  <Routes>
    <Route path="/" element={<HomePage />} />
    <Route path="/behandlinger" element={<TreatmentsPage />} />
    {/* <Route path="/book" element={<BookPage />} /> */}
    <Route path="/kontakt" element={<ContactPage />} />
    <Route path="/login" element={<LoginPage />} />
    <Route path="/profile" element={<ProfilePage />} />
    <Route path="/admin-home-page" element={<AdminHomePage />} />
    <Route path="/admin-calendar-page" element={<AdminCalendarPage />} />
    <Route path="/terms" element={<TermsPage />} />
    <Route path="/personvern" element={<PrivacyPage />} />
  </Routes>
);

export default AppRoutes;
