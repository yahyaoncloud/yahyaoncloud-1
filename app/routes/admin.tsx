import { Outlet, useLocation, useNavigate } from "@remix-run/react";
import { useEffect } from "react";
import { json, LoaderFunction, redirect } from "@remix-run/node";
import { requireAdminUser } from "../utils/session.server";
import MainLayout from "../components/layouts/MainLayout";
import { ThemeProvider } from "../Contexts/ThemeContext";

export const loader: LoaderFunction = async ({ request }) => {
  const user = await requireAdminUser(request); 
  const url = new URL(request.url);

  if (url.pathname === "/admin") {
    return redirect("/admin/dashboard");
  }

  return json({ user, message: `Welcome, ${user.displayName || user.email}!` });
};

export default function AdminLayout() {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    // Client-side redirect fallback
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
