// routes/admin.logout.tsx
import { LoaderFunction, ActionFunction, json } from "@remix-run/node";
import { destroyAdminSession } from "~/utils/session.server";
import { auth } from "~/utils/firebase.client";
import { signOut } from "firebase/auth";
import { useEffect } from "react";
import { useSubmit } from "@remix-run/react";

// Action only handles server-side session destruction
export const action: ActionFunction = async ({ request }) => {
    return destroyAdminSession(request);
};

// Loader should NOT destroy session immediately, allowing client-side cleanup first
export const loader: LoaderFunction = async () => {
    return json({});
};

export default function Logout() {
    const submit = useSubmit();

    useEffect(() => {
        const performLogout = async () => {
            try {
                // Clear client-side Firebase Auth
                if (auth) {
                    await signOut(auth);
                }
            } catch (error) {
                console.error("Firebase sign out error:", error);
            } finally {
                // Trigger server-side session destruction
                submit(null, { method: "post", replace: true });
            }
        };

        performLogout();
    }, [submit]);

    return (
        <div className="min-h-screen absolute top-0 left-0 w-full flex items-center justify-center bg-zinc-50 dark:bg-zinc-900 z-[99999]">
            <div className="text-center">
                <img
                    src="/assets/yoc-logo.png"
                    alt="YOC Logo"
                    className="w-20 h-20 mx-auto mb-4"
                />
                <p className="text-zinc-600 dark:text-zinc-300 animate-pulse">
                    Logging you out...
                </p>
            </div>
        </div>
    );
}

