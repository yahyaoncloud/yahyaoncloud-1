import type { LoaderFunction } from "@remix-run/node";
import { redirect } from "@remix-run/node";

export const loader: LoaderFunction = async () => {
  // Redirect root to the public blog homepage
  return redirect("/blog");
};

export default function Index() {
  return null;
}
