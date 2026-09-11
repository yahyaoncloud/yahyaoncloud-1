import { redirect, type LoaderFunctionArgs } from "@remix-run/node";
import { requireAdmin } from "~/utils/admin-auth.server";

export async function loader({ request }: LoaderFunctionArgs) {
  await requireAdmin(request);
  return redirect("/admin/settings?tab=seo");
}

export default function BlogSettingsRedirect() {
  return null;
}
