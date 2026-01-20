import { prisma } from "~/utils/prisma.server";
import crypto from "crypto";

export interface ScanMetadata {
  ipHash?: string;
  userAgent?: string;
  device?: string;
  browser?: string;
  os?: string;
  country?: string;
  referrer?: string;
}

// Generate a short unique QR ID (8 characters)
export function generateQrId(): string {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < 8; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

// Generate a random session ID for each scan (16 characters)
export function generateSessionId(): string {
  return crypto.randomBytes(8).toString('hex');
}

// Hash IP address for privacy
export function hashIP(ip: string): string {
  return crypto.createHash('sha256').update(ip).digest('hex').substring(0, 16);
}

// Parse user agent to extract device, browser, and OS
export function parseUserAgent(userAgent: string): { device: string; browser: string; os: string } {
  let device = 'desktop';
  let browser = 'unknown';
  let os = 'unknown';

  // Device detection
  if (/mobile/i.test(userAgent)) {
    device = 'mobile';
  } else if (/tablet|ipad/i.test(userAgent)) {
    device = 'tablet';
  }

  // Browser detection
  if (/firefox/i.test(userAgent)) {
    browser = 'Firefox';
  } else if (/edg/i.test(userAgent)) {
    browser = 'Edge';
  } else if (/chrome/i.test(userAgent)) {
    browser = 'Chrome';
  } else if (/safari/i.test(userAgent)) {
    browser = 'Safari';
  } else if (/opera|opr/i.test(userAgent)) {
    browser = 'Opera';
  }

  // OS detection
  if (/windows/i.test(userAgent)) {
    os = 'Windows';
  } else if (/macintosh|mac os/i.test(userAgent)) {
    os = 'macOS';
  } else if (/linux/i.test(userAgent)) {
    os = 'Linux';
  } else if (/android/i.test(userAgent)) {
    os = 'Android';
  } else if (/iphone|ipad|ipod/i.test(userAgent)) {
    os = 'iOS';
  }

  return { device, browser, os };
}

// Get the active QR for a linktree
export async function getActiveQR(linktreeId: string) {
  return prisma.linktreeQR.findFirst({
    where: {
      linktreeId,
      isActive: true,
    },
    include: {
      scans: {
        orderBy: { createdAt: 'desc' },
        take: 10,
      },
    },
  });
}

// Get QR by qrId (short URL ID)
export async function getQRByQrId(qrId: string) {
  return prisma.linktreeQR.findUnique({
    where: { qrId },
  });
}

// Create a new QR for a linktree
export async function createQR(linktreeId: string, qrCodeUrl?: string, qrTheme: string = 'light') {
  const qrId = generateQrId();
  
  return prisma.linktreeQR.create({
    data: {
      qrId,
      linktreeId,
      qrCodeUrl,
      qrTheme,
      isActive: true,
    },
  });
}

// Regenerate QR - deactivate old one and create new one
export async function regenerateQR(linktreeId: string, qrCodeUrl?: string, qrTheme: string = 'light') {
  // Deactivate all existing QRs for this linktree
  await prisma.linktreeQR.updateMany({
    where: { linktreeId, isActive: true },
    data: { isActive: false },
  });
  
  // Create new QR
  return createQR(linktreeId, qrCodeUrl, qrTheme);
}

// Update QR code URL (after uploading to storage)
export async function updateQRCodeUrl(id: string, qrCodeUrl: string) {
  return prisma.linktreeQR.update({
    where: { id },
    data: { qrCodeUrl },
  });
}

// Record a scan
export async function recordScan(qrId: string, metadata: ScanMetadata) {
  const sessionId = generateSessionId();
  
  // Create scan record
  const scan = await prisma.linktreeScan.create({
    data: {
      qrId,
      sessionId,
      ipHash: metadata.ipHash,
      userAgent: metadata.userAgent,
      device: metadata.device,
      browser: metadata.browser,
      os: metadata.os,
      country: metadata.country,
      referrer: metadata.referrer,
    },
  });
  
  // Increment total scans counter
  await prisma.linktreeQR.update({
    where: { id: qrId },
    data: {
      totalScans: { increment: 1 },
    },
  });
  
  return { scan, sessionId };
}

// Get QR statistics
export async function getQRStats(qrId: string) {
  const qr = await prisma.linktreeQR.findUnique({
    where: { id: qrId },
    select: { totalScans: true, createdAt: true },
  });
  
  if (!qr) return null;
  
  // Get scans from today
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const scansToday = await prisma.linktreeScan.count({
    where: {
      qrId,
      createdAt: { gte: today },
    },
  });
  
  // Get scans from this week
  const weekAgo = new Date();
  weekAgo.setDate(weekAgo.getDate() - 7);
  
  const scansThisWeek = await prisma.linktreeScan.count({
    where: {
      qrId,
      createdAt: { gte: weekAgo },
    },
  });
  
  return {
    totalScans: qr.totalScans,
    scansToday,
    scansThisWeek,
    createdAt: qr.createdAt,
  };
}

// Get recent scans
export async function getRecentScans(qrId: string, limit: number = 10) {
  return prisma.linktreeScan.findMany({
    where: { qrId },
    orderBy: { createdAt: 'desc' },
    take: limit,
    select: {
      id: true,
      sessionId: true,
      device: true,
      browser: true,
      os: true,
      country: true,
      createdAt: true,
    },
  });
}

// Get QR URL for permanent link
export function getQRUrl(qrId: string): string {
  const baseUrl = process.env.SITE_URL || 'http://localhost:5173';
  return `${baseUrl}/qr/${qrId}`;
}
