import { useState } from "react";
import type { Linktree } from "@prisma/client";
import { Linkedin, Github, Twitter, Instagram, Mail, Globe } from "lucide-react";

type Serialized<T> = {
  [P in keyof T]: T[P] extends Date ? string | Date : T[P];
};

interface FlipBusinessCardProps {
  profile: Serialized<Linktree>;
  qrCodeUrl: string;
  linktreeUrl: string;
}

export function FlipBusinessCard({ profile, qrCodeUrl, linktreeUrl }: FlipBusinessCardProps) {
  const [isFlipped, setIsFlipped] = useState(false);

  const socialLinks = [
    { label: 'LinkedIn', value: profile.linkedinUrl, icon: Linkedin },
    { label: 'Instagram', value: profile.instagramUrl, icon: Instagram },
    { label: 'Twitter', value: profile.twitterUrl, icon: Twitter },
  ].filter(s => s.value);

  return (
    <div 
      className="cursor-pointer select-none"
      style={{ perspective: '1200px' }}
      onClick={() => setIsFlipped(!isFlipped)}
    >
      {/* Card: 500x286px (3.5:2 ratio) */}
      <div
        className="relative transition-transform duration-600 ease-out"
        style={{
          width: '500px',
          height: '286px',
          transformStyle: 'preserve-3d',
          transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
        }}
      >
        {/* ===== FRONT ===== */}
        <div
          className="absolute inset-0 rounded-xl overflow-hidden shadow-2xl"
          style={{ backfaceVisibility: 'hidden' }}
        >
          {/* Purple Gradient Background */}
          <div 
            className="absolute inset-0" 
            style={{
              background: 'linear-gradient(135deg, #1e1b4b 0%, #4c1d95 50%, #0f0a1f 100%)'
            }}
          />
          
          {/* Content */}
          <div className="relative h-full flex flex-col items-center justify-center p-5 text-center z-10">
            
            {/* Avatar */}
            <div className="w-24 h-24 rounded-full p-1.5 bg-gradient-to-br from-indigo-400 to-purple-500 mb-4 shadow-[0_0_30px_rgba(139,92,246,0.5)]">
              <div className="w-full h-full rounded-full overflow-hidden bg-white border-2 border-white">
                {profile.avatarUrl ? (
                  <img src={profile.avatarUrl} alt="" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-zinc-900 text-2xl font-bold">
                    {profile.displayName?.charAt(0) || "Y"}
                  </div>
                )}
              </div>
            </div>
            
            {/* Name & Title */}
            <h1 className="text-white font-bold text-3xl tracking-wide uppercase" style={{ textShadow: '0 2px 20px rgba(139,92,246,0.6)' }}>
              {profile.displayName || "Yahya"}
            </h1>
            <p className="text-[#a78bfa] font-medium text-sm mt-3 tracking-wider uppercase">
              {profile.tagline || "Cloud & Network Engineer"}
            </p>
            
            {/* Contact Email */}
            {profile.emailUrl && (
              <p className="text-zinc-300 font-light tracking-wide text-xs mt-3 uppercase">
                {profile.emailUrl.replace('mailto:', '')}
              </p>
            )}

            {/* Social Icons Row */}
            <div className="flex gap-5 mt-6">
              {socialLinks.map((s) => (
                <div key={s.label} className="w-10 h-10 rounded-full border-2 border-indigo-400/40 flex items-center justify-center text-indigo-300 hover:bg-indigo-400/20 hover:border-indigo-400 transition-all">
                  <s.icon size={18} />
                </div>
              ))}
            </div>

            {/* Domain Top Right */}
            <div className="absolute top-4 right-6 text-zinc-400 text-[10px] tracking-widest font-light uppercase opacity-60">
              {linktreeUrl?.replace(/^https?:\/\//, '') || 'yahyaoncloud.vercel.com'}
            </div>
          </div>
        </div>

        {/* ===== BACK ===== */}
        <div
          className="absolute inset-0 rounded-xl overflow-hidden shadow-2xl bg-black"
          style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
        >
          {/* Split/Solid Layout Background */}
          <div className="absolute inset-0 flex">
            {/* Left Section (Deeper Indigo) */}
            <div className="w-[38%] h-full bg-[#1e1e3f]" /> 
          </div>

          {/* Content */}
          <div className="relative h-full w-full p-6 flex flex-col justify-between z-10">
            
            {/* Top Right Domain */}
            <div className="absolute top-3 right-6 text-zinc-600 text-[9px] tracking-[0.2em] uppercase">
               {linktreeUrl?.replace(/^https?:\/\//, '') || 'yahyaoncloud.vercel.com'}
            </div>

            {/* Main Statement - Right Aligned */}
            <div className="self-end text-right w-[65%] mt-4">
              <h2 className="text-white text-[13px] font-light leading-relaxed tracking-wider uppercase opacity-90" style={{ textShadow: '0 2px 10px rgba(139,92,246,0.3)' }}>
                Building the foundations for <br/>
                scalable Cloud Architecture <br/>
                and Network systems.
              </h2>
            </div>
            
            {/* Bottom Section */}
            <div className="flex items-end justify-between w-full mt-auto">
              
              {/* Left Side: "SCAN HERE" */}
              <div className="text-left mb-1 ml-2">
                 <p className="text-white/80 text-[8px] font-bold tracking-[0.2em] italic uppercase">SCAN HERE FOR MORE</p>
                 <p className="text-white/80 text-[8px] font-bold tracking-[0.2em] italic uppercase">INFORMATION</p>
                 
                 {/* QR Overlay */}
                 <div className="mt-1.5 w-14 h-14 bg-white/5 backdrop-blur-sm rounded-lg p-1 border border-white/10">
                    <img src={qrCodeUrl} alt="QR" className="w-full h-full object-contain opacity-80" />
                 </div>
              </div>

              {/* Right Side: Social Handles & Contact Button */}
              <div className="flex flex-col items-end gap-1">
                 {/* Social List */}
                 <div className="flex flex-col items-end gap-1 mb-1.5">
                    {socialLinks.map(s => (
                       <div key={s.label} className="flex items-center gap-2 text-zinc-400">
                          <s.icon size={11} className="text-[#6366f1]" />
                          <span className="text-[9px] font-light tracking-widest uppercase">@{profile.displayName?.toLowerCase().replace(/\s+/g,'') || "yahyaoncloud"}</span>
                       </div>
                    ))}
                 </div>

                 {/* Contact Pill Button */}
                 <div className="bg-[#4c1d95] text-white px-3 py-1 rounded-full flex flex-col items-end shadow-lg shadow-purple-900/40 hover:bg-[#5b21b6] transition-colors">
                    <span className="text-[9px] font-bold tracking-[0.1em] border-b border-white/20 pb-0.5 mb-0.5 w-full text-right uppercase">
                       {profile.emailUrl?.replace('mailto:', '') || 'email@example.com'}
                    </span>
                    <span className="text-[8px] font-bold tracking-[0.2em]">
                       +918096278589
                    </span>
                 </div>
              </div>

            </div>
          </div>
        </div>
      </div>
      
      {/* Hint */}
      {/* <p className="text-center text-zinc-600 text-xs mt-4">click to flip</p> */}
    </div>
  );
}
