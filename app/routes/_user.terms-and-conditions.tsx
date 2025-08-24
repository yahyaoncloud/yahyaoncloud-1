import { Link } from "@remix-run/react";
import { FaSquareXTwitter } from "react-icons/fa6";

export default function TermsPage() {
    return (
        <div className=" px-6 py-12 max-w-3xl mx-auto  text-zinc-900 dark:text-white">
            <div className="flex items-center mb-6">
                <FaSquareXTwitter className="w-6 h-6 mr-2" />
                <h1 className="text-3xl font-bold">Terms and Conditions</h1>
            </div>
            <p className="mb-4">
                By using our guestbook and logging in via X, you agree to the following:
            </p>
            <ul className="list-disc pl-6 mb-4 space-y-2">
                <li>Your email and X profile are used only to identify your guestbook entries.</li>
                <li>You are responsible for the content you post in the guestbook.</li>
                <li>We reserve the right to moderate or remove inappropriate content.</li>
            </ul>
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