import { json, type ActionFunctionArgs, type LoaderFunctionArgs } from "@remix-run/node";
import { useLoaderData, useActionData, useFetcher, Link } from "@remix-run/react";
import { useState, useEffect } from "react";
import { LuSend as Send, LuClock as Clock, LuTrash2 as Trash2, LuCheck as Check, LuShield as Shield, LuRefreshCw as RefreshCw, LuCircleAlert as AlertCircle, LuExternalLink as ExternalLink } from "react-icons/lu";
import { requireAdmin } from "~/utils/admin-auth.server";
import { 
  getGuestbookFromRTDB, 
  deleteGuestbookFromRTDB, 
  approveGuestbookInRTDB,
  addGuestbookToRTDB,
  type GuestbookEntry 
} from "~/utils/firebase-rtdb.server";
import { getGuestbookEntries } from "~/Services/admin.prisma.server";
import { Button } from "~/components/ui/button";
import { toast } from "sonner";

export async function loader({ request }: LoaderFunctionArgs) {
  await requireAdmin(request);
  
  // Try fetching from Firebase Realtime Database first with 30-day auto retention
  let entries: GuestbookEntry[] = await getGuestbookFromRTDB();

  // If RTDB has no entries yet, fallback to Prisma DB entries
  if (entries.length === 0) {
    try {
      const dbEntries = await getGuestbookEntries(50);
      entries = dbEntries.map((e: any) => ({
        id: e.id,
        author: e.author,
        content: e.content,
        approved: e.approved,
        createdAt: e.createdAt,
        provider: "website",
      }));
    } catch {
      // ignore fallback error
    }
  }

  return json({ entries });
}

export async function action({ request }: ActionFunctionArgs) {
  await requireAdmin(request);
  const formData = await request.formData();
  const intent = formData.get("intent") as string;
  const id = formData.get("id") as string;

  try {
    if (intent === "delete" && id) {
      await deleteGuestbookFromRTDB(id);
      return json({ success: true, message: "Guestbook message deleted from Realtime Database" });
    }

    if (intent === "approve" && id) {
      await approveGuestbookInRTDB(id, true);
      return json({ success: true, message: "Guestbook entry approved" });
    }

    if (intent === "reply") {
      const author = "Yahya (Site Owner)";
      const message = formData.get("replyMessage") as string;
      if (!message?.trim()) {
        return json({ success: false, error: "Reply message cannot be empty" }, { status: 400 });
      }
      await addGuestbookToRTDB({
        author,
        content: message.trim(),
        approved: true,
        provider: "admin",
        createdAt: Date.now(),
      });
      return json({ success: true, message: "Admin reply posted to Guestbook!" });
    }

    return json({ success: false, error: "Invalid action" }, { status: 400 });
  } catch (error) {
    return json({ 
      success: false, 
      error: error instanceof Error ? error.message : "Action failed" 
    }, { status: 500 });
  }
}

