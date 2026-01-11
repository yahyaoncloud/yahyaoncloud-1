import { json, type LoaderFunctionArgs } from '@remix-run/node';
import { useLoaderData } from '@remix-run/react';
import type { Linktree } from '@prisma/client';
import { getLinktree, getLinktreeUrl } from '~/Services/linktree.prisma.server';
import { BusinessCard } from '~/components/BusinessCard';
import { Button } from '~/components/ui/button';
import { Printer } from 'lucide-react';

import fs from 'fs/promises';
import path from 'path';
import QRCode from 'qrcode';

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const linktree = await getLinktree();
  const linktreeUrl = getLinktreeUrl(linktree.shortCode || "");

  // Read the SVG template
  const svgPath = path.resolve(process.cwd(), 'app/assets/business-card.svg');
  let svgContent = await fs.readFile(svgPath, 'utf-8');

  // 1. Remove Static Text Paths (identified by starting d attribute points)
  // Name (Purple)
  svgContent = svgContent.replace(/<path\s+d="M467\.581[^>]+>/g, ''); 
  // Title/Tagline (Gray)
  svgContent = svgContent.replace(/<path\s+d="M776\.478[^>]+>/g, '');
  // Linktree/social text (Gray)
  svgContent = svgContent.replace(/<path\s+d="M375\.029[^>]+>/g, '');
  // "SCAN ME" text (Black) - Path starts with M120.806
  svgContent = svgContent.replace(/<path\s+d="M120\.806[^>]+>/g, '');
  // Extra decoration or text (Gray, e.g. "Linktree" label)
  svgContent = svgContent.replace(/<path\s+d="M823\.596[^>]+>/g, '');
  // Additional Text Paths (Likely other social labels/values)
  svgContent = svgContent.replace(/<path\s+d="M729\.029[^>]+>/g, '');
  svgContent = svgContent.replace(/<path\s+d="M885\.834[^>]+>/g, '');
  
  // 1.5 Remove Placeholder Shapes (Avatar and QR Code Backgrounds)
  // Avatar Rect (x=403, y=64) - Use flexible regex for attributes
  svgContent = svgContent.replace(/<rect\s+[^>]*x="403"[^>]*y="64"[^>]*>/g, '');
  // QR Code Rect (x=73.5, y=830.5)
  svgContent = svgContent.replace(/<rect\s+[^>]*x="73\.5"[^>]*y="830\.5"[^>]*>/g, '');
  // Social Icons Rects (x=751)
  svgContent = svgContent.replace(/<rect\s+[^>]*x="751"[^>]*>/g, '');

  // 2. Namespace IDs to prevent conflicts (Fixes "disoriented" if clip-paths break)
  const uniqueId = `bc_${Date.now()}_`;
  svgContent = svgContent.replace(/id="([^"]+)"/g, `id="${uniqueId}$1"`);
  svgContent = svgContent.replace(/url\(#([^)]+)\)/g, `url(#${uniqueId}$1)`);
  svgContent = svgContent.replace(/xlink:href="#([^"]+)"/g, `xlink:href="#${uniqueId}$1"`);

  // 3. Ensure Responsive Sizing
  // Remove fixed width/height, replace with 100% to fill the container defined in React
  svgContent = svgContent.replace(/width="\d+"/, 'width="100%"');
  svgContent = svgContent.replace(/height="\d+"/, 'height="100%"');

  // Generate QR Code if missing or just generate fresh for preview
  // Note: We use the existing qrCodeUrl if available, or generate on fly data URI for preview
  let qrCodeDataUri = linktree.qrCodeUrl;
  
  if (!qrCodeDataUri) {
      try {
        qrCodeDataUri = await QRCode.toDataURL(linktreeUrl, {
            margin: 1,
            color: {
                dark: '#FFFFFF',
                light: '#000000'
            }
        });
      } catch (err) {
          console.error("QR Gen Error", err);
      }
  }

  return json({ linktree, linktreeUrl, svgContent, qrCodeDataUri });
};

export default function AdminBusinessCard() {
  const { linktree, linktreeUrl, svgContent, qrCodeDataUri } = useLoaderData<typeof loader>();

  return (
    <>
      {/* Print-specific styles to hide all UI elements */}
      <style>{`
        @media print {
          /* Hide all dashboard UI */
          nav, aside, header, .print\\:hidden {
            display: none !important;
          }
          
          /* Ensure only business card shows */
          body {
            margin: 0;
            padding: 0;
          }
          
          /* Remove all page padding/margins */
          body > div {
            padding: 0 !important;
            margin: 0 !important;
          }
        }
      `}</style>
      
    <div className="p-8 space-y-8 print:p-0 print:space-y-0 print:m-0">
      <div className="flex justify-between items-center print:hidden">
        <div>
          <h1 className="text-3xl font-bold">Business Card Generator</h1>
          <p className="text-gray-500">Preview and download your business card as PDF</p>
        </div>
        <Button 
          onClick={async () => {
            try {
              console.log('Fetching PDF...');
              const response = await fetch('/api/generate-business-card-pdf', { method: 'POST' });
              console.log('Response status:', response.status);
              
              if (!response.ok) {
                const text = await response.text();
                console.error('PDF generation failed:', text);
                alert('Failed to generate PDF: ' + text);
                return;
              }
              
              const blob = await response.blob();
              console.log('Blob size:', blob.size);
              const url = window.URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = 'business-card.pdf';
              document.body.appendChild(a);
              a.click();
              document.body.removeChild(a);
              window.URL.revokeObjectURL(url);
              console.log('Download triggered');
            } catch (error) {
              console.error('Error downloading PDF:', error);
              alert('Error: ' + error);
            }
          }} 
          className="gap-2"
        >
          <Printer size={16} />
          Download PDF
        </Button>
      </div>

      <div className="border rounded-lg p-8 bg-gray-50 flex justify-center items-center overflow-auto container-query-wrapper print:border-0 print:bg-transparent print:p-0 print:overflow-visible print:block print:w-full print:h-auto">
        <BusinessCard 
          profile={linktree} 
          qrCodeUrl={qrCodeDataUri || ""} 
          linktreeUrl={linktreeUrl}
          svgContent={svgContent}
        />
      </div>
      
      <div className="max-w-2xl print:hidden">
        <h2 className="text-2xl font-semibold mb-4">Professional Print Instructions</h2>
        <div className="space-y-4 text-gray-700 dark:text-gray-500">
          <div>
            <h3 className="font-semibold text-lg mb-2">For PDF Generation:</h3>
            <ul className="list-disc pl-5 space-y-1">
              <li>Click "Print / Download PDF" button above</li>
              <li>Select "Save as PDF" as the destination</li>
              <li>Enable "Background graphics" in print settings</li>
              <li>Set margins to "None" or "Minimum"</li>
              <li>Ensure scale is set to 100%</li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-semibold text-lg mb-2">Card Specifications:</h3>
            <ul className="list-disc pl-5 space-y-1">
              <li><strong>Finished Size:</strong> 3.5" × 2" (standard business card)</li>
              <li><strong>With Bleed:</strong> 3.75" × 2.25" (includes 0.125" bleed)</li>
              <li><strong>Crop Marks:</strong> Included for professional printing</li>
              <li><strong>Color Mode:</strong> RGB (convert to CMYK if needed by printer)</li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-semibold text-lg mb-2">For Professional Printing:</h3>
            <ul className="list-disc pl-5 space-y-1">
              <li>The PDF includes crop marks and bleed zone</li>
              <li>Trim along the crop marks for exact 3.5" × 2" size</li>
              <li>QR code is optimized for scannability</li>
              <li>Fonts are embedded for consistent rendering</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
    </>
  );
}
