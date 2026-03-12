import NavigationBar from "@/components/NavigationBar/NavigationBar";
import Footer from "@/components/Footer/Footer";

// Layout component that wraps the main content with navigation and footer
const Layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <>
      <NavigationBar />
      <main>{children}</main>
      <Footer />
    </>
  );
};

export default Layout;
