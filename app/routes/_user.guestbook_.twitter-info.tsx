import { Link } from "@remix-run/react";
import { FaSquareXTwitter } from "react-icons/fa6"; // Assuming the XIcon component is saved in ~/components/XIcon.tsx

export default function XInfoPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 text-center bg-zinc-50 dark:bg-zinc-900 text-zinc-900 dark:text-white">
      <FaSquareXTwitter className="w-8 h-8 mb-4" />
      <h1 className="text-3xl font-bold mb-4">Why We Need Your Email</h1>
      <p className="text-base mb-6 max-w-xl">
        To enable you to leave messages in our guestbook via your X account, we request access to your email address. This email is used solely to identify you in the guestbook and will not be shared publicly or with third parties.
      </p>
      <p className="text-sm mb-4">
        By logging in with X, you agree to our{" "}
        <Link
          to="/terms-and-conditions"
          className="underline text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300"
        >
          Terms of Service
        </Link>{" "}
        and{" "}
        <Link
          to="/privacy-policy"
          className="underline text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300"
        >
          Privacy Policy
        </Link>.
      </p>
      <Link
        to="/guestbook"
        className="mt-4 inline-block px-6 py-2 bg-indigo-600 dark:bg-indigo-500 text-white rounded-md hover:bg-indigo-700 dark:hover:bg-indigo-600 transition-colors"
      >
        Back to Guestbook
      </Link>
    </div>
  );
}