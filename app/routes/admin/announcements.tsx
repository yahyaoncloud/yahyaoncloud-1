// Admin Announcements - Manage top cards on blog homepage
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { json, ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { useLoaderData, useActionData, Form, useNavigation } from "@remix-run/react";
import { 
  getAllAnnouncements, 
  createAnnouncement, 
  updateAnnouncement, 
  deleteAnnouncement,
  toggleAnnouncementStatus 
} from "~/Services/announcement.prisma.server";
import { uploadToSupabase } from "~/utils/supabase.server";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { 
  Plus, 
  Trash2, 
  Save, 
  Image as ImageIcon, 
  Calendar, 
  Newspaper,
  Eye,
  EyeOff,
  Edit,
  X
} from "lucide-react";
import toast from "react-hot-toast";

export async function loader({ request }: LoaderFunctionArgs) {
  const announcements = await getAllAnnouncements();
  return json({ announcements });
}

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();
  const intent = formData.get("intent") as string;

  try {
    if (intent === "create") {
      await createAnnouncement({
        title: formData.get("title") as string,
        description: (formData.get("description") as string) || undefined,
        backgroundUrl: (formData.get("backgroundUrl") as string) || undefined,
        linkUrl: (formData.get("linkUrl") as string) || undefined,
        linkText: (formData.get("linkText") as string) || undefined,
        slot: (formData.get("slot") as "events" | "news") || "events",
        order: parseInt(formData.get("order") as string) || 0,
        isActive: formData.get("isActive") === "true",
      });
      return json({ success: true, message: "Announcement created" });
    }

    if (intent === "update") {
      const id = formData.get("id") as string;
      await updateAnnouncement(id, {
        title: formData.get("title") as string,
        description: (formData.get("description") as string) || undefined,
        backgroundUrl: (formData.get("backgroundUrl") as string) || undefined,
        linkUrl: (formData.get("linkUrl") as string) || undefined,
        linkText: (formData.get("linkText") as string) || undefined,
        slot: (formData.get("slot") as "events" | "news") || "events",
        order: parseInt(formData.get("order") as string) || 0,
      });
      return json({ success: true, message: "Announcement updated" });
    }

    if (intent === "delete") {
      const id = formData.get("id") as string;
      await deleteAnnouncement(id);
      return json({ success: true, message: "Announcement deleted" });
    }

    if (intent === "toggle") {
      const id = formData.get("id") as string;
      await toggleAnnouncementStatus(id);
      return json({ success: true, message: "Status toggled" });
    }

    return json({ success: false, error: "Unknown action" }, { status: 400 });
  } catch (error) {
    console.error("Announcement action error:", error);
    return json({ 
      success: false, 
      error: error instanceof Error ? error.message : "An error occurred" 
    }, { status: 500 });
  }
}

interface Announcement {
  id: string;
  title: string;
  description: string | null;
  backgroundUrl: string | null;
  linkUrl: string | null;
  linkText: string | null;
  order: number;
  isActive: boolean;
  slot: string;
}

