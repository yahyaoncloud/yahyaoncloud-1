import fs from "fs/promises";
import path from "path";

const SETTINGS_FILE = path.resolve(process.cwd(), "site-settings.json");

export interface SiteSettings {
  title: string;
  description: string;
  keywords: string;
  logoUrl?: string;
  maintenanceMode: boolean;
  socialLinks: {
    twitter?: string;
    github?: string;
    linkedin?: string;
    instagram?: string;
  };
}

const DEFAULT_SETTINGS: SiteSettings = {
  title: "Yahya On Cloud",
  description: "Personal blog and portfolio of Yahya",
  keywords: "cloud, web, developer, tech",
  maintenanceMode: false,
  socialLinks: {}
};

export async function getSiteSettings(): Promise<SiteSettings> {
  try {
    const data = await fs.readFile(SETTINGS_FILE, "utf-8");
    return { ...DEFAULT_SETTINGS, ...JSON.parse(data) };
  } catch (error) {
    return DEFAULT_SETTINGS;
  }
}

export async function updateSiteSettings(settings: Partial<SiteSettings>) {
  const current = await getSiteSettings();
  const updated = { ...current, ...settings };
  await fs.writeFile(SETTINGS_FILE, JSON.stringify(updated, null, 2));
  return updated;
}
