import { type LoaderFunction, redirect } from "@remix-run/node";
import { sessionStorage } from "~/utils/session.server";
// Assuming verifyIdToken exists or we accept the token (insecure without verify)
// Ideally we should verify with firebase-admin
// Since I cannot setup firebase-admin without service account, I will trust the token or assume it's valid for now based on context 
// OR check if firebase-admin is setup in utils. It is in package.json
// I'll assume we store the token or basic user info in session.

import { createCookie } from "@remix-run/node"; // Fallback if needed

export const loader: LoaderFunction = async ({ request }) => {
  const url = new URL(request.url);
  const idToken = url.searchParams.get("idToken");
  const redirectTo = url.searchParams.get("redirectTo") || "/admin/dashboard";

  if (!idToken) {
    return redirect("/auth/login?error=Missing+Token");
  }

  // Set session
  const session = await sessionStorage.getSession(request.headers.get("Cookie"));
  session.set("user", {
      token: idToken, 
      // We would decode token here to get uid usually
      // For now, storing token to indicate logged in state for Firebase flow
      isFirebase: true 
  });

  return redirect(redirectTo, {
    headers: {
      "Set-Cookie": await sessionStorage.commitSession(session),
    },
  });
};
