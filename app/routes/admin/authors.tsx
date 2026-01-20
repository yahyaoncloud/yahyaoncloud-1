import { json, LoaderFunctionArgs, ActionFunctionArgs } from "@remix-run/node";
import { useLoaderData, useActionData, Form, useNavigation, Link } from "@remix-run/react";
import { 
  getAllAuthors, 
  createAuthor, 
  deleteAuthor
} from "~/Services/author-management.server";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "~/components/ui/card";
import { AdminDataTable, type Column } from "~/components/AdminDataTable";
import { Plus, Trash2, Edit, Search } from "lucide-react";
import { useState, useEffect } from "react";
import { toast } from "sonner";

export async function loader({ request }: LoaderFunctionArgs) {
  const authors = await getAllAuthors();
  return json({ authors });
}

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();
  const intent = formData.get("intent") as string;

  try {
    if (intent === "create") {
      const username = formData.get("username") as string;
      const authorName = formData.get("authorName") as string;
      const email = formData.get("email") as string;
      const role = formData.get("role") as "author" | "superadmin";
      
      if (!email) {
        return json({ success: false, error: "Email is required", message: undefined, temporaryPassword: undefined }, { status: 400 });
      }

      const { temporaryPassword } = await createAuthor({
        username,
        authorName,
        email,
        role: role || "author"
      });
      
      return json({ 
        success: true, 
        message: `Author created. Temporary password: ${temporaryPassword}`,
        temporaryPassword,
        error: undefined
      });
    }

    if (intent === "delete") {
      const id = formData.get("id") as string;
      await deleteAuthor(id);
      return json({ success: true, message: "Author deleted", temporaryPassword: undefined, error: undefined });
    }

    return json({ success: false, error: "Unknown action", message: undefined, temporaryPassword: undefined }, { status: 400 });
  } catch (error) {
    console.error("Author action error:", error);
    return json({ 
      success: false, 
      error: error instanceof Error ? error.message : "An error occurred",
      message: undefined,
      temporaryPassword: undefined
    }, { status: 500 });
  }
}

interface ActionResponse {
  success: boolean;
  message?: string;
  error?: string;
  temporaryPassword?: string;
}

export default function AdminAuthors() {
  const { authors } = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>() as ActionResponse | undefined;
  const navigation = useNavigation();
  const [isCreating, setIsCreating] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    if (actionData?.success) {
      if (actionData.message) {
          toast.success(actionData.message, { duration: 5000 });
      }
      if (actionData.temporaryPassword) {
        // Show persistent toast with password
        toast.success(
            <div className="space-y-2">
                <p className="font-bold">Author Created Successfully!</p>
                <div className="bg-zinc-100 dark:bg-zinc-800 p-2 rounded text-xs font-mono break-all select-all">
                    User: {authors.find((a: any) => !a.id)?.username || 'New User'}<br/>
                    Pass: {actionData.temporaryPassword}
                </div>
                <p className="text-xs">Copy credentials now. The password will not be shown again.</p>
            </div>,
            { duration: Infinity, closeButton: true } // format: persistent
        );
      }
      setIsCreating(false);
    }
    if (actionData?.error) {
      toast.error(actionData.error);
    }
  }, [actionData, authors]);

  const filteredAuthors = authors.filter((author: any) => 
    author.authorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    author.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (author.email && author.email.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const columns: Column<any>[] = [
    {
        header: "Author",
        cell: (author) => (
            <div className="flex items-center gap-3">
                {author.avatar ? (
                <img 
                    src={author.avatar} 
                    alt={author.username} 
                    className="w-8 h-8 rounded-full object-cover"
                />
                ) : (
                <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-bold text-xs">
                    {author.authorName.substring(0, 2).toUpperCase()}
                </div>
                )}
                <div>
                <div className="font-semibold">{author.authorName}</div>
                <div className="text-xs text-zinc-500">@{author.username}</div>
                </div>
            </div>
        )
    },
    {
        header: "Role",
        cell: (author) => (
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                author.role === 'superadmin' 
                ? 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/20 dark:text-indigo-300'
                : 'bg-zinc-100 text-zinc-800 dark:bg-zinc-800 dark:text-zinc-300'
            }`}>
                {author.role}
            </span>
        )
    },
    { header: "Email", accessorKey: "email", cell: (a) => a.email || '-' },
    {
        header: "Status",
        cell: () => (
            <span className="inline-flex items-center gap-1.5">
                <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                </span>
                <span className="text-sm text-zinc-600 dark:text-zinc-400">Active</span>
            </span>
        )
    },
    {
        header: "Actions",
        className: "text-right",
        cell: (author) => (
            <div className="flex justify-end gap-2">
                <Link to={`/admin/authors/${author.id}`}>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-zinc-500 hover:text-indigo-600">
                    <Edit size={14} />
                </Button>
                </Link>
                <Form method="post" onSubmit={(e) => !confirm("Are you sure you want to delete this author?") && e.preventDefault()}>
                <input type="hidden" name="intent" value="delete" />
                <input type="hidden" name="id" value={author.id} />
                <Button variant="ghost" size="icon" className="h-8 w-8 text-zinc-500 hover:text-red-600">
                    <Trash2 size={14} />
                </Button>
                </Form>
            </div>
        )
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-100">Authors</h1>
          <p className="text-zinc-500 dark:text-zinc-400">Manage blog authors and administrators</p>
        </div>
        <Button 
          onClick={() => setIsCreating(true)} 
          disabled={isCreating}
          className="bg-indigo-600 hover:bg-indigo-700 text-white"
        >
          <Plus size={16} className="mr-2" /> Add Author
        </Button>
      </div>

      {isCreating && (
        <Card className="border-indigo-100 dark:border-indigo-900/20 shadow-md">
          <CardHeader>
            <CardTitle>Add New Author</CardTitle>
            <CardDescription>Create a new author account. A temporary password will be generated.</CardDescription>
          </CardHeader>
          <CardContent>
            <Form method="post" className="space-y-4">
              <input type="hidden" name="intent" value="create" />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="authorName">Full Name *</Label>
                  <Input id="authorName" name="authorName" required placeholder="e.g. John Doe" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="username">Username *</Label>
                  <Input id="username" name="username" required placeholder="jdoe" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email *</Label>
                  <Input id="email" name="email" type="email" required placeholder="john@example.com" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="role">Role</Label>
                  <select 
                    id="role" 
                    name="role" 
                    className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <option value="author">Author</option>
                    <option value="superadmin">Super Admin</option>
                  </select>
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-4">
                <Button type="button" variant="outline" onClick={() => setIsCreating(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={navigation.state === "submitting"}>
                  {navigation.state === "submitting" ? "Creating..." : "Create Author"}
                </Button>
              </div>
            </Form>
          </CardContent>
        </Card>
      )}

      <div className="flex items-center space-x-2 bg-white dark:bg-zinc-900 p-2 rounded-md border border-zinc-200 dark:border-zinc-800 w-full md:w-80">
        <Search size={18} className="text-zinc-400" />
        <input 
          type="text" 
          placeholder="Search authors..." 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="bg-transparent border-none focus:outline-none text-sm w-full"
        />
      </div>

      <AdminDataTable 
        columns={columns} 
        data={filteredAuthors} 
        className="bg-white dark:bg-zinc-900"
        emptyMessage="No authors found matching your search."
      />
    </div>
  );
}
