// routes/auth.callback.tsx
import { LoaderFunction, redirect } from "@remix-run/node";
import { commitSession, getSession } from "../utils/session.server";
import { adminAuth } from "../utils/firebase.server";

export const loader: LoaderFunction = async ({ request }) => {
    // FIXED: Pass the cookie header directly
    const session = await getSession(request.headers.get("Cookie"));
    const url = new URL(request.url);
    const idToken = url.searchParams.get("idToken");
    const redirectTo = url.searchParams.get("redirectTo") || "/admin/dashboard";

    console.log("Auth callback called");

    if (!idToken) {
        console.error("No ID token provided");
        session.flash("error", "No authentication token provided");
        return redirect("/admin/login", {
            headers: { "Set-Cookie": await commitSession(session) },
        });
}

    try {
        console.log("Attempting to verify ID token...");

        // Use the adminAuth from the separate file
        const decodedToken = await adminAuth.verifyIdToken(idToken);
        console.log("Token verified successfully");

        // Check if user is admin
        const adminEmails = ["johnwick4learning@gmail.com", "ykinwork1@gmail.com"];
        const userEmail = decodedToken.email;

        if (!userEmail) {
            console.error("No email found in token");
            session.flash("error", "No email associated with this account");
            return redirect("/admin/login", {
                headers: { "Set-Cookie": await commitSession(session) },
            });
        }

        const isAdmin = adminEmails.includes(userEmail);
        console.log("User email:", userEmail, "Is admin:", isAdmin);

        if (!isAdmin) {
            session.flash("error", "Access denied. Admin privileges required.");
            return redirect("/admin/login", {
                headers: { "Set-Cookie": await commitSession(session) },
            });
        }

        // Store user in session
        session.set("user", {
            uid: decodedToken.uid,
            email: userEmail,
            displayName: decodedToken.name || userEmail,
            photoURL: decodedToken.picture,
            isAdmin: true
        });

        console.log("Authentication successful, redirecting to dashboard");

        return redirect(redirectTo, {
            headers: { "Set-Cookie": await commitSession(session) },
        });

    } catch (error) {
        console.error("Auth callback error:", error);
        session.flash("error", "Authentication failed. Please try again.");
        return redirect("/admin/login", {
            headers: { "Set-Cookie": await commitSession(session) },
        });
    }
};