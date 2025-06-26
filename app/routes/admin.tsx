import { Outlet } from "@remix-run/react";
import Header from "~/components/Header";
import Footer from "~/components/Footer";
import Homepage from "./admin.home";
import MainLayout from "../components/layouts/MainLayout";

export default function AdminLayout() {
  return (
    <>
      <main>
        <MainLayout>
          <Outlet />
        </MainLayout>
      </main>
    </>
  );
}
