import { Outlet, useLocation, useNavigate } from "@remix-run/react";
import { useEffect } from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import MainLayout from "../components/layouts/MainLayout";
import { ThemeProvider } from "../Contexts/ThemeContext";
import { LoaderFunction, redirect } from "@remix-run/node";
import { getCurrentUser } from "../Services/auth.server";

export const loader: LoaderFunction = async ({ request }) => {
  const user = await getCurrentUser(request);
  if (!user || !["johnwick4learning@gmail.com", "ykinwork1@gmail.com"].includes(user.email) || user.role !== "admin") {
    return redirect("/admin/login");
  }
  return { user };
};
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
