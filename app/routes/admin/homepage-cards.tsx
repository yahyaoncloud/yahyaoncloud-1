import { json, LoaderFunctionArgs, ActionFunctionArgs } from "@remix-run/node";
import { useLoaderData, useActionData, Form, useNavigation, useSubmit, useRouteError, isRouteErrorResponse } from "@remix-run/react";
import { getHomepageCards, updateHomepageCard, createHomepageCard, deleteHomepageCard } from "~/Services/post.prisma.server";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Textarea } from "~/components/ui/textarea";
import { Switch } from "~/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "~/components/ui/card";
import { LuLayers as Layers, LuSave as Save, LuPlus as Plus, LuExternalLink as ExternalLink, LuTrash2 as Trash2, LuPencil as Edit, LuEllipsisVertical as MoreVertical, LuLayoutGrid as LayoutGrid, LuTriangleAlert as AlertTriangle, LuRefreshCw as RefreshCw } from "react-icons/lu";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "~/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "~/components/ui/dropdown-menu";
import { requireAdmin } from "~/utils/admin-auth.server";

import { useState, useEffect } from "react";
import toast from "react-hot-toast";

export async function loader({ request }: LoaderFunctionArgs) {
  await requireAdmin(request);
  const cards = await getHomepageCards();
  return json({ cards });
}

export async function action({ request }: ActionFunctionArgs) {
  await requireAdmin(request);
  const formData = await request.formData();
  const intent = formData.get("intent");
  
  try {
    if (intent === "delete") {
        const id = formData.get("id") as string;
        await deleteHomepageCard(id);
        return json({ success: true, message: "Card deleted" });
    }

    if (intent === "create" || intent === "update") {
        const id = formData.get("id") as string;
        const title = formData.get("title") as string;
        const description = formData.get("description") as string;
        const linkUrl = formData.get("linkUrl") as string;
        const linkText = formData.get("linkText") as string;
        const backgroundUrl = formData.get("backgroundUrl") as string;
        const order = parseInt(formData.get("order") as string || "0");
        const isActive = formData.get("isActive") === "on";

        if (intent === "update" && id) {
            await updateHomepageCard(id, {
                title,
                description,
                linkUrl,
                linkText,
                backgroundUrl,
                isActive,
                order
            });
            return json({ success: true, message: "Card updated" });
        } else {
            await createHomepageCard({
                title: title || "New Card",
                description,
                linkUrl,
                linkText,
                backgroundUrl,
                order
            });
            return json({ success: true, message: "Card created" });
        }
    }
  } catch (error) {
      console.error("Homepage card error:", error);
      return json({ success: false, error: "Operation failed" }, { status: 500 });
  }

  return json({ success: false, error: "Invalid action" }, { status: 400 });
}

