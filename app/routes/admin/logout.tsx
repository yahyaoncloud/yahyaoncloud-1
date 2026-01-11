// routes/admin.logout.tsx
import { LoaderFunction, ActionFunction } from "@remix-run/node";
import { destroyAdminSession } from "~/utils/session.server";
import { auth } from "~/utils/firebase.client";
import { signOut } from "firebase/auth";
import { useEffect } from "react";
import { useFetcher } from "@remix-run/react";

// Logout handler (both action and loader trigger sign out + session destroy)
export const action: ActionFunction = async ({ request }) => {
    try {
        if (typeof window !== "undefined") {
            await signOut(auth);
        }
    } catch (error) {
        console.error("Firebase sign out error:", error);
    }
    return destroyAdminSession(request);
};

export const loader: LoaderFunction = async ({ request }) => {
    return destroyAdminSession(request);
};

export default function Logout() {
    const fetcher = useFetcher();

    // Trigger logout as soon as page loads
    useEffect(() => {
        fetcher.submit({ immediate: "true" }, { method: "post" });
    }, [fetcher]);

    return (
        <div className="min-h-screen absolute top-0 left-0 w-full flex items-center justify-center bg-zinc-50 dark:bg-zinc-900 z-[99999]">
            <div className="text-center">
                <img
                    src="/assets/yoc-logo.png"
                    alt="YOC Logo"
                    className="w-20 h-20 mx-auto mb-4"
                />
                <p className="text-zinc-600 dark:text-zinc-300">
                    Logging you out...
                </p>
            </div>
        </div>
    );
}

