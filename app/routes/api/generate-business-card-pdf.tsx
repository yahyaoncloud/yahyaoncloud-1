import { type ActionFunctionArgs } from '@remix-run/node';
import puppeteer from 'puppeteer';
import { getLinktree, getLinktreeUrl } from '~/Services/linktree.prisma.server';
import fs from 'fs/promises';
import path from 'path';
import QRCode from 'qrcode';

export const action = async ({ request }: ActionFunctionArgs) => {
  try {
    // Get linktree data
    const linktree = await getLinktree();
    const linktreeUrl = getLinktreeUrl(linktree.shortCode || "");

    // Read SVG template
    const svgPath = path.resolve(process.cwd(), 'app/assets/business-card.svg');
    let svgContent = await fs.readFile(svgPath, 'utf-8');

    // Process SVG (same as in the page loader) - Clean up static paths
    svgContent = svgContent.replace(/\<path\s+d=\"M467\\.581[^\>]+\>/g, '');
    svgContent = svgContent.replace(/\<path\s+d=\"M776\\.478[^\>]+\>/g, '');
    svgContent = svgContent.replace(/\<path\s+d=\"M375\\.029[^\>]+\>/g, '');
    svgContent = svgContent.replace(/\<path\s+d=\"M120\\.806[^\>]+\>/g, '');
    svgContent = svgContent.replace(/\<path\s+d=\"M823\\.596[^\>]+\>/g, '');
    svgContent = svgContent.replace(/\<path\s+d=\"M729\\.029[^\>]+\>/g, '');
    svgContent = svgContent.replace(/\<path\s+d=\"M885\\.834[^\>]+\>/g, '');
    
    // Remove placeholders
    svgContent = svgContent.replace(/\<rect\s+[^\>]*x=\"403\"[^\>]*y=\"64\"[^\>]*\>/g, '');
    svgContent = svgContent.replace(/\<rect\s+[^\>]*x=\"73\\.5\"[^\>]*y=\"830\\.5\"[^\>]*\>/g, '');
    svgContent = svgContent.replace(/\<rect\s+[^\>]*x=\"751\"[^\>]*\>/g, '');

    // Namespace IDs
    const uniqueId = `bc_${Date.now()}_`;
    svgContent = svgContent.replace(/id=\"([^\"]+)\"/g, `id=\"${uniqueId}$1\"`);
    svgContent = svgContent.replace(/url\\(#([^)]+)\\)/g, `url(#${uniqueId}$1)`);
    svgContent = svgContent.replace(/xlink:href=\"#([^\"]+)\"/g, `xlink:href=\"#${uniqueId}$1\"`);
    svgContent = svgContent.replace(/width=\"\\d+\"/, 'width=\"100%\"');
    svgContent = svgContent.replace(/height=\"\\d+\"/, 'height=\"100%\"');

    // Generate QR code (Dark Mode: White on Black)
    let qrCodeDataUri = linktree.qrCodeUrl;
    if (!qrCodeDataUri) {
      qrCodeDataUri = await QRCode.toDataURL(linktreeUrl, {
        margin: 1,
        color: { dark: '#FFFFFF', light: '#000000' }
      });
    }

    // ---------------------------------------------------------
    // PHASE 1: Generate PNG (High Precision Render)
    // ---------------------------------------------------------

    // Construct HTML that mirrors BusinessCard.tsx exactly
    const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <link href="https://fonts.googleapis.com/css2?family=Mrs+Saint+Delafield&display=swap" rel="stylesheet">
      <link href="https://fonts.googleapis.com/css2?family=Story+Script&display=swap" rel="stylesheet">
      <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;800&display=swap" rel="stylesheet">
      <style>
        /* Reset and Base */
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'Inter', sans-serif; display: flex; justify-content: center; align-items: center; min-height: 100vh; background: transparent; }
        
        /* Font Classes */
        .mrs-saint-delafield-regular { font-family: "Mrs Saint Delafield", cursive; font-weight: 400; }
        .story-script-regular { font-family: "Story Script", cursive; font-weight: 400; }
        .font-sans { font-family: 'Inter', sans-serif; }
        
        /* Tail wind Utilities Simulation */
        .absolute { position: absolute; }
        .relative { position: relative; }
        .top-0 { top: 0; }
        .left-0 { left: 0; }
        .w-full { width: 100%; }
        .h-full { height: 100%; }
        .flex { display: flex; }
        .flex-col { flex-direction: column; }
        .items-center { align-items: center; }
        .justify-center { justify-content: center; }
        .text-center { text-align: center; }
        .text-end { text-align: right; }
        .truncate { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
        .uppercase { text-transform: uppercase; }
        .object-cover { object-fit: cover; }
        .object-contain { object-fit: contain; }
        .pointer-events-none { pointer-events: none; }
        
        /* Colors */
        .text-white { color: white; }
        .text-gray-200 { color: #e5e7eb; }
        .text-gray-300 { color: #d1d5db; }
        .text-gray-400 { color: #9ca3af; }
        .text-zinc-100 { color: #f4f4f5; }
        .bg-gray-300 { background-color: #d1d5db; }
        .bg-gray-900 { background-color: #111827; }
        
        /* Typography */
        .font-light { font-weight: 300; }
        .font-medium { font-weight: 500; }
        .font-extrabold { font-weight: 800; }
        .tracking-wide { letter-spacing: 0.025em; }
        .tracking-widest { letter-spacing: 0.1em; }
        
        /* Effects */
        .drop-shadow-lg { filter: drop-shadow(0 10px 8px rgb(0 0 0 / 0.04)) drop-shadow(0 4px 3px rgb(0 0 0 / 0.1)); }
        .drop-shadow-md { filter: drop-shadow(0 4px 3px rgb(0 0 0 / 0.07)) drop-shadow(0 2px 2px rgb(0 0 0 / 0.06)); }
        .rounded-lg { border-radius: 0.5rem; }
        .rounded-xl { border-radius: 0.75rem; }

        /* Container Query Context */
        .container-query-wrapper {
            container-type: inline-size;
            width: 1050px;
            height: 1268px;
            position: relative;
        }

        /* The Card Container mimicking BusinessCard.tsx */
        .business-card-container {
            width: 100%;
            height: 100%;
            position: relative;
            background: white;
            padding: 9px;
            box-sizing: border-box;
        }

        /* SVG Background */
        .svg-layer {
            position: absolute;
            top: 9px; left: 9px; right: 9px; bottom: 9px;
            pointer-events: none;
        }
        .svg-layer svg { width: 100%; height: 100%; }
        
        /* Dynamic Styles for cqw handling (approximated since Puppeteer view is fixed) */
       
    </style>
    </head>
    <body>
      <div class="container-query-wrapper" id="capture-target">
        <div class="business-card-container">
            <!-- SVG Layer -->
            <div class="svg-layer">${svgContent}</div>

            <!-- Front Content (Top Half) -->
            <div class="absolute top-0 left-0 w-full" style="aspect-ratio: 1050/1268; pointer-events: none;">
                
                <!-- Avatar -->
                <div style="position: absolute; top: ${64/1268*100}%; left: ${403/1050*100}%; width: ${244/1050*100}%; height: ${244/1268*100}%; overflow: hidden; border-radius: 8px;">
                    ${linktree.avatarUrl ? `<img src="${linktree.avatarUrl}" class="w-full h-full object-cover">` : '<div class="w-full h-full bg-gray-300"></div>'}
                </div>

                <!-- Name -->
                <div style="position: absolute; top: ${320/1268*100}%; left: 0; width: 100%; text-align: center;">
                    <h2 class="text-white mrs-saint-delafield-regular drop-shadow-lg" style="font-size: 4.5cqw; text-transform: capitalize;">
                        ${linktree.displayName || "YOUR NAME"}
                    </h2>
                </div>

                <!-- Tagline -->
                <div style="position: absolute; top: ${380/1268*102}%; left: 0; width: 100%; text-align: center;">
                    <p class="text-gray-300 font-medium tracking-widest uppercase font-sans" style="font-size: 2.5cqw;">
                        ${linktree.tagline || "CREATIVE DIRECTOR"}
                    </p>
                </div>

                <!-- Email -->
                <div style="position: absolute; top: ${440/1268*96}%; left: 0; width: 100%; text-align: center;">
                    <p class="text-gray-400 font-light tracking-wide font-sans" style="font-size: 2.2cqw;">
                       ${(linktree.emailUrl || "").replace('mailto:', '') || "hello@example.com"}
                    </p>
                </div>
            </div>

            <!-- Back Content (Bottom Half) -->
             <div class="absolute top-0 left-0 w-full" style="aspect-ratio: 1050/1268; pointer-events: none;">
                
                <!-- QR Code -->
                <div style="position: absolute; top: ${830.5/1268*100}%; left: ${73.5/1050*100}%; width: ${276/1050*100}%; height: ${266/1268*100}%; padding: 8px;" class="bg-gray-900 rounded-xl flex items-center justify-center">
                    <img src="${qrCodeDataUri}" class="w-full h-full object-contain">
                </div>

                <!-- Socials -->
                <div style="position: absolute; top: ${720/1268*115}%; left: ${420/1050*100}%; width: ${580/1050*100}%; text-align: left;" class="flex flex-col" style="gap: 1.5cqw;">
                    ${[
                      { label: 'LinkedIn', value: linktree.linkedinUrl },
                      { label: 'GitHub', value: linktree.githubUrl },
                      { label: 'Twitter', value: linktree.twitterUrl },
                      { label: 'Instagram', value: linktree.instagramUrl },
                    ].filter(s => s.value).slice(0, 4).map(s => `
                        <div style="display: flex; flex-direction: column; gap: 0.3cqw; margin-bottom: 1.5cqw;"> 
                            <div class="text-gray-200 text-end font-extrabold font-sans uppercase" style="font-size: 2.1cqw; letter-spacing: 0.12em;">${s.label}</div>
                            <div class="text-gray-400 text-end font-sans truncate tracking-wide" style="font-size: 1.8cqw;">
                                ${s.value?.replace(/^https?:\/\/(www\.)?/, '').split('/')[0] === 'linkedin.com' ? s.value?.replace(/^https?:\/\/(www\.)?/, '') : s.value?.split('/').pop()}
                            </div>
                        </div>
                    `).join('')}
                </div>

                <!-- Role / Bottom Text -->
                 <div style="position: absolute; top: ${680/1268*110}%; left: ${420/1050*100}%; width: ${580/1050*100}%; text-align: right;">
                    <h1 class="text-zinc-100 story-script-regular drop-shadow-md" style="font-size: 4cqw;">
                        Aspiring Cloud Architect
                    </h1>
                </div>

             </div>
        </div>
      </div>
    </body>
    </html>
    `;

    // Launch Puppeteer
    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox', '--font-render-hinting=none'],
    });

    const page = await browser.newPage();
    
    // Set Viewport to encompass the card size with high pixel density
    // 1050x1268 is the SVG native size. 
    await page.setViewport({ width: 1050, height: 1268, deviceScaleFactor: 2 });
    
    await page.setContent(htmlContent, { waitUntil: 'networkidle0' });
    await page.evaluateHandle('document.fonts.ready');
    
    // Screenshot the specific container
    const element = await page.$('#capture-target');
    if (!element) throw new Error('Card container not found');
    
    const pngBuffer = await element.screenshot({ 
        type: 'png',
        omitBackground: true // Transparent background outside the card (though card is rectangular)
    });

    // ---------------------------------------------------------
    // PHASE 2: Generate PDF
    // ---------------------------------------------------------
    
    // Create new PDF page
    const pdfPage = await browser.newPage();
    
    // PDF Size: 3.75in x 2.25in (Business Card with Bleed)
    const pdfHtml = `
      <!DOCTYPE html>
      <html>
        <body style="margin: 0; padding: 0; width: 100vw; height: 100vh; display: flex; justify-content: center; align-items: center; background: white;">
          <img src="data:image/png;base64,${Buffer.from(pngBuffer).toString('base64')}" 
               style="width: 100%; height: 100%; object-fit: contain;">
        </body>
      </html>
    `;

    await pdfPage.setContent(pdfHtml);

    const pdf = await pdfPage.pdf({
      width: '3.75in',
      height: '2.25in',
      printBackground: true,
      margin: { top: 0, right: 0, bottom: 0, left: 0 }
    });

    await browser.close();

    return new Response(Buffer.from(pdf), {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'attachment; filename="business-card.pdf"'
      }
    });

  } catch (error) {
    console.error('PDF generation error:', error);
    return new Response(JSON.stringify({ 
      error: 'Failed to generate PDF',
      details: error instanceof Error ? error.message : String(error)
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};
