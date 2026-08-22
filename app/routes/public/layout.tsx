import { Outlet } from "@remix-run/react";
import { ThemeProvider } from "~/Contexts/ThemeContext";
import UserLayout from "~/components/layouts/UserLayout";

export default function PublicLayout() {
  return (
    <ThemeProvider>
      <UserLayout>
        <Outlet />
      </UserLayout>
    </ThemeProvider>
  );
}
