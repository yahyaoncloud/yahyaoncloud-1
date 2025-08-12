import type { LoaderFunction } from "@remix-run/node";
import { redirect } from "@remix-run/node";
import { Outlet } from "@remix-run/react";
import { Home } from "../routes/_user"
export const loader: LoaderFunction = async () => {
  return redirect("/blog");
};

export default function Index() {
  // return (
  //   <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900">
  //     <h1 className="text-4xl font-bold text-gray-800 dark:text white mb-4">
  //       Welcome to Yahya On Cloud
  //     </h1>
  //     <p className="text-lg text-gray-600 dark:text-gray-300 mb-8">
  //       Explore the latest articles and insights.
  //     </p>
  //   </div>
    

  // );
  return <Outlet />
}
