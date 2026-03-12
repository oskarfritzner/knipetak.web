import { BrowserRouter } from "react-router-dom";
import AppRoutes from "./router";
import { AuthProvider } from "./context/AuthContext";
import Layout from "@/layout";
import ConsentBanner from "./components/ConsentBanner/ConsentBanner";
import "./App.css";

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Layout>
          <AppRoutes />
        </Layout>
        <ConsentBanner />
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