export default function AdminAnnouncements() {
  const { announcements } = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  const navigation = useNavigation();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    if (actionData?.success) {
      toast.success(actionData.message);
      setEditingId(null);
      setIsCreating(false);
    }
    if (actionData?.error) {
      toast.error(actionData.error);
    }
  }, [actionData]);

  const eventsCards = announcements.filter((a: Announcement) => a.slot === "events");
  const newsCards = announcements.filter((a: Announcement) => a.slot === "news");

  const AnnouncementForm = ({ 
    announcement, 
    onCancel 
  }: { 
    announcement?: Announcement; 
    onCancel: () => void;
  }) => (
    <Form method="post" className="space-y-4">
      <input type="hidden" name="intent" value={announcement ? "update" : "create"} />
      {announcement && <input type="hidden" name="id" value={announcement.id} />}
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="title">Title *</Label>
          <Input 
            id="title" 
            name="title" 
            defaultValue={announcement?.title || ""} 
            required 
            className="mt-1" 
            placeholder="e.g., AWS re:Invent 2025"
          />
        </div>
        <div>
          <Label htmlFor="slot">Card Type</Label>
          <select 
            id="slot" 
            name="slot" 
            defaultValue={announcement?.slot || "events"}
            className="w-full h-10 px-3 mt-1 border rounded-md bg-white dark:bg-zinc-900"
          >
            <option value="events">Events</option>
            <option value="news">News</option>
          </select>
        </div>
        <div className="md:col-span-2">
          <Label htmlFor="description">Description</Label>
          <Input 
            id="description" 
            name="description" 
            defaultValue={announcement?.description || ""} 
            className="mt-1" 
            placeholder="Short description..."
          />
        </div>
        <div>
          <Label htmlFor="backgroundUrl">Background Image URL</Label>
          <Input 
            id="backgroundUrl" 
            name="backgroundUrl" 
            defaultValue={announcement?.backgroundUrl || ""} 
            className="mt-1" 
            placeholder="https://..."
          />
        </div>
        <div>
          <Label htmlFor="order">Display Order</Label>
          <Input 
            id="order" 
            name="order" 
            type="number" 
            defaultValue={announcement?.order || 0} 
            className="mt-1" 
          />
        </div>
        <div>
          <Label htmlFor="linkUrl">Link URL (optional)</Label>
          <Input 
            id="linkUrl" 
            name="linkUrl" 
            defaultValue={announcement?.linkUrl || ""} 
            className="mt-1" 
            placeholder="https://..."
          />
        </div>
        <div>
          <Label htmlFor="linkText">Link Text (optional)</Label>
          <Input 
            id="linkText" 
            name="linkText" 
            defaultValue={announcement?.linkText || ""} 
            className="mt-1" 
            placeholder="Learn more"
          />
        </div>
      </div>
      
      {!announcement && (
        <div className="flex items-center gap-2">
          <input type="hidden" name="isActive" value="true" />
        </div>
      )}
      
      <div className="flex gap-2">
        <Button 
          type="submit" 
          disabled={navigation.state === "submitting"}
          className="gap-2 text-white hover:opacity-90"
          style={{ backgroundColor: 'rgb(var(--color-primary))' }}
        >
          <Save size={16} />
          {announcement ? "Update" : "Create"}
        </Button>
        <Button type="button" variant="outline" onClick={onCancel}>
          <X size={16} className="mr-1" /> Cancel
        </Button>
      </div>
    </Form>
  );

  const AnnouncementCard = ({ announcement }: { announcement: Announcement }) => (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white dark:bg-zinc-950 rounded-lg border border-zinc-200 dark:border-zinc-700 overflow-hidden"
    >
      {/* Preview */}
      <div 
        className="h-24 relative flex items-center justify-center bg-zinc-100 dark:bg-zinc-800"
        style={announcement.backgroundUrl ? {
          backgroundImage: `url(${announcement.backgroundUrl})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        } : {}}
      >
        <div className="absolute inset-0 bg-black/40" />
        <h3 className="relative text-white font-semibold text-lg px-4 text-center">
          {announcement.title}
        </h3>
        {!announcement.isActive && (
          <span className="absolute top-2 right-2 bg-amber-500 text-white text-xs px-2 py-1 rounded">
            Hidden
          </span>
        )}
      </div>
      
      {/* Actions */}
      {editingId === announcement.id ? (
        <div className="p-4">
          <AnnouncementForm announcement={announcement} onCancel={() => setEditingId(null)} />
        </div>
      ) : (
        <div className="p-4">
          {announcement.description && (
            <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-3">{announcement.description}</p>
          )}
          <div className="flex items-center justify-between">
            <div className="flex gap-2">
              <Button 
                size="sm" 
                variant="ghost" 
                onClick={() => setEditingId(announcement.id)}
                className="gap-1"
              >
                <Edit size={14} /> Edit
              </Button>
              <Form method="post">
                <input type="hidden" name="intent" value="toggle" />
                <input type="hidden" name="id" value={announcement.id} />
                <Button size="sm" variant="ghost" type="submit" className="gap-1">
                  {announcement.isActive ? <EyeOff size={14} /> : <Eye size={14} />}
                  {announcement.isActive ? "Hide" : "Show"}
                </Button>
              </Form>
            </div>
            <Form method="post">
              <input type="hidden" name="intent" value="delete" />
              <input type="hidden" name="id" value={announcement.id} />
              <Button 
                size="sm" 
                variant="ghost" 
                type="submit"
                className="text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                onClick={(e) => !confirm("Delete this announcement?") && e.preventDefault()}
              >
                <Trash2 size={14} />
              </Button>
            </Form>
          </div>
        </div>
      )}
    </motion.div>
  );

  return (
    <div className="min-h-screen text-zinc-900 dark:text-zinc-100">
      <div className="max-w-5xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold mb-2">Announcements</h1>
              <div className="w-12 h-0.5 bg-zinc-900 dark:bg-zinc-100"></div>
            </div>
            <Button 
              onClick={() => setIsCreating(true)}
              disabled={isCreating}
              className="gap-2 text-white hover:opacity-90 self-start md:self-auto"
              style={{ backgroundColor: 'rgb(var(--color-primary))' }}
            >
              <Plus size={16} />
              New Announcement
            </Button>
          </div>
          <p className="text-zinc-600 dark:text-zinc-400 text-sm mt-2">
            Manage top cards displayed on the blog homepage
          </p>
        </div>

        {/* Create Form */}
        {isCreating && (
          <Card className="mb-8 border-t-4" style={{ borderTopColor: 'rgb(var(--color-primary))' }}>
            <CardHeader>
              <CardTitle>New Announcement</CardTitle>
            </CardHeader>
            <CardContent>
              <AnnouncementForm onCancel={() => setIsCreating(false)} />
            </CardContent>
          </Card>
        )}

        {/* Events Section */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <Calendar size={20} className="text-indigo-500" />
            <h2 className="text-xl font-semibold">Events Cards</h2>
          </div>
          {eventsCards.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {eventsCards.map((a: Announcement) => (
                <AnnouncementCard key={a.id} announcement={a} />
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-zinc-500 bg-zinc-50 dark:bg-zinc-900 rounded-lg border border-dashed">
              No events cards yet
            </div>
          )}
        </div>

        {/* News Section */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <Newspaper size={20} className="text-pink-500" />
            <h2 className="text-xl font-semibold">News Cards</h2>
          </div>
          {newsCards.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {newsCards.map((a: Announcement) => (
                <AnnouncementCard key={a.id} announcement={a} />
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-zinc-500 bg-zinc-50 dark:bg-zinc-900 rounded-lg border border-dashed">
              No news cards yet
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
