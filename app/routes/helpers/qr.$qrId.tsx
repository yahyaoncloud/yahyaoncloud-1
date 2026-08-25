// QR Code Tracking Redirect Route
// When scanned, tracks user metadata and redirects to /links
// Invalid/old QRs show a message for 3 seconds then redirect to /about

import { json, redirect, type LoaderFunctionArgs } from "@remix-run/node";
import { useLoaderData, useNavigate } from "@remix-run/react";
import { useEffect } from "react";
import { QrCode, AlertTriangle } from "lucide-react";
import {
  getQRByQrId,
  recordScan,
  hashIP,
  parseUserAgent,
} from "~/Services/linktree-qr.prisma.server";

export async function loader({ request, params }: LoaderFunctionArgs) {
  const { qrId } = params;

  if (!qrId) {
    // No QR ID provided, show invalid page
    return json({ valid: false, message: "Invalid QR code" });
  }

  // Find the QR record
  const qr = await getQRByQrId(qrId);

  if (!qr || !qr.isActive) {
    // QR doesn't exist or is inactive (old/regenerated)
    return json({ valid: false, message: "This QR code is no longer valid" });
  }

  // Extract metadata from request
  const userAgent = request.headers.get("user-agent") || "";
  const referrer = request.headers.get("referer") || undefined;
  
  // Get IP and hash it for privacy
  const forwarded = request.headers.get("x-forwarded-for");
  const ip = forwarded ? forwarded.split(",")[0].trim() : "unknown";
  const ipHash = hashIP(ip);
  
  // Parse user agent for device/browser/OS
  const { device, browser, os } = parseUserAgent(userAgent);

  // Record the scan
  await recordScan(qr.id, {
    ipHash,
    userAgent,
    device,
    browser,
    os,
    referrer,
  });

  // Redirect to linktree
  return redirect("/links");
}

// This component only renders for invalid QRs
export default function QRRedirect() {
  const { message } = useLoaderData<typeof loader>();
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect to /about after 3 seconds
    const timer = setTimeout(() => {
      navigate("/about");
    }, 3000);

    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center p-6">
      <div className="max-w-md w-full text-center space-y-6">
        {/* Icon */}
        <div className="relative inline-flex">
          <div className="w-24 h-24 rounded-full bg-red-500/10 flex items-center justify-center">
            <QrCode size={48} className="text-red-400" />
          </div>
          <div className="absolute -bottom-1 -right-1 w-10 h-10 rounded-full bg-zinc-950 flex items-center justify-center">
            <AlertTriangle size={24} className="text-amber-500" />
          </div>
        </div>

        {/* Message */}
        <div className="space-y-2">
          <h1 className="text-2xl font-semibold text-white">Invalid QR Code</h1>
          <p className="text-zinc-400">{message}</p>
        </div>

        {/* Redirect notice */}
        <div className="pt-4">
          <p className="text-sm text-zinc-500">
            Redirecting to homepage in a moment...
          </p>
          <div className="mt-4 flex justify-center gap-1">
            <div className="w-2 h-2 rounded-full bg-zinc-700 animate-pulse" style={{ animationDelay: "0ms" }} />
            <div className="w-2 h-2 rounded-full bg-zinc-700 animate-pulse" style={{ animationDelay: "300ms" }} />
            <div className="w-2 h-2 rounded-full bg-zinc-700 animate-pulse" style={{ animationDelay: "600ms" }} />
          </div>
        </div>

        {/* Manual link */}
        <a
          href="/about"
          className="inline-block mt-6 text-sm text-indigo-400 hover:text-indigo-300 underline underline-offset-4"
        >
          Go to homepage now
        </a>
      </div>
    </div>
  );
}
