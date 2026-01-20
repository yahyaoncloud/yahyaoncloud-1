import { Link } from "@remix-run/react";
import { FaSquareXTwitter } from "react-icons/fa6";

export default function PrivacyPolicyPage() {
    return (
        <div className=" px-6 py-12 max-w-3xl mx-auto  text-zinc-900 dark:text-white">
            <div className="flex items-center mb-6">
                <FaSquareXTwitter className="w-6 h-6 mr-2" />
                <h1 className="text-3xl font-bold">Privacy Policy</h1>
            </div>
            <p className="mb-4">
                We value your privacy. When you log in via X to post in our guestbook, we collect only your email and basic profile information necessary for identification. This data is not shared with third parties or used for any other purpose.
            </p>
            <p className="mb-4">
                For more details on how we collect, store, and protect your information, please contact us directly.
            </p>
            <p className="text-sm mt-6">
                <Link
                    to="/"
                    className="underline text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300"
                >
                    Back to Home
                </Link>
            </p>
        </div>
    );
}