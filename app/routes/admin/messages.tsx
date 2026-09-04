import { json, type LoaderFunctionArgs } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { LuMail as Mail, LuClock as Clock } from "react-icons/lu";
import { requireAdmin } from "~/utils/admin-auth.server";
import { getContactMessages } from "~/Services/content.server";

export async function loader({ request }: LoaderFunctionArgs) {
  await requireAdmin(request);
  const messages = await getContactMessages();
  return json({ messages });
}

export default function AdminMessages() {
  const { messages } = useLoaderData<typeof loader>();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">
          Inquiries & Contact Messages
        </h1>
        <p className="text-xs text-zinc-500">
          Messages submitted through the portfolio contact page.
        </p>
      </div>

      <div className="space-y-3">
        {messages.map((msg: any) => (
          <div
            key={msg.id}
            className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 space-y-2"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
              <div className="flex items-center gap-2">
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

            <p className="text-xs text-zinc-700 dark:text-zinc-300 whitespace-pre-wrap leading-relaxed">
              {msg.message}
            </p>

            <div className="pt-1">
              <a
                href={`mailto:${msg.email}?subject=Re: Inquiry from Yahya's Portfolio`}
                className="inline-flex items-center gap-1 text-xs text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:underline"
              >
                <Mail size={13} />
                <span>Reply via Email</span>
              </a>
            </div>
          </div>
        ))}

        {messages.length === 0 && (
          <div className="p-8 text-center text-xs text-zinc-400 border border-dashed border-zinc-200 dark:border-zinc-800 rounded-xl">
            No contact inquiries received yet.
          </div>
        )}
      </div>
    </div>
  );
}
