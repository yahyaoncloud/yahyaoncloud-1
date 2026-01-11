import type { Linktree } from "@prisma/client";

// Utility type to handle serialization of Dates
type Serialized<T> = {
  [P in keyof T]: T[P] extends Date ? string | Date : T[P];
};

interface BusinessCardProps {
  svgContent: string;
  profile: Serialized<Linktree>;
  qrCodeUrl: string;
  linktreeUrl: string;
}

export function BusinessCard({ svgContent, profile, qrCodeUrl, linktreeUrl }: BusinessCardProps) {
  // Enhanced print styles for professional PDF output
  const printStyles = `
    @media print {
      @page {
        size: 3.75in 2.25in; /* Card size + 0.125" bleed on all sides */
        margin: 0;
      }
      
      body {
        -webkit-print-color-adjust: exact;
        print-color-adjust: exact;
        color-adjust: exact;
      }
      
      .business-card-container {
        width: 3.75in !important;
        height: 2.25in !important;
        max-width: none !important;
        page-break-after: always;
        position: relative;
        padding: 9px !important;
      }
      
      /* Fix text sizing for print - convert cqw to px */
      .business-card-container h2 {
        font-size: 32px !important;
      }
      
      .business-card-container .tagline-text {
        font-size: 18px !important;
      }
      
      .business-card-container .email-text {
        font-size: 16px !important;
      }
      
      .business-card-container .social-label {
        font-size: 15px !important;
      }
      
      .business-card-container .social-value {
        font-size: 13px !important;
      }
      
      .business-card-container .scan-text {
        font-size: 32px !important;
      }
      
      /* Crop marks for professional printing */
      .crop-marks {
        display: block !important;
      }
      
      /* Ensure fonts render properly */
      * {
        -webkit-font-smoothing: antialiased;
        -moz-osx-font-smoothing: grayscale;
      }
    }
    
    @media screen {
      .crop-marks {
        display: none;
      }
    }
  `;

  return (
    <>
    <style>{printStyles}</style>
    
    {/* Crop Marks for Professional Printing */}
    <svg className="crop-marks absolute" style={{ width: '3.75in', height: '2.25in', position: 'absolute', top: 0, left: 0, pointerEvents: 'none' }}>
      {/* Top-left crop marks */}
      <line x1="0" y1="9" x2="18" y2="9" stroke="black" strokeWidth="0.5" />
      <line x1="9" y1="0" x2="9" y2="18" stroke="black" strokeWidth="0.5" />
      
      {/* Top-right crop marks */}
      <line x1="100%" y1="9" x2="calc(100% - 18px)" y2="9" stroke="black" strokeWidth="0.5" />
      <line x1="calc(100% - 9px)" y1="0" x2="calc(100% - 9px)" y2="18" stroke="black" strokeWidth="0.5" />
      
      {/* Bottom-left crop marks */}
      <line x1="0" y1="calc(100% - 9px)" x2="18" y2="calc(100% - 9px)" stroke="black" strokeWidth="0.5" />
      <line x1="9" y1="100%" x2="9" y2="calc(100% - 18px)" stroke="black" strokeWidth="0.5" />
      
      {/* Bottom-right crop marks */}
      <line x1="100%" y1="calc(100% - 9px)" x2="calc(100% - 18px)" y2="calc(100% - 9px)" stroke="black" strokeWidth="0.5" />
      <line x1="calc(100% - 9px)" y1="100%" x2="calc(100% - 9px)" y2="calc(100% - 18px)" stroke="black" strokeWidth="0.5" />
    </svg>
    
    {/* Business Card with Bleed Zone (0.125" = 9px at 72dpi) */}
    <div className="relative w-full max-w-[540px] aspect-[1050/1268] shadow-2xl rounded-xl overflow-hidden bg-white business-card-container print:rounded-none print:shadow-none" style={{ containerType: 'inline-size', padding: '9px' }}>

      {/* SVG Background Layer */}
      <div 
        dangerouslySetInnerHTML={{ __html: svgContent }} 
        className="absolute inset-[9px] w-[calc(100%-18px)] h-[calc(100%-18px)] select-none pointer-events-none [&>svg]:w-full [&>svg]:h-full"
      />

      {/* 
         Overlay Layer - Positioned absolutely over the SVG.
         The SVG viewBox is 0 0 1050 1268.
         We use percentage-based positioning or viewBox coordinate mapping.
         Since the container width scales, we should use % for positions if possible 
         or use a container query / transform scale.
         
         Easier approach: 
         Set the container to be relative and the content to be absolute.
         We assume the SVG fills the container.
      */}
      
      {/* Front Card Content Area (Top Half: 0 - 600) */}
      <div className="absolute top-0 left-0 w-full aspect-[1050/1268] pointer-events-none">
        
        {/* Avatar Placeholder: x=403, y=64, w=244, h=244 */}
        <div style={{
            position: 'absolute',
            top: `${(64 / 1268) * 100}%`,
            left: `${(403 / 1050) * 100}%`,
            width: `${(244 / 1050) * 100}%`,
            height: `${(244 / 1268) * 100}%`, // Note: aspect ratio might skew if container isn't matching SVG AR exactly
          }}
          className="flex items-center justify-center overflow-hidden"
        >
           {profile.avatarUrl ? (
             <img 
               src={profile.avatarUrl} 
               alt="Avatar" 
               className="w-full h-full object-cover rounded-lg" // Matching the SVG rect rx might be needed if visible
             />
           ) : (
             <div className="w-full h-full bg-gray-300" />
           )}
        </div>

        {/* Name: Previously at y ~ 320-360. Centered horizontally? 
            Original path bounds were roughly x=467 to 533? No, multiple paths.
            Let's assume centered text for Name.
        */}
        <div style={{
            position: 'absolute',
            top: `${(320 / 1268) * 100}%`,
            left: '0',
            width: '100%',
            textAlign: 'center'
          }}
        >
          <h2 className="text-white capitalize mrs-saint-delafield-regular text-[4.5cqw] drop-shadow-lg" >
            {profile.displayName || "YOUR NAME"}
          </h2>
        </div>

        {/* Tagline / Title: Below Name. y ~ 370 */}
        <div style={{
            position: 'absolute',
            top: `${(380 / 1268) * 102}%`,
            left: '0',
            width: '100%',
            textAlign: 'center'
          }}
        >
          <p className="tagline-text text-gray-300 text-[2.5cqw] font-medium tracking-widest uppercase font-sans">
            {profile.tagline || "CREATIVE DIRECTOR"}
          </p>
        </div>

        {/* Primary Contact / Email: y ~ 440? */}
        <div style={{
            position: 'absolute',
            top: `${(440 / 1268) * 96}%`,
            left: '0',
            width: '100%',
            textAlign: 'center'
          }}
        >
           <p className="email-text text-gray-400 text-[2.2cqw] font-light tracking-wide font-sans">
             {(profile.emailUrl || "").replace('mailto:', '') || "hello@example.com"}
           </p>
        </div>

      </div>

      {/* Back Card Content Area (Bottom Half: starts at 668) */}
      <div className="absolute top-0 left-0 w-full aspect-[1050/1268] pointer-events-none">
        
        {/* QR Code Container: x=73.5, y=830.5, w=276, h=266 */}
        <div style={{
            position: 'absolute',
            top: `${(830.5 / 1268) * 100}%`,
            left: `${(73.5 / 1050) * 100}%`,
            width: `${(276 / 1050) * 100}%`,
            height: `${(266 / 1268) * 100}%`,
          }}
          className="flex items-center justify-center p-2 bg-gray-900 rounded-xl"
        >
          {qrCodeUrl && (
            <img src={qrCodeUrl} alt="QR Code" className="w-full h-full object-contain" />
          )}
        </div>
        
      
        {/* Maximum 3-4 specific social links if available */}
        <div style={{
            position: 'absolute',
            top: `${(720 / 1268) * 115}%`,
            left: `${(420 / 1050) * 100}%`,
            width: `${(580 / 1050) * 100}%`,
            textAlign: 'left'
          }}
          className="flex flex-col gap-[1.5cqw]"
        >
           {/* Socials */}
           {[
             { label: 'LinkedIn', value: profile.linkedinUrl },
             { label: 'GitHub', value: profile.githubUrl },
             { label: 'Twitter', value: profile.twitterUrl },
             { label: 'Instagram', value: profile.instagramUrl },
           ].filter(s => s.value).slice(0, 4).map((s) => (
             <div key={s.label} className="flex flex-col gap-[0.3cqw]">
                <div className="social-label text-gray-200 text-[2.1cqw] text-end font-extrabold font-sans uppercase tracking-[0.12em]" style={{ letterSpacing: '0.12em' }}>{s.label}</div>
                <div className="social-value text-gray-400 text-[1.8cqw] text-end font-sans truncate tracking-wide">
                  {s.value?.replace(/^https?:\/\/(www\.)?/, '').split('/')[0] === 'linkedin.com' 
                    ? s.value?.replace(/^https?:\/\/(www\.)?/, '') 
                    : s.value?.split('/').pop()}
                </div>
             </div>
           ))}
        </div>
        
  {/* Bottom Text / Role */}
        <div style={{
            position: 'absolute',
            top: `${(680 / 1268) * 110}%`,
            left: `${(420 / 1050) * 100}%`,
            width: `${(580 / 1050) * 100}%`,
            textAlign: 'right'
          }}
        >
          <h1 className="text-zinc-100 story-script-regular text-[4cqw]  drop-shadow-md">
            Aspiring Cloud Architect
          </h1>
        </div>

      </div>
    </div>
    </>
  );
}
