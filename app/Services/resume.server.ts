import { prisma } from '~/utils/prisma.server';
import { uploadToSupabase } from '../utils/supabase.server';
import QRCode from 'qrcode';
import type { Resume } from '@prisma/client';

export type { Resume };

/**
 * Save a new resume
 */
export async function saveResume(
  title: string,
  htmlContent: string,
  userId?: string
) {
  return prisma.resume.create({
    data: {
      userId,
      title,
      htmlContent,
      version: 1,
      isActive: true,
    },
  });
}

/**
 * Update existing resume
 */
export async function updateResume(
  resumeId: string,
  updates: { title?: string; htmlContent?: string }
) {
  const current = await prisma.resume.findUnique({ where: { id: resumeId } });
  if (!current) throw new Error('Resume not found');

  return prisma.resume.update({
    where: { id: resumeId },
    data: {
      title: updates.title ?? current.title,
      htmlContent: updates.htmlContent ?? current.htmlContent,
      version: updates.htmlContent ? current.version + 1 : current.version,
    },
  });
}

/**
 * Generate PDF from HTML using server-side rendering
 */
export async function generateResumePdf(resumeId: string) {
  const resume = await prisma.resume.findUnique({ where: { id: resumeId } });
  if (!resume) throw new Error('Resume not found');

  try {
    const puppeteer = await import('puppeteer');
    const browser = await puppeteer.default.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });

    const page = await browser.newPage();
    await page.setViewport({ width: 1200, height: 1600 });
    const content = resume.htmlContent || '<h1>No Content</h1>';
    await page.setContent(content, { waitUntil: 'networkidle0' as any });

    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: { top: '0.5in', right: '0.5in', bottom: '0.5in', left: '0.5in' },
    });

    await browser.close();

    const userId = resume.userId || 'default';
    const path = `resumes/${userId}/${resumeId}.pdf`;
    const file = new Blob([pdfBuffer as any], { type: 'application/pdf' });

    const { url, error } = await uploadToSupabase('resumes', path, file);
    if (error) throw new Error(error);

    const existingMetadata = (resume.metadata as Record<string, any>) || {};
    return await prisma.resume.update({
      where: { id: resumeId },
      data: {
        pdfUrl: url,
        metadata: {
          ...existingMetadata,
          lastPdfGenerated: new Date().toISOString(),
        },
      },
    });
  } catch (error) {
    console.error('PDF generation failed:', error);
    throw new Error(
      error instanceof Error ? error.message : 'Failed to generate PDF'
    );
  }
}

/**
 * Generate QR code for resume PDF
 */
export async function generateResumeQr(resumeId: string) {
  const resume = await prisma.resume.findUnique({ where: { id: resumeId } });
  if (!resume) throw new Error('Resume not found');
  if (!resume.pdfUrl) throw new Error('Generate PDF first');

  try {
    const qrBuffer = await QRCode.toBuffer(resume.pdfUrl, {
      type: 'png',
      width: 512,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#FFFFFF',
      },
    });

    const userId = resume.userId || 'default';
    const path = `resumes/${userId}/qr-${resumeId}.png`;
    const file = new Blob([qrBuffer as any], { type: 'image/png' });

    const { url, error } = await uploadToSupabase('resumes', path, file);
    if (error) throw new Error(error);

    const existingMetadata = (resume.metadata as Record<string, any>) || {};
    return await prisma.resume.update({
      where: { id: resumeId },
      data: {
        qrCodeUrl: url,
        metadata: {
          ...existingMetadata,
          lastQrGenerated: new Date().toISOString(),
        },
      },
    });
  } catch (error) {
    console.error('QR code generation failed:', error);
    throw new Error(
      error instanceof Error ? error.message : 'Failed to generate QR code'
    );
  }
}

/**
 * Get the active resume (most recent active version)
 */
export async function getActiveResume(userId?: string) {
  try {
    return await prisma.resume.findFirst({
      where: userId ? { userId, isActive: true } : { isActive: true },
      orderBy: { updatedAt: 'desc' },
    });
  } catch (error) {
    console.warn('getActiveResume warning:', error);
    return null;
  }
}

/**
 * Get all resumes (for admin selection)
 */
export async function getAllResumes(userId?: string) {
  try {
    return await prisma.resume.findMany({
      where: userId ? { userId } : {},
      orderBy: { title: 'asc' },
    });
  } catch (error) {
    console.warn('getAllResumes warning:', error);
    return [];
  }
}

export async function getResumeById(resumeId: string) {
  try {
    return await prisma.resume.findUnique({
      where: { id: resumeId },
    });
  } catch (error) {
    console.warn('getResumeById warning:', error);
    return null;
  }
}

/**
 * Create a new resume from uploaded PDF
 */
export async function createResume(data: {
  title: string;
  pdfUrl?: string;
  pdfData?: Buffer;
  contentType?: string;
  fileName: string;
  userId?: string;
}) {
  return prisma.resume.create({
    data: {
      userId: data.userId,
      title: data.title,
      pdfUrl: data.pdfUrl || '',
      pdfData: data.pdfData,
      contentType: data.contentType || 'application/pdf',
      fileName: data.fileName,
      htmlContent: 'PDF_ONLY',
      version: 1,
      isActive: false,
    },
  });
}

/**
 * Toggle resume active status
 */
export async function toggleResumeActive(resumeId: string) {
  const resume = await prisma.resume.findUnique({ where: { id: resumeId } });
  if (!resume) throw new Error('Resume not found');

  if (!resume.isActive) {
    // Activating this resume: deactivate all other resumes
    await prisma.resume.updateMany({
      where: { id: { not: resumeId } },
      data: { isActive: false },
    });
    return prisma.resume.update({
      where: { id: resumeId },
      data: { isActive: true },
    });
  } else {
    // Deactivating
    return prisma.resume.update({
      where: { id: resumeId },
      data: { isActive: false },
    });
  }
}

/**
 * Delete a resume
 */
export async function deleteResume(resumeId: string) {
  const resume = await prisma.resume.findUnique({ where: { id: resumeId } });
  if (!resume) throw new Error('Resume not found');

  await prisma.resume.delete({
    where: { id: resumeId },
  });
  return { success: true };
}

/**
 * Set resume as active (deactivates others)
 */
export async function setActiveResume(resumeId: string, userId?: string) {
  return toggleResumeActive(resumeId);
}
