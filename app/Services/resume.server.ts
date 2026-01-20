import { Resume, type IResume } from '../models';
import { uploadToSupabase, deleteFromSupabase } from '../utils/supabase.server';
import QRCode from 'qrcode';

/**
 * Save a new resume
 */
// ... (imports remain)

/**
 * Save a new resume
 */
export async function saveResume(
  title: string,
  htmlContent: string,
  userId?: string
) {
  // NOTE: We no longer deactivate others by default to support multiple templates.
  // Managing "active" state can be done explicitly if needed.

  const resume = new Resume({
    userId,
    title,
    htmlContent,
    version: 1,
    isActive: true
  });

  await resume.save();
  return resume;
}

/**
 * Update existing resume
 */
export async function updateResume(
  resumeId: string,
  updates: { title?: string; htmlContent?: string }
) {
  const resume = await Resume.findById(resumeId);
  if (!resume) throw new Error('Resume not found');

  if (updates.title) resume.title = updates.title;
  if (updates.htmlContent) {
    resume.htmlContent = updates.htmlContent;
    resume.version += 1;
  }

  await resume.save();
  return resume;
}

/**
 * Generate PDF from HTML using server-side rendering
 * Note: This requires puppeteer to be installed. For simpler setups,
 * use client-side PDF generation (react-to-pdf)
 */
export async function generateResumePdf(resumeId: string) {
  const resume = await Resume.findById(resumeId);
  if (!resume) throw new Error('Resume not found');

  try {
    // Dynamically import puppeteer (optional dependency)
    const puppeteer = await import('puppeteer');
    
    const browser = await puppeteer.default.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const page = await browser.newPage();
    await page.setViewport({ width: 1200, height: 1600 });
    const content = resume.htmlContent || "<h1>No Content</h1>";
    await page.setContent(content, { waitUntil: 'networkidle0' });

    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: { top: '0.5in', right: '0.5in', bottom: '0.5in', left: '0.5in' }
    });

    await browser.close();

    // Upload to Supabase
    const userId = resume.userId?.toString() || 'default';
    const path = `resumes/${userId}/${resumeId}.pdf`;
    const file = new Blob([pdfBuffer], { type: 'application/pdf' });

    const { url, error } = await uploadToSupabase('resumes', path, file);

    if (error) throw new Error(error);

    // Update resume with PDF URL
    resume.pdfUrl = url;
    resume.metadata.lastPdfGenerated = new Date();
    await resume.save();

    return { pdfUrl: url };

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
  const resume = await Resume.findById(resumeId);
  if (!resume) throw new Error('Resume not found');
  if (!resume.pdfUrl) throw new Error('Generate PDF first');

  try {
    // Generate QR code as buffer
    const qrBuffer = await QRCode.toBuffer(resume.pdfUrl, {
      type: 'png',
      width: 512,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      }
    });

    // Upload to Supabase
    const userId = resume.userId?.toString() || 'default';
    const path = `resumes/${userId}/qr-${resumeId}.png`;
    const file = new Blob([qrBuffer], { type: 'image/png' });

    const { url, error } = await uploadToSupabase('resumes', path, file);

    if (error) throw new Error(error);

    // Update resume with QR URL
    resume.qrCodeUrl = url;
    resume.metadata.lastQrGenerated = new Date();
    await resume.save();

    return { qrCodeUrl: url };

  } catch (error) {
    console.error('QR code generation failed:', error);
    throw new Error(
      error instanceof Error ? error.message : 'Failed to generate QR code'
    );
  }
}

/**
 * Get the active resume (most recent active version)
 * TODO: Deprecate or use as "Default"
 */
export async function getActiveResume(userId?: string) {
  if (userId) {
    return await Resume.findOne({ userId, isActive: true }).sort({ updatedAt: -1 });
  }
  return await Resume.findOne({ isActive: true }).sort({ updatedAt: -1 });
}

/**
 * Get all resumes (for admin selection)
 */
export async function getAllResumes(userId?: string) {
  if (userId) {
    return await Resume.find({ userId }).sort({ title: 1 });
  }
  return await Resume.find({}).sort({ title: 1 });
}

export async function getResumeById(resumeId: string) {
  return await Resume.findById(resumeId);
}

// ... (remaining functions)

/**
 * Create a new resume from uploaded PDF
 */
export async function createResume(data: {
  title: string;
  pdfUrl?: string; // Optional if using pure DB storage, but good to keep if hybrid
  pdfData?: Buffer; // NEW: Binary content
  contentType?: string;
  fileName: string;
  userId?: string;
}) {
  const resume = new Resume({
    userId: data.userId,
    title: data.title,
    pdfUrl: data.pdfUrl || "",
    pdfData: data.pdfData,
    contentType: data.contentType || "application/pdf",
    fileName: data.fileName,
    htmlContent: "PDF_ONLY", // satisfy validation if schema update delayed
    version: 1,
    isActive: false // Default to inactive
  });

  await resume.save();
  return resume;
}

/**
 * Toggle resume active status
 */
export async function toggleResumeActive(resumeId: string) {
  const resume = await Resume.findById(resumeId);
  if (!resume) throw new Error('Resume not found');

  // If we are activating, we might want to deactivate others
  // For now, let's just toggle. But usually "Active" means "The One".
  // Let's implement robust "Set Active" logic.
  
  if (!resume.isActive) {
      // Activating: Deactivate others for this user (or global if no user)
      // Assuming single user for now or global admin
      await Resume.updateMany({}, { isActive: false });
      resume.isActive = true;
  } else {
      // Deactivating
      resume.isActive = false;
  }

  await resume.save();
  return resume;
}

/**
 * Delete a resume and its associated files
 */
export async function deleteResume(resumeId: string) {
  const resume = await Resume.findById(resumeId);
  if (!resume) throw new Error('Resume not found');

  // TODO: Delete from Cloudinary if possible. 
  // Needs public_id stored. Currently we store PDF URL.
  // We can extract public_id from URL or just accept it's orphaned in Cloudinary for now.
  // Or parsing URL: .../resumes/filename-timestamp.pdf
  
  await Resume.findByIdAndDelete(resumeId);
  return { success: true };
}

/**
 * Set resume as active (deactivates others)
 */
export async function setActiveResume(resumeId: string, userId?: string) {
  return toggleResumeActive(resumeId);
}
