import { Outlet } from "@remix-run/react";
import UserLayout from "~/components/layouts/UserLayout";

export default function PublicLayout() {
  return (
    <UserLayout>
      <Outlet />
    </UserLayout>
  );
}
