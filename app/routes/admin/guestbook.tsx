import { json, ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { useLoaderData, useActionData, useFetcher } from "@remix-run/react";
import { useState, useEffect } from "react";
import { Send, Heart, Clock, Trash2, Check } from "lucide-react";
import { FaGithub, FaGoogle, FaTwitter } from "react-icons/fa";
import { getGuestbookEntries, createGuestbookEntry, deleteGuestbookEntry, approveGuestbookEntry } from "~/Services/admin.prisma.server";
import { useToast } from "~/hooks/use-toast";

export async function loader({ request }: LoaderFunctionArgs) {
  try {
    const entries = await getGuestbookEntries(100);
    return json({ entries, isAdmin: true }); // In real app, check admin session
  } catch (error) {
    console.error("Guestbook loader error:", error);
    return json({ entries: [], isAdmin: false, error: "Failed to load entries" }, { status: 500 });
  }
}

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();
  const intent = formData.get("intent");

  try {
    if (intent === "create") {
      const author = formData.get("author") as string;
      const content = formData.get("content") as string;
      
      if (!author?.trim() || author.trim().length < 2) {
        return json({ success: false, error: "Name must have at least 2 characters" }, { status: 400 });
      }
      if (!content?.trim() || content.trim().length < 5) {
        return json({ success: false, error: "Message must have at least 5 characters" }, { status: 400 });
      }
      
      await createGuestbookEntry({ author: author.trim(), content: content.trim() });
      return json({ success: true, message: "Message added successfully! It will appear after approval." });
    }
    
    if (intent === "delete") {
      const id = formData.get("id") as string;
      await deleteGuestbookEntry(id);
      return json({ success: true, message: "Entry deleted" });
    }
    
    if (intent === "approve") {
      const id = formData.get("id") as string;
      await approveGuestbookEntry(id);
      return json({ success: true, message: "Entry approved" });
    }
    
    return json({ success: false, error: "Invalid action" }, { status: 400 });
  } catch (error) {
    return json({ 
      success: false, 
      error: error instanceof Error ? error.message : "Action failed" 
    }, { status: 400 });
  }
}

