import { prisma } from "~/utils/prisma.server";

export interface AnnouncementInput {
  title: string;
  description?: string;
  backgroundUrl?: string;
  linkUrl?: string;
  linkText?: string;
  order?: number;
  isActive?: boolean;
  slot?: "events" | "news";
}

// Get all active announcements for public display
export async function getActiveAnnouncements() {
  return prisma.announcement.findMany({
    where: { isActive: true },
    orderBy: { order: "asc" },
  });
}

// Get all announcements for admin
export async function getAllAnnouncements() {
  return prisma.announcement.findMany({
    orderBy: [{ slot: "asc" }, { order: "asc" }],
  });
}

// Get single announcement by ID
export async function getAnnouncementById(id: string) {
  return prisma.announcement.findUnique({
    where: { id },
  });
}

// Create new announcement
export async function createAnnouncement(data: AnnouncementInput) {
  return prisma.announcement.create({
    data: {
      title: data.title,
      description: data.description,
      backgroundUrl: data.backgroundUrl,
      linkUrl: data.linkUrl,
      linkText: data.linkText,
      order: data.order || 0,
      isActive: data.isActive ?? true,
      slot: data.slot || "events",
    },
  });
}

// Update announcement
export async function updateAnnouncement(id: string, data: Partial<AnnouncementInput>) {
  return prisma.announcement.update({
    where: { id },
    data,
  });
}

// Delete announcement
export async function deleteAnnouncement(id: string) {
  return prisma.announcement.delete({
    where: { id },
  });
}

// Toggle announcement active status
export async function toggleAnnouncementStatus(id: string) {
  const announcement = await prisma.announcement.findUnique({ where: { id } });
  if (!announcement) throw new Error("Announcement not found");
  
  return prisma.announcement.update({
    where: { id },
    data: { isActive: !announcement.isActive },
  });
}
