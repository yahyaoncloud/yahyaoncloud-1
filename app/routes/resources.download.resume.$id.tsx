
import { LoaderFunctionArgs } from "@remix-run/node";
import { getResumeById } from "~/Services/resume.server";

export async function loader({ params, request }: LoaderFunctionArgs) {
  const { id } = params;
  if (!id) throw new Response("Not Found", { status: 404 });

  try {
    console.log(`[Proxy] Fetching resume ${id}...`);
    const resume = await getResumeById(id);
    
    if (!resume) {
        console.error(`[Proxy] Resume ${id} not found in DB`);
        throw new Response("Resume Not Found", { status: 404 });
    }
    
    // Determine Content-Disposition based on query param
    const url = new URL(request.url);
    const isDownload = url.searchParams.get("download") === "true";
    const disposition = isDownload ? "attachment" : "inline";

    // 1. Try DB Storage (Primary & Reliable)
    if (resume.pdfData) { 
         console.log(`[Proxy] Serving from Database Storage (${resume.pdfData.length} bytes). Mode: ${disposition}`);
         return new Response(resume.pdfData as unknown as BodyInit, {
            headers: {
                "Content-Type": resume.contentType || "application/pdf",
                "Content-Disposition": `${disposition}; filename="${resume.fileName || 'Resume.pdf'}"`,
                "Cache-Control": "private, no-cache, no-store, must-revalidate",
            }
         });
    }

    // 2. Fallback to Cloudinary (Legacy)
    if (!resume.pdfUrl) {
         console.error(`[Proxy] Resume ${id} has no pdfData AND no pdfUrl`);
         throw new Response("Resume content missing", { status: 404 });
    }

    console.log(`[Proxy] Database empty. Fallback fetching from: ${resume.pdfUrl}`); 
    // DEBUG: Check if URL contains 'raw' or 'image'
    if (resume.pdfUrl.includes("/raw/")) {
        console.warn("[Proxy] WARNING: Fetching a RAW url. This is likely why it fails (401).");
    } else if (resume.pdfUrl.includes("/image/")) {
        console.log("[Proxy] Fetching an IMAGE url. This should be public.");
    }

    const response = await fetch(resume.pdfUrl, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
      }
    });

    if (!response.ok) {
        console.error(`[Proxy] Cloudinary fetch failed: ${response.status} ${response.statusText}`);
        console.error("[Proxy] Response Headers:", Object.fromEntries(response.headers.entries()));
        // Return 502 but include the upstream error for debugging
        throw new Response(`Cloudinary Blocked Request: ${response.status} ${response.statusText}`, { status: 502 });
    }

    const contentType = response.headers.get("content-type") || "application/pdf";
    const body = await response.arrayBuffer();
    
    console.log(`[Proxy] Successfully fetched ${body.byteLength} bytes. Streaming to client.`);

    return new Response(body, {
      headers: {
        "Content-Type": contentType,
        "Content-Disposition": `${disposition}; filename="${resume.fileName || 'Resume.pdf'}"`, // Use calculated disposition
        "Cache-Control": "private, no-cache, no-store, must-revalidate",
      },
    });
  } catch (error) {
    console.error("[Proxy] Critical Error:", error);
    if (error instanceof Response) throw error;
    throw new Response("Internal Server Error", { status: 500 });
  }
}
