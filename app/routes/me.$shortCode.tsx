// Public Linktree Page - Minimalist Design
import { json, LoaderFunctionArgs, MetaFunction } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { getActiveResume } from "~/Services/resume.server";
import { getLinktreeByShortCode } from "~/Services/linktree.prisma.server";
import { 
  FileText, Linkedin, Instagram, Twitter, Github, Mail, 
  ExternalLink, Cloud, ArrowUpRight, Download
} from "lucide-react";

// ... (meta remains same)

export async function loader({ params }: LoaderFunctionArgs) {
  const { shortCode } = params;
  
  if (!shortCode) {
    throw new Response("Not found", { status: 404 });
  }
  
  const [linktree, activeResume] = await Promise.all([
    getLinktreeByShortCode(shortCode),
    getActiveResume()
  ]);
  
  if (!linktree || !linktree.isActive) {
    throw new Response("Not found", { status: 404 });
  }
  
  return json({ linktree, activeResume });
}

export default function LinktreePage() {
  const { linktree, activeResume } = useLoaderData<typeof loader>();
  
  const showcaseItems = (linktree.showcaseItems as { name: string; url: string; description?: string; icon?: string }[]) || [];
  const customLinks = (linktree.customLinks as { title: string; url: string; icon?: string; color?: string }[]) || [];

  /* Helper to ensure absolute URLs */
  const ensureAbsoluteUrl = (url: string) => {
    if (!url) return "#";
    if (url.startsWith("http://") || url.startsWith("https://") || url.startsWith("mailto:") || url.startsWith("/")) {
      return url;
    }
    return `https://${url}`;
  };

  const socialLinks = [
    { key: "resume", url: "/resume", icon: FileText, label: "My Resume" },
    { key: "linkedin", url: ensureAbsoluteUrl(linktree.linkedinUrl || ""), icon: Linkedin, label: "LinkedIn" },
    { key: "github", url: ensureAbsoluteUrl(linktree.githubUrl || ""), icon: Github, label: "GitHub" },
    { key: "twitter", url: ensureAbsoluteUrl(linktree.twitterUrl || ""), icon: Twitter, label: "X (Twitter)" },
    { key: "instagram", url: ensureAbsoluteUrl(linktree.instagramUrl || ""), icon: Instagram, label: "Instagram" },
    { key: "email", url: linktree.emailUrl ? `mailto:${linktree.emailUrl}` : null, icon: Mail, label: "Contact Me" },
  ].filter(link => link.url);

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col items-center py-16 px-4 font-sans selection:bg-zinc-800">
      
      <main className="w-full max-w-md space-y-10 animate-fade-in">
        
        {/* Profile Header */}
        <div className="text-center space-y-4">
          <div className="relative inline-block group">
             {linktree.avatarUrl ? (
               <img 
                 src={linktree.avatarUrl} 
                 alt={linktree.displayName}
                 className="w-24 h-24 rounded-full object-cover border border-zinc-800 shadow-sm mx-auto transition-transform duration-300 group-hover:scale-105"
               />
             ) : (
               <div className="w-24 h-24 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center text-3xl font-medium text-zinc-400 mx-auto transition-transform duration-300 group-hover:scale-105">
                 {linktree.displayName?.charAt(0) || "Y"}
               </div>
             )}
          </div>
          
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-white">
              {linktree.displayName}
            </h1>
            {linktree.tagline && (
              <p className="text-zinc-500 mt-2 text-sm font-medium">
                {linktree.tagline}
              </p>
            )}
          </div>
        </div>

        {/* Social Links */}
        <div className="space-y-3">
          {socialLinks.map((link) => (
            <div key={link.key} className="relative group">
                <a
                  href={link.url!}
                  target={link.key === "email" ? "_self" : "_blank"}
                  rel="noopener noreferrer"
                  className="
                    flex items-center justify-between p-4 rounded-xl
                    bg-zinc-900/50 border border-zinc-800/50
                    hover:bg-zinc-900 hover:border-zinc-700
                    transition-all duration-200
                  "
                >
                  <div className="flex items-center gap-3 text-zinc-300 group-hover:text-white transition-colors">
                    <link.icon size={18} strokeWidth={2} />
                    <span className="text-sm font-medium relative after:absolute after:bottom-0 after:left-0 after:w-0 after:h-[1px] after:bg-white after:transition-all after:duration-300 group-hover:after:w-full">{link.label}</span>
                  </div>
                  {link.key !== "resume" && (
                     <ArrowUpRight size={16} className="text-zinc-600 group-hover:text-zinc-400 transition-colors" />
                  )}
                </a>
                
                {/* Dedicated Download Button for Resume */}
                {link.key === "resume" && activeResume?.pdfUrl && (
                     <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-3">
                        {/* View Arrow (part of main link effectively, but visual reinforcement) */}
                        <ArrowUpRight size={16} className="text-zinc-600 group-hover:text-zinc-400 transition-colors pointer-events-none" />
                        
                        {/* Divider */}
                        <div className="h-4 w-px bg-zinc-700/50"></div>
                        
                        {/* Download Action */}
                        <a 
                            href={`/resources/download/resume/${activeResume.id || activeResume._id}?download=true`}
                            className="p-1.5 text-zinc-500 hover:text-white hover:bg-zinc-800 rounded-md transition-colors z-10"
                            title="Download PDF"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <Download size={16} />
                        </a>
                     </div>
                )}
                 {link.key === "resume" && !activeResume?.pdfUrl && (
                     <ArrowUpRight size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-600 group-hover:text-zinc-400 transition-colors pointer-events-none" />
                 )}
            </div>
          ))}
        </div>

        {/* Current Work Showcase */}
        {showcaseItems.length > 0 && (
          <div className="space-y-4 pt-4 border-t border-zinc-900">
            <h2 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider text-center">
              {linktree.showcaseTitle || "Featured Work"}
            </h2>
            <div className="space-y-3">
              {showcaseItems.map((item, index) => (
                <a
                  key={index}
                  href={ensureAbsoluteUrl(item.url)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="
                    block p-4 rounded-xl
                    bg-zinc-900/30 border border-zinc-800/30
                    hover:bg-zinc-900 hover:border-zinc-700
                    transition-all duration-200 group
                  "
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-sm font-medium text-zinc-200 group-hover:text-white transition-colors relative inline after:absolute after:bottom-0 after:left-0 after:w-0 after:h-[1px] after:bg-white after:transition-all after:duration-300 group-hover:after:w-full">
                        {item.name}
                      </h3>
                      {item.description && (
                        <p className="text-xs text-zinc-500 mt-1 line-clamp-2 leading-relaxed">
                          {item.description}
                        </p>
                      )}
                    </div>
                    {/* Optional: Add icon or external link indicator if needed */}
                  </div>
                </a>
              ))}
            </div>
          </div>
        )}

        {/* Footer */}
        <footer className="pt-10 text-center">
          <p className="text-xs text-zinc-700 font-medium hover:text-zinc-600 transition-colors cursor-default">
            © {new Date().getFullYear()} {linktree.displayName}
          </p>
        </footer>

      </main>
    </div>
  );
}
