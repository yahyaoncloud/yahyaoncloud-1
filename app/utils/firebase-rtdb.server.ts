/**
 * Firebase Realtime Database Server Integration for Guestbook
 * Database URL: process.env.FIREBASE_DATABASE_URL
 */

export interface GuestbookEntry {
  id: string;
  author: string;
  email?: string;
  avatar?: string;
  provider?: string;
  content: string;
  approved: boolean;
  createdAt: number | string;
}

const FIREBASE_DB_URL = process.env.FIREBASE_DATABASE_URL || "https://yahyaoncloud-9b5c6-default-rtdb.asia-southeast1.firebasedatabase.app";
const RETENTION_MS = 30 * 24 * 60 * 60 * 1000; // 30 days retention policy

/**
 * Fetch all guestbook entries from Firebase RTDB
 */
export async function getGuestbookFromRTDB(): Promise<GuestbookEntry[]> {
  try {
    const res = await fetch(`${FIREBASE_DB_URL}/guestbook.json`, {
      headers: { "Content-Type": "application/json" },
    });

    if (!res.ok) {
      console.warn("Firebase RTDB fetch failed with status:", res.status);
      return [];
    }

    const data = await res.json();
    if (!data || typeof data !== "object") return [];

    const now = Date.now();
    const entries: GuestbookEntry[] = [];
    const expiredKeys: string[] = [];

    // Parse and check 30-day retention
    for (const [key, val] of Object.entries(data)) {
      if (val && typeof val === "object") {
        const item = val as any;
        const createdTimestamp = typeof item.createdAt === "number" ? item.createdAt : new Date(item.createdAt || 0).getTime();
        
        // 30 days retention expiration check
        if (now - createdTimestamp > RETENTION_MS) {
          expiredKeys.push(key);
        } else {
          entries.push({
            id: key,
            author: item.author || item.name || "Anonymous",
            email: item.email || "",
            avatar: item.avatar || item.photoURL || "",
            provider: item.provider || "email",
            content: item.content || item.message || "",
            approved: item.approved !== false, // default true or pending
            createdAt: item.createdAt || new Date().toISOString(),
          });
        }
      }
    }

    // Auto-prune expired messages in the background
    if (expiredKeys.length > 0) {
      pruneExpiredRTDBKeys(expiredKeys).catch(console.warn);
    }

    return entries.sort((a, b) => {
      const timeA = typeof a.createdAt === "number" ? a.createdAt : new Date(a.createdAt).getTime();
      const timeB = typeof b.createdAt === "number" ? b.createdAt : new Date(b.createdAt).getTime();
      return timeB - timeA;
    });
  } catch (err) {
    console.error("getGuestbookFromRTDB error:", err);
    return [];
  }
}

/**
 * Add a new guestbook message to Firebase RTDB
 */
export async function addGuestbookToRTDB(entry: Omit<GuestbookEntry, "id">): Promise<{ success: boolean; id?: string }> {
  try {
    const res = await fetch(`${FIREBASE_DB_URL}/guestbook.json`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...entry,
        createdAt: Date.now(),
      }),
    });

    if (!res.ok) {
      throw new Error(`Firebase RTDB POST failed: ${res.statusText}`);
    }

    const data = await res.json();
    return { success: true, id: data.name };
  } catch (err) {
    console.error("addGuestbookToRTDB error:", err);
    return { success: false };
  }
}

/**
 * Delete a guestbook entry by ID from Firebase RTDB
 */
export async function deleteGuestbookFromRTDB(id: string): Promise<boolean> {
  try {
    const res = await fetch(`${FIREBASE_DB_URL}/guestbook/${id}.json`, {
      method: "DELETE",
    });
    return res.ok;
  } catch (err) {
    console.error("deleteGuestbookFromRTDB error:", err);
    return false;
  }
}

/**
 * Approve or toggle guestbook entry in Firebase RTDB
 */
export async function approveGuestbookInRTDB(id: string, approved = true): Promise<boolean> {
  try {
    const res = await fetch(`${FIREBASE_DB_URL}/guestbook/${id}.json`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ approved }),
    });
    return res.ok;
  } catch (err) {
    console.error("approveGuestbookInRTDB error:", err);
    return false;
  }
}

/**
 * Background helper to prune expired keys older than 30 days
 */
async function pruneExpiredRTDBKeys(keys: string[]): Promise<void> {
  for (const key of keys) {
    try {
      await fetch(`${FIREBASE_DB_URL}/guestbook/${key}.json`, { method: "DELETE" });
    } catch {
      // Ignore background cleanup errors
    }
  }
}
