import { Outlet, useLoaderData, Link } from '@remix-run/react';
import { json, type LoaderFunctionArgs } from '@remix-run/node';
import { requireAuthor } from '~/utils/author-auth.server';
import { ThemeProvider } from '~/Contexts/ThemeContext';

import Navbar from "~/components/Navbar";

export async function loader({ request }: LoaderFunctionArgs) {
  const author = await requireAuthor(request);
  return json({ author });
}

export default function AuthorsLayout() {
  const { author } = useLoaderData<typeof loader>();
  
  const authorMenuItems = [
     { name: "My Profile", href: "/authors" }, 
     { name: "Change Password", href: "/authors/change-password" },
     { name: "Sign Out", href: "/authors/logout" },
  ];

  return (
    <ThemeProvider>
      <div className="flex flex-col min-h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100">
        <Navbar 
            showSidebarToggle={false} 
            menuItems={authorMenuItems} 
        />

        
        <div className="flex-1 w-full">
          <div className="max-w-7xl mx-auto px-4 md:px-6 py-8">
            <Outlet />
          </div>
        </div>
      </div>
    </ThemeProvider>
  );
}