export default function AdminHomepageCards() {
  const { cards } = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  const navigation = useNavigation();
  const submit = useSubmit();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCard, setEditingCard] = useState<any>(null);

  useEffect(() => {
    if ((actionData as any)?.success) {
        toast.success((actionData as any).message);
        setIsModalOpen(false);
        setEditingCard(null);
    }
    if ((actionData as any)?.error) toast.error((actionData as any).error);
  }, [actionData]);

  const handleEdit = (card: any) => {
      setEditingCard(card);
      setIsModalOpen(true);
  };

  const handleAdd = () => {
      setEditingCard(null);
      setIsModalOpen(true);
  };

  const handleDelete = (id: string) => {
      if (confirm("Are you sure you want to delete this card?")) {
          const formData = new FormData();
          formData.append("intent", "delete");
          formData.append("id", id);
          submit(formData, { method: "post" });
      }
  };

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 p-6 md:p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="flex items-center justify-between">
            <div>
                <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-3">
                    <LayoutGrid className="text-indigo-600" /> Homepage Cards
                </h1>
                <p className="text-zinc-500 dark:text-zinc-400 mt-2">
                    Manage the promotional cards displayed on your homepage.
                </p>
            </div>
            <Button onClick={handleAdd} className="bg-indigo-600 hover:bg-indigo-700 text-white">
                <Plus size={18} className="mr-2" /> Add Card
            </Button>
        </div>

        {cards.length === 0 ? (
            <div className="text-center py-20 border-2 border-dashed border-zinc-200 dark:border-zinc-800 rounded-xl">
                <div className="bg-zinc-100 dark:bg-zinc-900 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Layers className="text-zinc-400" size={32} />
                </div>
                <h3 className="text-lg font-medium text-zinc-900 dark:text-zinc-100">No cards yet</h3>
                <p className="text-zinc-500 dark:text-zinc-400 max-w-sm mx-auto mt-2 mb-6">
                    Create cards to showcase your projects, products, or important links on the homepage.
                </p>
                <Button onClick={handleAdd} variant="outline">
                    Create your first card
                </Button>
            </div>
        ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {cards.map((card) => (
                    <Card key={card.id} className="overflow-hidden border-zinc-200 dark:border-zinc-800 flex flex-col h-full hover:shadow-md transition-shadow bg-white dark:bg-zinc-900">
                        {card.backgroundUrl && (
                            <div className="h-32 w-full bg-cover bg-center bg-no-repeat relative" style={{ backgroundImage: `url(${card.backgroundUrl})` }}>
                                <div className="absolute inset-0 bg-black/40" />
                                <div className="absolute top-2 right-2">
                                     <span className={`px-2 py-1 rounded-full text-xs font-medium ${card.isActive ? 'bg-green-500/20 text-green-200 border border-green-500/30' : 'bg-zinc-500/50 text-zinc-300'}`}>
                                        {card.isActive ? 'Active' : 'Inactive'}
                                     </span>
                                </div>
                            </div>
                        )}
                        {!card.backgroundUrl && (
                             <div className="h-32 w-full bg-zinc-100 dark:bg-zinc-950 flex items-center justify-center text-zinc-400 relative">
                                <Layers size={32} />
                                <div className="absolute top-2 right-2">
                                     <span className={`px-2 py-1 rounded-full text-xs font-medium ${card.isActive ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400'}`}>
                                        {card.isActive ? 'Active' : 'Inactive'}
                                     </span>
                                </div>
                             </div>
                        )}
                        
                        <CardHeader className="pb-2">
                            <CardTitle className="line-clamp-1">{card.title}</CardTitle>
                            <CardDescription className="line-clamp-2 min-h-[40px]">{card.description || "No description"}</CardDescription>
                        </CardHeader>
                        
                        <CardFooter className="pt-4 mt-auto border-t border-zinc-100 dark:border-zinc-800 flex justify-between items-center bg-zinc-50/50 dark:bg-zinc-900/50">
                            <div className="text-xs text-zinc-500 font-mono">
                                Order: {card.order}
                            </div>
                            <div className="flex gap-1">
                                <Button variant="ghost" size="icon" onClick={() => handleEdit(card)} className="h-8 w-8 text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100">
                                    <Edit size={16} />
                                </Button>
                                <Button variant="ghost" size="icon" onClick={() => handleDelete(card.id)} className="h-8 w-8 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20">
                                    <Trash2 size={16} />
                                </Button>
                            </div>
                        </CardFooter>
                    </Card>
                ))}
            </div>
        )}

        {/* Add/Edit Modal */}
        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
            <DialogContent className="sm:max-w-[500px] bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800">
                <DialogHeader>
                    <DialogTitle>{editingCard ? "Edit Card" : "Add New Card"}</DialogTitle>
                    <DialogDescription>
                        Configure the card details for the homepage display.
                    </DialogDescription>
                </DialogHeader>
                
                <Form method="post" onSubmit={() => {}} className="space-y-4">
                    <input type="hidden" name="intent" value={editingCard ? "update" : "create"} />
                    {editingCard && <input type="hidden" name="id" value={editingCard.id} />}

                    <div className="grid gap-4 py-4">
                        <div className="flex items-center space-x-2">
                            <Switch id="isActive" name="isActive" defaultChecked={editingCard?.isActive ?? true} />
                            <Label htmlFor="isActive">Active (Visible)</Label>
                        </div>
                        
                        <div className="space-y-2">
                            <Label htmlFor="title">Title</Label>
                            <Input id="title" name="title" defaultValue={editingCard?.title} placeholder="Card Title" required />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="description">Description</Label>
                            <Textarea id="description" name="description" defaultValue={editingCard?.description} placeholder="Short description..." />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                             <div className="space-y-2">
                                <Label htmlFor="linkUrl">Link URL</Label>
                                <Input id="linkUrl" name="linkUrl" defaultValue={editingCard?.linkUrl} placeholder="/projects" />
                            </div>
                             <div className="space-y-2">
                                <Label htmlFor="linkText">Link Text</Label>
                                <Input id="linkText" name="linkText" defaultValue={editingCard?.linkText} placeholder="Learn More" />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="backgroundUrl">Background Image URL</Label>
                            <Input id="backgroundUrl" name="backgroundUrl" defaultValue={editingCard?.backgroundUrl} placeholder="https://..." />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="order">Display Order</Label>
                            <Input id="order" name="order" type="number" defaultValue={editingCard?.order ?? 0} className="w-24" />
                        </div>
                    </div>

                    <DialogFooter>
                        <Button type="button" variant="ghost" onClick={() => setIsModalOpen(false)}>Cancel</Button>
                        <Button type="submit">{editingCard ? "Update Card" : "Create Card"}</Button>
                    </DialogFooter>
                </Form>
            </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}

export function ErrorBoundary() {
  const error = useRouteError();
  let message = "An unexpected error occurred while loading Homepage Cards.";
  if (isRouteErrorResponse(error)) {
    message = typeof error.data === "string" ? error.data : error.data?.message || `${error.status} ${error.statusText}`;
  } else if (error instanceof Error) {
    message = error.message;
  }

  return (
    <div className="p-6 md:p-8 max-w-4xl mx-auto">
      <div className="bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/50 rounded-2xl p-8 text-center space-y-4 shadow-sm">
        <div className="w-14 h-14 bg-red-100 dark:bg-red-900/40 text-red-600 dark:text-red-400 rounded-full flex items-center justify-center mx-auto">
          <AlertTriangle className="w-7 h-7" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">Homepage Cards Error</h2>
          <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-1 max-w-md mx-auto">{message}</p>
        </div>
        <Button
          variant="outline"
          onClick={() => window.location.reload()}
          className="inline-flex items-center gap-2 border-zinc-300 dark:border-zinc-700"
        >
          <RefreshCw className="w-4 h-4" />
          Reload Page
        </Button>
      </div>
    </div>
  );
}

