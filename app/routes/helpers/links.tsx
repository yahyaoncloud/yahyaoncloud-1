// Permanent /links route - Redirects to the active linktree profile
// This URL is constant and used for QR codes
import { redirect, type LoaderFunctionArgs } from "@remix-run/node";
import { getLinktree } from "~/Services/linktree.prisma.server";

export async function loader({ request }: LoaderFunctionArgs) {
  const linktree = await getLinktree();
  
  if (!linktree || !linktree.isActive) {
    // If no active linktree, redirect to home
    return redirect("/");
  }
  
  return redirect(`/me/${linktree.shortCode}`);
}
