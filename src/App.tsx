import { BrowserRouter } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import AppRoutes from "./router";
import { AuthProvider } from "./context/AuthContext";
import Layout from "@/layout";
import ConsentBanner from "./components/ConsentBanner/ConsentBanner";
import "./App.css";

function App() {
  return (
    <HelmetProvider>
      <AuthProvider>
        <BrowserRouter>
          <Layout>
            <AppRoutes />
          </Layout>
          <ConsentBanner />
        </BrowserRouter>
      </AuthProvider>
    </HelmetProvider>
  );
}

export default App;
