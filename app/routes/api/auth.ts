import { json, redirect } from "@remix-run/node";
import { adminAuth } from "~/utils/firebase.server";
import { generateAdminToken, createAdminSession } from "~/utils/admin-auth.server";
import { getSession, commitSession } from "~/utils/session.server";
import { prisma } from "~/utils/prisma.server";

function isAuthorizedAdminEmail(email?: string | null): boolean {
  if (!email) return false;
  const envEmails = process.env.ADMIN_VER_EMAILS_FOR_AUTH;
  if (!envEmails) return false;
  try {
    const list = JSON.parse(envEmails);
    if (Array.isArray(list)) {
      return list.map((e) => String(e).toLowerCase().trim()).includes(email.toLowerCase().trim());
    }
  } catch {
    const list = envEmails.split(",").map((e) => e.trim().replace(/^["']|["']$/g, "").toLowerCase());
    return list.includes(email.toLowerCase().trim());
  }
  return false;
}

export const action = async ({ request }: { request: Request }) => {
  let idToken = "";
  let scope = "admin";
  let fallbackDisplayName = "";
  let fallbackPhotoURL = "";

  const contentType = request.headers.get("Content-Type") || "";

  if (contentType.includes("application/json")) {
    try {
      const body = await request.json();
      idToken = body.idToken || body.token || "";
      scope = body.scope || (body.loginType === "google" ? "admin" : "guest");
      fallbackDisplayName = body.displayName || "";
      fallbackPhotoURL = body.photoURL || "";
    } catch {
      return json({ error: "Invalid JSON payload" }, { status: 400 });
    }
  } else {
    const formData = await request.formData();
    idToken = (formData.get("idToken") as string) || (formData.get("token") as string) || "";
    scope = (formData.get("scope") as string) || ((formData.get("loginType") as string) === "google" ? "admin" : "guest");
  }

  if (!idToken) {
    return json({ error: "No token provided" }, { status: 400 });
  }

  try {
    // Verify the Firebase ID token
    const decodedToken = await adminAuth.verifyIdToken(idToken);
    const uid = decodedToken.uid;
    const email = decodedToken.email || null;
    const name = decodedToken.name || fallbackDisplayName || email?.split("@")[0] || "User";
    const picture = decodedToken.picture || fallbackPhotoURL || "";

    // 1. Guestbook / Visitor Social Auth Flow
    if (scope === "guest") {
      const session = await getSession(request);
      session.set("user", {
        uid,
        displayName: name,
        photoURL: picture,
        email,
        provider: decodedToken.firebase?.sign_in_provider || "sso",
      });

      return json(
        { success: true, user: { uid, displayName: name, photoURL: picture } },
        {
          headers: {
            "Set-Cookie": await commitSession(session),
          },
        }
      );
    }

    // 2. Admin Authentication Flow
    const isEmailAllowed = isAuthorizedAdminEmail(email);
    const dbAdmin = email
      ? await prisma.admin.findFirst({ where: { email: { equals: email, mode: "insensitive" } } })
      : null;

    if (!isEmailAllowed && !dbAdmin) {
      return json(
        { error: "Access denied. Your email address is not authorized for administrator access." },
        { status: 403 }
      );
    }

    // Generate Admin Token (JWT)
    const token = generateAdminToken({
      id: dbAdmin?.id || uid,
      username: dbAdmin?.username || name,
      email: email,
      role: "admin",
    });

    const cookie = createAdminSession(token);

    if (contentType.includes("application/json")) {
      return json(
        { success: true, redirect: "/admin/dashboard" },
        {
          headers: {
            "Set-Cookie": cookie,
          },
        }
      );
    }

    return redirect("/admin/dashboard", {
      headers: {
        "Set-Cookie": cookie,
      },
    });
  } catch (error) {
    console.error("Error verifying Firebase token in /api/auth:", error);
    return json({ error: "Invalid or expired token" }, { status: 401 });
  }
};