export default function AdminGuestbook() {
  const { entries } = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  const fetcher = useFetcher();
  const [filter, setFilter] = useState<"all" | "pending" | "approved">("all");
  const [replyOpen, setReplyOpen] = useState(false);
  const [replyText, setReplyText] = useState("");

  useEffect(() => {
    if ((actionData as any)?.success && (actionData as any).message) {
      toast.success((actionData as any).message);
      setReplyText("");
      setReplyOpen(false);
    } else if ((actionData as any)?.error) {
      toast.error((actionData as any).error);
    }
  }, [actionData]);

  const filteredEntries = entries.filter((e) => {
    if (filter === "pending") return !e.approved;
    if (filter === "approved") return e.approved;
    return true;
  });

  const pendingCount = entries.filter((e) => !e.approved).length;

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
            <Shield className="text-indigo-600 dark:text-indigo-400" size={22} /> Guestbook Moderation
          </h1>
          <p className="text-xs text-zinc-500 mt-1">
            Realtime Database (RTDB) sync with 30-day retention auto-pruning.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => setReplyOpen(!replyOpen)}
            className="text-xs gap-1.5"
          >
            <Send size={13} /> Post Owner Note
          </Button>
          <Link to="/guestbook" target="_blank">
            <Button variant="secondary" size="sm" className="text-xs gap-1">
              <span>View Public</span>
              <ExternalLink size={12} />
            </Button>
          </Link>
        </div>
      </div>

      {/* 30-Day Retention Notice Card */}
      <div className="flex items-center justify-between p-3.5 rounded-xl border border-indigo-200/60 dark:border-indigo-900/40 bg-indigo-50/40 dark:bg-indigo-950/20 text-xs text-indigo-900 dark:text-indigo-300">
        <div className="flex items-center gap-2">
          <AlertCircle size={16} className="text-indigo-600 dark:text-indigo-400 shrink-0" />
          <span>
            <strong>30-Day Policy Active:</strong> All messages older than 30 days are automatically pruned from the Realtime Database to keep storage lightweight.
          </span>
        </div>
        <span className="font-mono text-[11px] bg-indigo-100 dark:bg-indigo-900/50 px-2 py-0.5 rounded text-indigo-700 dark:text-indigo-300">
          {entries.length} active
        </span>
      </div>

      {/* Admin Post Reply Box */}
      {replyOpen && (
        <fetcher.Form method="post" className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 space-y-3">
          <input type="hidden" name="intent" value="reply" />
          <h2 className="text-sm font-semibold text-zinc-900 dark:text-white">Post as Site Owner</h2>
          <textarea
            name="replyMessage"
            rows={3}
            value={replyText}
            onChange={(e) => setReplyText(e.target.value)}
            placeholder="Write a public announcement or welcome note to the guestbook..."
            className="w-full p-3 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-950 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <div className="flex justify-end gap-2">
            <Button type="button" variant="ghost" size="sm" onClick={() => setReplyOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" size="sm" disabled={!replyText.trim() || fetcher.state === "submitting"}>
              {fetcher.state === "submitting" ? "Posting..." : "Post to Guestbook"}
            </Button>
          </div>
        </fetcher.Form>
      )}

      {/* Moderation List */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-5 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 pb-3">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setFilter("all")}
              className={`text-xs px-3 py-1 rounded-full font-medium transition-colors ${
                filter === "all"
                  ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900"
                  : "bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400"
              }`}
            >
              All ({entries.length})
            </button>
            <button
              onClick={() => setFilter("approved")}
              className={`text-xs px-3 py-1 rounded-full font-medium transition-colors ${
                filter === "approved"
                  ? "bg-green-600 text-white"
                  : "bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400"
              }`}
            >
              Approved ({entries.filter((e) => e.approved).length})
            </button>
            <button
              onClick={() => setFilter("pending")}
              className={`text-xs px-3 py-1 rounded-full font-medium transition-colors ${
                filter === "pending"
                  ? "bg-amber-500 text-white"
                  : "bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400"
              }`}
            >
              Pending ({pendingCount})
            </button>
          </div>
        </div>

        <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
          {filteredEntries.length === 0 ? (
            <div className="py-12 text-center text-xs text-zinc-400">
              No guestbook messages in this view.
            </div>
          ) : (
            filteredEntries.map((entry) => (
              <div key={entry.id} className="py-4 first:pt-0 last:pb-0 flex items-start justify-between gap-4">
                <div className="space-y-1.5 flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    {entry.avatar ? (
                      <img src={entry.avatar} alt="" className="w-6 h-6 rounded-full object-cover shrink-0" />
                    ) : (
                      <div className="w-6 h-6 rounded-full bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 text-[10px] font-bold flex items-center justify-center shrink-0">
                        {entry.author.slice(0, 2).toUpperCase()}
                      </div>
                    )}
                    <span className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                      {entry.author}
                    </span>
                    {entry.provider && (
                      <span className="text-[10px] font-mono uppercase bg-zinc-100 dark:bg-zinc-800 text-zinc-500 px-1.5 py-0.2 rounded">
                        {entry.provider}
                      </span>
                    )}
                    <span className="text-[11px] text-zinc-400 font-mono">
                      {new Date(entry.createdAt).toLocaleDateString()}
                    </span>
                    {!entry.approved && (
                      <span className="text-[10px] bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 px-2 py-0.5 rounded-full font-medium">
                        Pending
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-zinc-700 dark:text-zinc-300 leading-relaxed whitespace-pre-wrap">
                    {entry.content}
                  </p>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  {!entry.approved && (
                    <fetcher.Form method="post" className="inline">
                      <input type="hidden" name="intent" value="approve" />
                      <input type="hidden" name="id" value={entry.id} />
                      <Button variant="outline" size="sm" className="h-7 text-xs text-green-600 gap-1 hover:bg-green-50 dark:hover:bg-green-950/20">
                        <Check size={12} /> Approve
                      </Button>
                    </fetcher.Form>
                  )}
                  <fetcher.Form 
                    method="post" 
                    className="inline"
                    onSubmit={(e) => !confirm("Delete this message permanently?") && e.preventDefault()}
                  >
                    <input type="hidden" name="intent" value="delete" />
                    <input type="hidden" name="id" value={entry.id} />
                    <Button variant="ghost" size="icon" className="h-7 w-7 text-zinc-400 hover:text-red-600">
                      <Trash2 size={13} />
                    </Button>
                  </fetcher.Form>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
