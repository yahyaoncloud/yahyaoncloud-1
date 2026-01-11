import { prisma } from "~/utils/prisma.server";

export interface ShowcaseItem {
  name: string;
  url: string;
  description?: string;
  icon?: string;
}

export interface CustomLink {
  title: string;
  url: string;
  icon?: string;
  color?: string;
}

// Get the active linktree profile
export async function getLinktree() {
  const linktree = await prisma.linktree.findFirst({
    where: { isActive: true },
  });
  
  if (!linktree) {
    // Create default linktree if none exists
    return createDefaultLinktree();
  }
  
  return linktree;
}

// Get linktree by short code (for QR redirect)
export async function getLinktreeByShortCode(shortCode: string) {
  return prisma.linktree.findUnique({
    where: { shortCode },
  });
}

// Create default linktree
export async function createDefaultLinktree() {
  const shortCode = generateShortCode();
  
  return prisma.linktree.create({
    data: {
      displayName: "Yahya",
      tagline: "Cloud & Web Developer",
      theme: "dark",
      shortCode,
      showcaseTitle: "My Current Work",
      showcaseItems: [
        {
          name: "AburCloud",
          url: "https://aburcloud.com",
          description: "My startup - Cloud Solutions",
          icon: "cloud",
        },
      ] as ShowcaseItem[],
      customLinks: [] as CustomLink[],
      isActive: true,
    },
  });
}

// Update linktree profile
export async function updateLinktree(id: string, data: {
  displayName?: string;
  tagline?: string;
  avatarUrl?: string;
  backgroundUrl?: string;
  theme?: string;
  resumeUrl?: string;
  linkedinUrl?: string;
  instagramUrl?: string;
  twitterUrl?: string;
  githubUrl?: string;
  emailUrl?: string;
  selectedResumeId?: string;
  showcaseTitle?: string;
  showcaseItems?: ShowcaseItem[];
  customLinks?: CustomLink[];
}) {
  return prisma.linktree.update({
    where: { id },
    data,
  });
}

// Update QR code URL
export async function updateLinktreeQR(id: string, qrCodeUrl: string) {
  return prisma.linktree.update({
    where: { id },
    data: { qrCodeUrl },
  });
}

// Generate new short code
export async function regenerateShortCode(id: string) {
  const shortCode = generateShortCode();
  return prisma.linktree.update({
    where: { id },
    data: { shortCode },
  });
}

// Helper to generate unique short code
function generateShortCode(): string {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < 8; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

// Get full linktree URL for QR code
export function getLinktreeUrl(shortCode: string): string {
  // In production, replace with actual domain
  const baseUrl = process.env.SITE_URL || 'http://localhost:5173';
  return `${baseUrl}/me/${shortCode}`;
}
