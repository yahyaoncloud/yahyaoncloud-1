import { redirect, type LoaderFunctionArgs } from "@remix-run/node";
import { requireAdmin } from "~/utils/admin-auth.server";
export async function loader({ request }: LoaderFunctionArgs) {
  await requireAdmin(request);
  return redirect("/admin/featured-articles");
}

export default function HomepageCardsRedirect() {
  return null;
}
