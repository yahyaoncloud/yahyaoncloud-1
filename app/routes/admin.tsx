import { Outlet } from "@remix-run/react";
import Header from "~/components/Header";
import Footer from "~/components/Footer";
import Homepage from "./admin.home";
import MainLayout from "../components/layouts/MainLayout";
import { ThemeProvider } from "~/Contexts/ThemeContext";

export default function AdminLayout() {
  return (
    <>
      <ThemeProvider>
        <main>
          <MainLayout>
            <Outlet />
          </MainLayout>
        </main>
      </ThemeProvider>
    </>
  );
}
