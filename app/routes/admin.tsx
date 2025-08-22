import { Outlet, useLocation, useNavigate } from "@remix-run/react";
import { useEffect } from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import MainLayout from "../components/layouts/MainLayout";
import { ThemeProvider } from "../Contexts/ThemeContext";

export default function AdminLayout() {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    if (location.pathname === "/admin") {
      navigate("/admin/dashboard", { replace: true });
    }
  }, [location.pathname, navigate]);

  return (
    <ThemeProvider>
      <main>
        <MainLayout>
          <Outlet />
        </MainLayout>
      </main>
    </ThemeProvider>
  );
}
