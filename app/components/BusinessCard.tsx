import type { Linktree } from "@prisma/client";
import { Linkedin, Github, Twitter, Instagram } from "lucide-react";

type Serialized<T> = {
  [P in keyof T]: T[P] extends Date ? string | Date : T[P];
};

interface BusinessCardProps {
  profile: Serialized<Linktree>;
  qrCodeUrl: string;
  linktreeUrl: string;
  svgContent?: string;
}

export function BusinessCard({ profile, qrCodeUrl, linktreeUrl }: BusinessCardProps) {
  const socialLinks = [
    { label: 'LinkedIn', value: profile.linkedinUrl, icon: Linkedin },
    { label: 'Instagram', value: profile.instagramUrl, icon: Instagram },
    { label: 'Twitter', value: profile.twitterUrl, icon: Twitter },
  ].filter(s => s.value);

  return (
    <>
      <style>{`
        @media print {
          @page { size: 7in 4in; margin: 0; }
          body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          .business-card-print { width: 7in !important; height: 4in !important; page-break-after: always; }
          .no-print { display: none !important; }
        }
      `}</style>

      {/* Two-sided card layout for print */}
      <div className="business-card-print flex gap-0" style={{ width: '700px', height: '200px' }}>
        
        {/* ===== FRONT SIDE ===== */}
        <div className="relative overflow-hidden flex-shrink-0" style={{ width: '350px', height: '200px', background: 'linear-gradient(135deg, #1e1b4b 0%, #4c1d95 50%, #0f0a1f 100%)' }}>
          
          {/* Content */}
          <div className="relative h-full flex flex-col items-center justify-center p-3 text-center z-10">
            {/* Avatar */}
            <div className="w-16 h-16 rounded-full p-1 bg-gradient-to-br from-indigo-400 to-purple-500 mb-2 shadow-[0_0_15px_rgba(139,92,246,0.4)]">
              <div className="w-full h-full rounded-full overflow-hidden bg-white border border-white">
                {profile.avatarUrl ? (
                  <img src={profile.avatarUrl} alt="" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-zinc-900 text-lg font-bold">
                    {profile.displayName?.charAt(0) || "Y"}
                  </div>
                )}
              </div>
            </div>

            {/* Name & Title */}
            <h1 className="text-white font-bold text-xl tracking-wide uppercase" style={{ textShadow: '0 2px 10px rgba(139,92,246,0.5)' }}>
              {profile.displayName || "Yahya"}
            </h1>
            <p className="text-[#a78bfa] font-medium text-[9px] mt-1.5 tracking-wider uppercase">
              {profile.tagline || "Cloud & Network Engineer"}
            </p>
            
            {/* Contact Email */}
            {profile.emailUrl && (
              <p className="text-zinc-300 font-light tracking-wide text-[8px] mt-1.5 uppercase opacity-80">
                {profile.emailUrl.replace('mailto:', '')}
              </p>
            )}

            {/* Social Icons */}
            <div className="flex gap-3 mt-2.5">
              {socialLinks.map((s) => (
                <div key={s.label} className="w-6 h-6 rounded-full border border-indigo-400/30 flex items-center justify-center text-indigo-300">
                  <s.icon size={12} />
                </div>
              ))}
            </div>

            {/* Domain */}
            <div className="absolute top-2.5 right-3 text-zinc-400 text-[6px] tracking-widest font-light uppercase opacity-50">
              {linktreeUrl?.replace(/^https?:\/\//, '') || 'yahyaoncloud.vercel.com'}
            </div>
          </div>
        </div>

        {/* ===== BACK SIDE ===== */}
        <div className="relative overflow-hidden flex-shrink-0 bg-black" style={{ width: '350px', height: '200px' }}>
          {/* Solid Split Background */}
          <div className="absolute left-0 top-0 bottom-0 w-[35%] bg-[#1e1e3f]" />

          {/* Content */}
          <div className="relative h-full w-full p-5 flex flex-col justify-between z-10">
            {/* Domain */}
            <div className="absolute top-3 right-4 text-zinc-700 text-[6.5px] tracking-[0.2em] uppercase">
               {linktreeUrl?.replace(/^https?:\/\//, '') || 'yahyaoncloud.vercel.com'}
            </div>

            {/* Main Statement */}
            <div className="self-end text-right w-[65%] mt-3">
              <h2 className="text-white text-[9px] font-light leading-relaxed tracking-wider uppercase opacity-80" style={{ textShadow: '0 2px 8px rgba(139,92,246,0.2)' }}>
                Building the foundations for <br/>
                scalable Cloud Architecture <br/>
                and Network systems.
              </h2>
            </div>
            
            {/* Bottom Section */}
            <div className="flex items-end justify-between w-full mt-auto">
              {/* Left Side: Scan Info + QR */}
              <div className="text-left mb-1 ml-1.5">
                 <p className="text-white/70 text-[5px] font-bold tracking-[0.25em] italic uppercase">SCAN HERE FOR MORE</p>
                 <p className="text-white/70 text-[5px] font-bold tracking-[0.25em] italic uppercase">INFORMATION</p>
                 
                 <div className="mt-1.5 w-11 h-11 bg-white/5 backdrop-blur-sm rounded p-0.5 border border-white/10">
                    <img src={qrCodeUrl} alt="QR" className="w-full h-full object-contain opacity-70" />
                 </div>
              </div>

              {/* Right Side: Contact */}
              <div className="flex flex-col items-end gap-1">
                 <div className="flex flex-col items-end gap-0.5 mb-1.5">
                    {socialLinks.map(s => (
                       <div key={s.label} className="flex items-center gap-1.5 text-zinc-500">
                          <s.icon size={8} className="text-[#6366f1]" />
                          <span className="text-[7.5px] font-light tracking-widest uppercase">@{profile.displayName?.toLowerCase().replace(/\s+/g,'') || "yahyaoncloud"}</span>
                       </div>
                    ))}
                 </div>

                 <div className="bg-[#4338ca] text-white px-2.5 py-0.5 rounded-full flex flex-col items-end shadow-lg shadow-purple-900/40">
                    <span className="text-[6.5px] font-bold tracking-[0.1em] border-b border-white/20 pb-0.5 mb-0.5 w-full text-right uppercase">
                       {profile.emailUrl?.replace('mailto:', '') || 'email@example.com'}
                    </span>
                    <span className="text-[6px] font-bold tracking-[0.2em]">
                       +918096278589
                    </span>
                 </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
