import { json, type LoaderFunctionArgs, type ActionFunctionArgs } from "@remix-run/node";
import { useLoaderData, useFetcher } from "@remix-run/react";
import { LuMail as Mail, LuClock as Clock, LuTrash2 as Trash2, LuCheck as Check, LuMailOpen as MailOpen, LuSend as Send } from "~/components/ui/icons";

import { requireAdmin } from "~/utils/admin-auth.server";
import { getContactMessages, deleteContactMessage, toggleContactMessageRead } from "~/Services/content.server";
import { Button } from "~/components/ui/button";
import { toast } from "sonner";
import { useEffect } from "react";

export async function loader({ request }: LoaderFunctionArgs) {
  await requireAdmin(request);
  const messages = await getContactMessages();
  return json({ messages });
}

export async function action({ request }: ActionFunctionArgs) {
  await requireAdmin(request);
  const formData = await request.formData();
  const intent = formData.get("intent") as string;
  const id = formData.get("id") as string;

  if (!id) {
    return json({ success: false, error: "Message ID is required" }, { status: 400 });
  }

  try {
    if (intent === "delete") {
      await deleteContactMessage(id);
      return json({ success: true, message: "Inquiry deleted successfully" });
    }

    if (intent === "toggle-read") {
      await toggleContactMessageRead(id);
      return json({ success: true, message: "Status updated" });
    }

    return json({ success: false, error: "Invalid intent" }, { status: 400 });
  } catch (err) {
    return json({ success: false, error: "Action failed" }, { status: 500 });
  }
}

export default function AdminMessages() {
  const { messages } = useLoaderData<typeof loader>();
  const fetcher = useFetcher();

  useEffect(() => {
    if ((fetcher.data as any)?.success && (fetcher.data as any).message) {
      toast.success((fetcher.data as any).message);
    } else if ((fetcher.data as any)?.error) {
      toast.error((fetcher.data as any).error);
    }
  }, [fetcher.data]);

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-10">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
            <Mail className="text-indigo-600 dark:text-indigo-400" size={24} />
            Inquiries & Contact Messages
          </h1>
          <p className="text-xs text-zinc-500 mt-1">
            Real-time inbox for messages submitted via the public /contact page.
          </p>
        </div>
        <div className="text-xs font-mono px-2.5 py-1 rounded-md bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400">
          {messages.length} message{messages.length === 1 ? "" : "s"}
        </div>
      </div>

      <div className="space-y-3">
        {messages.map((msg: any) => (
          <div
            key={msg.id}
            className={`p-4 rounded-xl border transition-all ${
              msg.read
                ? "border-zinc-200 dark:border-zinc-800 bg-white/60 dark:bg-zinc-900/60 opacity-80"
                : "border-indigo-200 dark:border-indigo-900/40 bg-white dark:bg-zinc-900 shadow-xs ring-1 ring-indigo-500/10"
            } space-y-3`}
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
              <div className="flex items-center gap-2">
                {!msg.read && (
                  <span className="w-2 h-2 rounded-full bg-indigo-600 dark:bg-indigo-400" title="Unread message" />
                )}
                <span className="font-semibold text-sm text-zinc-900 dark:text-zinc-100">
                  {msg.name}
                </span>
                <span className="text-xs text-zinc-400 font-mono">
                  &lt;{msg.email}&gt;
                </span>
              </div>
              <div className="flex items-center gap-1 text-[11px] text-zinc-400 font-mono">
                <Clock size={12} />
                <span>{new Date(msg.createdAt).toLocaleString()}</span>
              </div>
            </div>

            <p className="text-xs sm:text-sm text-zinc-700 dark:text-zinc-300 whitespace-pre-wrap leading-relaxed bg-zinc-50/50 dark:bg-zinc-950/30 p-3 rounded-lg border border-zinc-100 dark:border-zinc-800/60">
              {msg.message}
            </p>

            <div className="flex items-center justify-between pt-1">
              <div className="flex items-center gap-2">
                <a
                  href={`mailto:${msg.email}?subject=Re: Inquiry from Yahya's Portfolio`}
                  className="inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-md bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-100 transition-colors"
                >
                  <Mail size={13} />
                  <span>Reply via Email</span>
                </a>

                <fetcher.Form method="post">
                  <input type="hidden" name="intent" value="toggle-read" />
                  <input type="hidden" name="id" value={msg.id} />
                  <button
                    type="submit"
                    className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-md text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                  >
                    {msg.read ? <Mail size={13} /> : <MailOpen size={13} />}
                    <span>{msg.read ? "Mark Unread" : "Mark Read"}</span>
                  </button>
                </fetcher.Form>
              </div>

              <fetcher.Form
                method="post"
                onSubmit={(e) => {
                  if (!confirm("Are you sure you want to delete this message?")) {
                    e.preventDefault();
                  }
                }}
              >
                <input type="hidden" name="intent" value="delete" />
                <input type="hidden" name="id" value={msg.id} />
                <button
                  type="submit"
                  className="text-xs p-1.5 rounded-md text-zinc-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
                  title="Delete message"
                >
                  <Trash2 size={14} />
                </button>
              </fetcher.Form>
            </div>
          </div>
        ))}

        {messages.length === 0 && (
          <div className="p-12 text-center text-xs text-zinc-400 border border-dashed border-zinc-200 dark:border-zinc-800 rounded-xl space-y-1">
            <p className="font-medium">Inbox is clean!</p>
            <p className="text-zinc-500">No contact inquiries received yet.</p>
          </div>
        )}
      </div>
    </div>
  );
}
