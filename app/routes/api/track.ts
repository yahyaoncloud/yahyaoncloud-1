import { json, type ActionFunctionArgs } from "@remix-run/node";
import { PrismaClient } from "@prisma/client";
import crypto from "crypto";

const prisma = new PrismaClient();

export async function loader() {
  return json({ message: "Tracking API" }, { status: 200 });
}

function getClientIP(request: Request): string | null {
  const headers = request.headers;
  const xForwardedFor = headers.get("x-forwarded-for");
  if (xForwardedFor) {
    return xForwardedFor.split(",")[0].trim();
  }
  return headers.get("x-real-ip") || null;
}

function hashIP(ip: string): string {
  return crypto.createHash("sha256").update(ip).digest("hex");
}

function getCountry(request: Request): string | null {
  const headers = request.headers;
  // Check common CDN headers
  return (
    headers.get("x-vercel-ip-country") || 
    headers.get("cf-ipcountry") || 
    headers.get("x-country") || 
    null
  );
}

export async function action({ request }: ActionFunctionArgs) {
  if (request.method !== "POST") {
    return json({ message: "Method not allowed" }, { status: 405 });
  }

  try {
    const data = await request.json();
    const { path, referrer, userAgent: clientUserAgent, device, browser, os } = data;

    // Server-side extraction
    const ip = getClientIP(request);
    const ipHash = ip ? hashIP(ip) : null;
    const country = getCountry(request);
    const userAgent = clientUserAgent || request.headers.get("user-agent") || null;

    // Only create record if we have minimal info
    await prisma.analytics.create({
      data: {
        path,
        referrer: referrer || null,
        userAgent,
        ipHash,     // Prioritize server-derived hash
        country,    // Prioritize server-derived country
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
