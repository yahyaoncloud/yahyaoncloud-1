import type { LoaderFunction } from "@remix-run/node";
import { redirect } from "@remix-run/node";
import { Outlet } from "@remix-run/react";
import { ThemeProvider } from "../Contexts/ThemeContext";

export const loader: LoaderFunction = async () => {
  return redirect("/admin/home");
};

export default function Index() {
  return <Outlet />;
}
