import { Outlet, useLoaderData } from '@remix-run/react';
import { json, type LoaderFunctionArgs } from '@remix-run/node';
import { requireAuthor } from '~/utils/author-auth.server';
import AuthorSidebar from '~/components/AuthorSidebar';
import Navbar from '~/components/Navbar';
import { useUIStore } from '~/store/uiStore';

export async function loader({ request }: LoaderFunctionArgs) {
  const author = await requireAuthor(request);
  return json({ author });
}

export default function AuthorsLayout() {
  const { author } = useLoaderData<typeof loader>();
  const { isSidebarOpen, closeSidebar } = useUIStore();

  const authorMenuItems = [
    { name: 'Dashboard', href: '/authors/dashboard' },
    { name: 'Change Password', href: '/authors/change-password' },
    { name: 'Sign Out', href: '/authors/logout' },
  ];

  return (
    <div className="min-h-screen bg-white dark:bg-zinc-950">
      <AuthorSidebar 
        isOpen={isSidebarOpen} 
        onClose={closeSidebar} 
        authorName={author.username}
      />
      
      <div className={`transition-all duration-300 ease-in-out ${isSidebarOpen ? 'md:ml-64' : 'ml-0'}`}>
        <Navbar menuItems={authorMenuItems} />
        
        <main className="min-h-[calc(100vh-64px)] p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

