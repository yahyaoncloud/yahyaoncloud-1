// Public Linktree Page - Minimalist Design
import { json, LoaderFunctionArgs, MetaFunction } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { 
  FileText, Linkedin, Instagram, Twitter, Github, Mail, 
  ExternalLink, Cloud, ArrowUpRight
} from "lucide-react";
import { getLinktreeByShortCode } from "~/Services/linktree.prisma.server";

export const meta: MetaFunction<typeof loader> = ({ data }) => {
  return [
    { title: data?.linktree?.displayName ? `${data.linktree.displayName}` : "Yahya | Links" },
    { name: "viewport", content: "width=device-width, initial-scale=1, maximum-scale=1" },
    { name: "description", content: data?.linktree?.tagline || "My personal links and portfolio" }
  ];
};

export async function loader({ params }: LoaderFunctionArgs) {
  const { shortCode } = params;
  
  if (!shortCode) {
    throw new Response("Not found", { status: 404 });
  }
  
  const linktree = await getLinktreeByShortCode(shortCode);
  
  if (!linktree || !linktree.isActive) {
    throw new Response("Not found", { status: 404 });
  }
  
  return json({ linktree });
}

export default function LinktreePage() {
  const { linktree } = useLoaderData<typeof loader>();
  
  const showcaseItems = (linktree.showcaseItems as { name: string; url: string; description?: string; icon?: string }[]) || [];
  const customLinks = (linktree.customLinks as { title: string; url: string; icon?: string; color?: string }[]) || [];

  const socialLinks = [
    { key: "resume", url: linktree.resumeUrl, icon: FileText, label: "My Resume" },
    { key: "linkedin", url: linktree.linkedinUrl, icon: Linkedin, label: "LinkedIn" },
    { key: "github", url: linktree.githubUrl, icon: Github, label: "GitHub" },
    { key: "twitter", url: linktree.twitterUrl, icon: Twitter, label: "X (Twitter)" },
    { key: "instagram", url: linktree.instagramUrl, icon: Instagram, label: "Instagram" },
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
            <a
              key={link.key}
              href={link.url!}
              target="_blank"
              rel="noopener noreferrer"
              className="
                group flex items-center justify-between p-4 rounded-xl
                bg-zinc-900/50 border border-zinc-800/50
                hover:bg-zinc-900 hover:border-zinc-700
                transition-all duration-200
              "
            >
              <div className="flex items-center gap-3 text-zinc-300 group-hover:text-white transition-colors">
                <link.icon size={18} strokeWidth={2} />
                <span className="text-sm font-medium">{link.label}</span>
              </div>
              <ArrowUpRight size={16} className="text-zinc-600 group-hover:text-zinc-400 transition-colors" />
            </a>
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
                  href={item.url}
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
                      <h3 className="text-sm font-medium text-zinc-200 group-hover:text-white transition-colors">
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
