import { json, redirect } from "@remix-run/node";
import { adminAuth } from "~/utils/firebase.server";
import { generateAdminToken, createAdminSession } from "~/utils/admin-auth.server";

export const action = async ({ request }: { request: Request }) => {
  const formData = await request.formData();
  const idToken = formData.get("idToken") as string;

  if (!idToken) {
    return json({ error: "No token provided" }, { status: 400 });
  }

  try {
    // Verify the ID token
    const decodedToken = await adminAuth.verifyIdToken(idToken);
    const uid = decodedToken.uid;
    const email = decodedToken.email;
    const name = decodedToken.name || email?.split('@')[0] || 'admin';

    // Generate Admin Token (JWT)
    const token = generateAdminToken({
      id: uid,
      username: name,
      email: email,
      role: 'admin'
    });

    // Create Session Cookie
    const cookie = createAdminSession(token);

    return redirect("/admin/dashboard", {
      headers: {
        "Set-Cookie": cookie,
      },
    });
  } catch (error) {
    console.error("Error verifying Firebase token:", error);
    return json({ error: "Invalid token" }, { status: 401 });
  }
};

