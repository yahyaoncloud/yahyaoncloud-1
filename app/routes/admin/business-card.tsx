import { json, type LoaderFunctionArgs } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { requireAdmin } from "~/utils/admin-auth.server";
import { getLinktree } from "~/Services/linktree.prisma.server";
import { getActiveQR } from "~/Services/linktree-qr.prisma.server";
import { FlipBusinessCard } from "~/components/FlipBusinessCard";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "~/components/ui/card";
import { LuDownload as Download, LuQrCode as QrCode, LuFileText as FileText, LuShare2 as Share2, LuPrinter as Printer, LuExternalLink as ExternalLink } from "react-icons/lu";
import QRCode from "qrcode";
import { useState } from "react";
import { toast } from "sonner";

export async function loader({ request }: LoaderFunctionArgs) {
  await requireAdmin(request);

  const linktree = await getLinktree();
  if (!linktree) {
    throw new Response("Linktree profile not found. Please initialize your Linktree first.", { status: 404 });
  }

  const url = new URL(request.url);
  const activeQR = await getActiveQR(linktree.id);
  const linktreeUrl = `${url.origin}/links`;

  let qrCodeDataUri = activeQR?.qrCodeUrl || "";
  if (!qrCodeDataUri) {
    qrCodeDataUri = await QRCode.toDataURL(linktreeUrl, {
      margin: 1,
      width: 400,
      color: { dark: "#000000", light: "#FFFFFF" },
    });
  }

  return json({
    profile: {
      ...linktree,
      createdAt: linktree.createdAt.toISOString(),
      updatedAt: linktree.updatedAt.toISOString(),
    },
    qrCodeUrl: qrCodeDataUri,
    linktreeUrl,
    resumeUrl: `${url.origin}/resume`,
    origin: url.origin,
  });
}

export default function AdminBusinessCard() {
  const { profile, qrCodeUrl, linktreeUrl, resumeUrl } = useLoaderData<typeof loader>();
  const [destination, setDestination] = useState<"linktree" | "resume">("linktree");
  const [isGenerating, setIsGenerating] = useState(false);

  const activeUrl = destination === "linktree" ? linktreeUrl : resumeUrl;

  const handleDownloadPdf = async () => {
    setIsGenerating(true);
    toast.info("Generating high-resolution 3.5\" x 2\" print PDF...");
    try {
      const response = await fetch("/api/generate-business-card-pdf", {
        method: "POST",
      });

      if (!response.ok) {
        throw new Error(`PDF generation failed: ${response.statusText}`);
      }

      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = downloadUrl;
      a.download = `Yahya-BusinessCard-Print.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(downloadUrl);
      toast.success("Business card PDF downloaded successfully!");
    } catch (err) {
      console.error(err);
      toast.error(err instanceof Error ? err.message : "Failed to generate business card PDF");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2.5">
            <QrCode className="text-indigo-600 dark:text-indigo-400" size={28} />
            Digital Business Card & QR Studio
          </h1>
          <p className="text-xs sm:text-sm text-zinc-500 mt-1">
            Print-ready 3.5" x 2" interactive networking card with high-resolution vector QR exports.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            onClick={handleDownloadPdf}
            disabled={isGenerating}
            className="bg-indigo-600 hover:bg-indigo-700 text-white flex items-center gap-2 shadow-sm"
          >
            <Printer size={16} />
            {isGenerating ? "Generating..." : "Export Print PDF"}
          </Button>
        </div>
      </div>

      {/* Interactive Card Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Interactive 3D Card */}
        <div className="lg:col-span-7 flex flex-col items-center justify-center p-8 bg-zinc-100/70 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 rounded-2xl">
          <div className="w-full flex justify-center overflow-x-auto py-2">
            <FlipBusinessCard
              profile={profile as any}
              qrCodeUrl={qrCodeUrl}
              linktreeUrl={activeUrl}
            />
          </div>
          <p className="text-xs text-zinc-400 dark:text-zinc-500 mt-6 font-mono flex items-center gap-1.5">
            <span>💡 Click or tap card to flip between Front and Back (3D perspective)</span>
          </p>
        </div>

        {/* Right Column: Controls & QR Options */}
        <div className="lg:col-span-5 space-y-6">
          <Card className="border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold">QR Code Destination</CardTitle>
              <CardDescription className="text-xs">
                Configure where scanners land when reading your card QR code.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setDestination("linktree")}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    destination === "linktree"
                      ? "border-indigo-600 bg-indigo-50/50 dark:bg-indigo-950/30 text-indigo-950 dark:text-indigo-200 font-medium"
                      : "border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 text-zinc-600 dark:text-zinc-400"
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <Share2 size={16} className="text-indigo-600 dark:text-indigo-400" />
                    <span className="text-xs font-semibold">Linktree</span>
                  </div>
                  <p className="text-[11px] text-zinc-500 line-clamp-1">/links routing hub</p>
                </button>

                <button
                  type="button"
                  onClick={() => setDestination("resume")}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    destination === "resume"
                      ? "border-indigo-600 bg-indigo-50/50 dark:bg-indigo-950/30 text-indigo-950 dark:text-indigo-200 font-medium"
                      : "border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 text-zinc-600 dark:text-zinc-400"
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <FileText size={16} className="text-indigo-600 dark:text-indigo-400" />
                    <span className="text-xs font-semibold">Direct CV</span>
                  </div>
                  <p className="text-[11px] text-zinc-500 line-clamp-1">/resume inline PDF</p>
                </button>
              </div>

              <div className="p-3 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg space-y-1">
                <span className="text-[11px] font-mono text-zinc-400 uppercase">Target Destination URL</span>
                <p className="text-xs font-mono text-zinc-800 dark:text-zinc-200 truncate">
                  {activeUrl}
                </p>
              </div>

              <div className="flex items-center gap-3 pt-2">
                <a
                  href={qrCodeUrl}
                  download="business-card-qr.png"
                  className="flex-1 inline-flex items-center justify-center gap-2 px-3 py-2 text-xs font-medium rounded-lg border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 transition-colors"
                >
                  <Download size={14} /> Download QR PNG
                </a>

                <a
                  href={activeUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center justify-center p-2 rounded-lg border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
                  title="Test Target URL"
                >
                  <ExternalLink size={14} />
                </a>
              </div>
            </CardContent>
          </Card>

          <Card className="border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold">Print Specifications</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-xs text-zinc-600 dark:text-zinc-400">
              <div className="flex justify-between py-1 border-b border-zinc-100 dark:border-zinc-800">
                <span>Standard Dimensions</span>
                <span className="font-mono font-medium text-zinc-900 dark:text-zinc-100">3.5" × 2.0" (US Standard)</span>
              </div>
              <div className="flex justify-between py-1 border-b border-zinc-100 dark:border-zinc-800">
                <span>Resolution</span>
                <span className="font-mono font-medium text-zinc-900 dark:text-zinc-100">300 DPI Vector PDF</span>
              </div>
              <div className="flex justify-between py-1 border-b border-zinc-100 dark:border-zinc-800">
                <span>Color Mode</span>
                <span className="font-mono font-medium text-zinc-900 dark:text-zinc-100">Deep Indigo / Electric Zinc</span>
              </div>
              <div className="flex justify-between py-1">
                <span>QR Version</span>
                <span className="font-mono font-medium text-zinc-900 dark:text-zinc-100">High ECC (Level H)</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
