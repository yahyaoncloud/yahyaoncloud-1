import { json, type ActionFunctionArgs } from "@remix-run/node";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function action({ request }: ActionFunctionArgs) {
  if (request.method !== "POST") {
    return json({ message: "Method not allowed" }, { status: 405 });
  }

  try {
    const data = await request.json();
    const { path, referrer, userAgent, ipHash, country, device, browser, os } = data;

    await prisma.analytics.create({
      data: {
        path,
        referrer: referrer || null,
        userAgent: userAgent || request.headers.get("user-agent") || null,
        ipHash: ipHash || null, // Client might send a hashed IP or we hash server side if we had IP. 
        // Note: Getting IP in Remix varies by adapter. For now we accept what client sends or just log generic.
        country: country || null,
        device: device || null,
        browser: browser || null,
        os: os || null,
      },
    });

    return json({ success: true });
  } catch (error) {
    console.error("Tracking error:", error);
    // Fail silently to client
    return json({ success: false }, { status: 500 });
  }
}