export default function AdminGuestbook() {
  const { entries, isAdmin } = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>() as { success?: boolean; message?: string; error?: string } | undefined;
  const { toast } = useToast();
  const fetcher = useFetcher();
  
  const [formData, setFormData] = useState({ name: "", message: "" });
  const [filter, setFilter] = useState<"all" | "pending" | "approved">("all");

  useEffect(() => {
    if (actionData?.success && actionData?.message) {
      toast({ title: "Success", description: actionData.message });
      setFormData({ name: "", message: "" });
    } else if (actionData?.error) {
      toast({ title: "Error", description: actionData.error, variant: "destructive" });
    }
  }, [actionData, toast]);

  const formatTime = (dateStr: string) => {
    const d = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    if (diffMs < 60000) return "now";
    if (diffMs < 3600000) return `${Math.floor(diffMs / 60000)}m`;
    if (diffMs < 86400000) return `${Math.floor(diffMs / 3600000)}h`;
    return `${Math.floor(diffMs / 86400000)}d`;
  };

  const filteredEntries = entries.filter((entry: { approved: boolean }) => {
    if (filter === "pending") return !entry.approved;
    if (filter === "approved") return entry.approved;
    return true;
  });

  const pendingCount = entries.filter((e: { approved: boolean }) => !e.approved).length;

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
      {/* Header */}
      <div className="px-6 py-8">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-5xl mt-8 lg:text-6xl font-bold bg-gradient-to-r from-zinc-900 via-indigo-800 to-indigo-800 dark:from-white dark:via-indigo-200 dark:to-indigo-200 bg-clip-text text-transparent mb-6">
            Guestbook
          </h1>
          <p className="text-zinc-600 dark:text-zinc-400 mt-2">
            {entries.length} messages â€¢ {pendingCount} pending approval
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 h-full">
          {/* Left Side - Message Form */}
          <div className="space-y-6 border border-zinc-500 dark:border-zinc-700 rounded-md p-10 bg-zinc-50 dark:bg-zinc-900/70">
            <h2 className="text-xl font-medium text-zinc-900 dark:text-white">
              Leave a message
            </h2>

            <fetcher.Form method="post" className="space-y-4">
              <input type="hidden" name="intent" value="create" />
              <div>
                <input
                  name="author"
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Your name"
                  className="w-full px-4 py-3 border border-zinc-200 dark:border-zinc-700 rounded-md bg-zinc-100 dark:bg-zinc-950/70 text-zinc-900 dark:text-white placeholder:text-zinc-500 focus:border-zinc-400 dark:focus:border-zinc-500 focus:outline-none transition-colors"
                />
              </div>

              <div>
                <textarea
                  name="content"
                  rows={6}
                  value={formData.message}
                  onChange={(e) => setFormData(prev => ({ ...prev, message: e.target.value }))}
                  placeholder="Write your message here..."
                  className="w-full px-4 py-3 border border-zinc-200 dark:border-zinc-700 rounded-md bg-zinc-100 dark:bg-zinc-950/70 text-zinc-900 dark:text-white placeholder:text-zinc-500 focus:border-zinc-400 dark:focus:border-zinc-500 focus:outline-none resize-none transition-colors"
                />
              </div>

              <button
                type="submit"
                disabled={!formData.name || !formData.message || fetcher.state === "submitting"}
                className={`w-full py-3 px-4 rounded-md font-medium transition-colors flex items-center justify-center gap-2 ${
                  !formData.name || !formData.message || fetcher.state === "submitting"
                    ? "bg-zinc-100 dark:bg-zinc-900 text-zinc-400 dark:text-zinc-500 cursor-not-allowed"
                    : "bg-zinc-900 dark:bg-zinc-50 text-white dark:text-zinc-900 hover:bg-zinc-800 dark:hover:bg-zinc-100"
                }`}
              >
                {fetcher.state === "submitting" ? (
                  <>
                    <div className="w-4 h-4 border-2 border-zinc-400 border-t-transparent rounded-full animate-spin"></div>
                    Submitting...
                  </>
                ) : (
                  <>
                    <Send size={16} />
                    Submit Message
                  </>
                )}
              </button>
            </fetcher.Form>
          </div>

          {/* Right Side - Messages List */}
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-medium text-zinc-900 dark:text-white">
                Messages
              </h2>
              {isAdmin && (
                <div className="flex gap-2">
                  <button
                    onClick={() => setFilter("all")}
                    className={`text-xs px-3 py-1 rounded-full ${filter === "all" ? "bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900" : "bg-zinc-200 dark:bg-zinc-700 text-zinc-700 dark:text-zinc-300"}`}
                  >
                    All ({entries.length})
                  </button>
                  <button
                    onClick={() => setFilter("pending")}
                    className={`text-xs px-3 py-1 rounded-full ${filter === "pending" ? "bg-yellow-500 text-white" : "bg-zinc-200 dark:bg-zinc-700 text-zinc-700 dark:text-zinc-300"}`}
                  >
                    Pending ({pendingCount})
                  </button>
                  <button
                    onClick={() => setFilter("approved")}
                    className={`text-xs px-3 py-1 rounded-full ${filter === "approved" ? "bg-green-500 text-white" : "bg-zinc-200 dark:bg-zinc-700 text-zinc-700 dark:text-zinc-300"}`}
                  >
                    Approved
                  </button>
                </div>
              )}
            </div>

            <div className="space-y-6 max-h-[600px] overflow-y-auto">
              {filteredEntries.length === 0 ? (
                <div className="text-center py-12 text-zinc-500">
                  No messages yet. Be the first to leave one!
                </div>
              ) : (
                filteredEntries.map((entry: { id: string; author: string; content: string; approved: boolean; createdAt: string }) => (
                  <div
                    key={entry.id}
                    className={`border-b border-zinc-100 dark:border-zinc-800 pb-6 last:border-0 ${!entry.approved ? "opacity-70" : ""}`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-full bg-zinc-900 dark:bg-zinc-100 flex items-center justify-center text-white dark:text-zinc-900 text-xs font-medium flex-shrink-0">
                        {entry.author.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="font-medium text-zinc-900 dark:text-white text-sm">
                            {entry.author}
                          </span>
                          <div className="flex items-center gap-1 text-xs text-zinc-500 dark:text-zinc-400">
                            <Clock size={10} />
                            {formatTime(entry.createdAt)}
                          </div>
                          {!entry.approved && (
                            <span className="text-xs px-2 py-0.5 bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200 rounded-full">
                              Pending
                            </span>
                          )}
                        </div>
                        <p className="text-zinc-700 dark:text-zinc-300 text-sm leading-relaxed mb-3">
                          {entry.content}
                        </p>
                        {isAdmin && (
                          <div className="flex items-center gap-2">
                            {!entry.approved && (
                              <fetcher.Form method="post" className="inline">
                                <input type="hidden" name="intent" value="approve" />
                                <input type="hidden" name="id" value={entry.id} />
                                <button
                                  type="submit"
                                  className="flex items-center gap-1 text-xs text-green-600 hover:text-green-700 transition-colors"
                                >
                                  <Check size={12} /> Approve
                                </button>
                              </fetcher.Form>
                            )}
                            <fetcher.Form method="post" className="inline">
                              <input type="hidden" name="intent" value="delete" />
                              <input type="hidden" name="id" value={entry.id} />
                              <button
                                type="submit"
                                className="flex items-center gap-1 text-xs text-red-500 hover:text-red-600 transition-colors"
                              >
                                <Trash2 size={12} /> Delete
                              </button>
                            </fetcher.Form>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

