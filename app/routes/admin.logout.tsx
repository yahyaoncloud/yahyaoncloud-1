// routes/admin.logout.tsx
import { LoaderFunction, ActionFunction, redirect } from "@remix-run/node";
import { destroyAdminSession } from "../utils/session.server";
import { auth } from "../utils/firebase.client";
import { signOut } from "firebase/auth";
import { useEffect, useState } from "react";
import { useFetcher } from "@remix-run/react";

// Handle form submissions (immediate logout)
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

// Handle direct visits (show countdown)
export const loader: LoaderFunction = async ({ request }) => {
    // Check if this is a form submission or direct visit
    const url = new URL(request.url);

    // If it's a form submission, logout immediately
    if (url.searchParams.get("immediate") === "true") {
        try {
            // Server-side cleanup if needed
        } catch (error) {
            console.error("Logout error:", error);
        }
        return destroyAdminSession(request);
    }

    // Otherwise, just render the countdown page
    return null;
};

export default function Logout() {
    const [seconds, setSeconds] = useState(3);
    const fetcher = useFetcher();

    useEffect(() => {
        const timer = setInterval(() => {
            setSeconds((prev) => {
                if (prev <= 1) {
                    clearInterval(timer);
                    // Submit form to trigger logout
                    fetcher.submit({ immediate: "true" }, { method: "post" });
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [fetcher]);

    // If the form submission completed, we'll be redirected automatically
    if (fetcher.state === "loading") {
        return (
            <div className="min-h-screen flex items-center justify-center  z-[99999] absolute top-0 left-0 w-full overflow-clip">
                <div className="text-center">
                    <h1 className="text-2xl font-bold mb-4">Completing logout...</h1>
                    <p>Please wait while we finalize your logout.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen absolute top-0 left-0 w-full overflow-clip flex items-center justify-center bg-zinc-50 dark:bg-zinc-900 p-4 z-[99999]">
            <div className="text-center p-8 bg-white dark:bg-zinc-800 rounded-lg shadow-lg max-w-md w-full">
                <div className="w-16 h-16 mx-auto mb-6 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center">
                    <svg
                        className="w-8 h-8 text-red-600 dark:text-red-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                        />
                    </svg>
                </div>

                <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 mb-2">
                    Logging you out...
                </h1>

                <p className="text-zinc-600 dark:text-zinc-400 mb-6">
                    You will be logged out in{" "}
                    <span className="font-mono font-bold text-red-600 dark:text-red-400">
                        {seconds}
                    </span>{" "}
                    second{seconds !== 1 ? "s" : ""}
                </p>

                <div className="space-y-3">
                    <fetcher.Form method="post">
                        <input type="hidden" name="immediate" value="true" />
                        <button
                            type="submit"
                            className="w-full py-2 px-4 bg-red-600 hover:bg-red-700 text-white rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 dark:focus:ring-offset-zinc-800"
                        >
                            Log Out Now
                        </button>
                    </fetcher.Form>

                    <p className="text-xs text-zinc-500 dark:text-zinc-500">
                        Your session will be securely terminated
                    </p>
                </div>
            </div>
        </div>
    );
}