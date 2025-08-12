import { Outlet } from "@remix-run/react";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import Homepage from "./admin.home";
import MainLayout from "../../components/layouts/MainLayout";
import { ThemeProvider } from "../../Contexts/ThemeContext";
import Admin from "./admin";

export default function AdminLayout() {
    return (
        <>
            <ThemeProvider>
                <main>
                    <MainLayout>
                        <Admin />
                    </MainLayout>
                </main>
            </ThemeProvider>
        </>
    );
}
