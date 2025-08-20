// import { useEffect, useState } from "react";
// import { Form, useLoaderData, useNavigate } from "@remix-run/react";
// import type { LoaderFunction, ActionFunction } from "@remix-run/node";
// import { json, redirect } from "@remix-run/node";
// import { getCategories, updateCategory, getCategoryById } from "~/models/category.server";
// import { requireAdmin } from "~/utils/session.server";

// // Loader to fetch categories and optionally a category to edit
// export const loader: LoaderFunction = async ({ request, params }) => {
//     await requireAdmin(request);
//     const url = new URL(request.url);
//     const editId = url.searchParams.get("edit");
//     const categories = await getCategories();
//     let categoryToEdit = null;
//     if (editId) {
//         categoryToEdit = await getCategoryById(editId);
//     }
//     return json({ categories, categoryToEdit });
// };

// // Action to handle category update
// export const action: ActionFunction = async ({ request }) => {
//     await requireAdmin(request);
//     const formData = await request.formData();
//     const id = formData.get("id") as string;
//     const name = formData.get("name") as string;
//     if (id && name) {
//         await updateCategory(id, { name });
//         return redirect("/admin/categories");
//     }
//     return json({ error: "Invalid data" }, { status: 400 });
// };

// export default function AdminCategoriesPage() {
//     const { categories, categoryToEdit } = useLoaderData<typeof loader>();
//     const navigate = useNavigate();
//     const [editName, setEditName] = useState(categoryToEdit?.name || "");

//     useEffect(() => {
//         setEditName(categoryToEdit?.name || "");
//     }, [categoryToEdit]);

//     return (
//         <div className="container mx-auto px-4 py-8">
//             <h1 className="text-3xl font-bold mb-6 text-primary">Edit Blog Categories</h1>
//             <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
//                 <div>
//                     <h2 className="text-xl font-semibold mb-4 text-secondary">Categories</h2>
//                     <ul className="bg-base-200 rounded-md shadow divide-y divide-base-300">
//                         {categories.map((cat: any) => (
//                             <li key={cat.id} className="flex items-center justify-between px-4 py-3">
//                                 <span>{cat.name}</span>
//                                 <button
//                                     className="btn btn-sm btn-outline btn-primary"
//                                     onClick={() => navigate(`?edit=${cat.id}`)}
//                                 >
//                                     Edit
//                                 </button>
//                             </li>
//                         ))}
//                     </ul>
//                 </div>
//                 <div>
//                     {categoryToEdit ? (
//                         <Form method="post" className="bg-base-200 p-6 rounded-md shadow space-y-4">
//                             <input type="hidden" name="id" value={categoryToEdit.id} />
//                             <div>
//                                 <label className="block text-sm font-medium text-secondary mb-1">Category Name</label>
//                                 <input
//                                     type="text"
//                                     name="name"
//                                     value={editName}
//                                     onChange={e => setEditName(e.target.value)}
//                                     className="input input-bordered w-full"
//                                     required
//                                 />
//                             </div>
//                             <div className="flex gap-2">
//                                 <button type="submit" className="btn btn-primary">Save</button>
//                                 <button
//                                     type="button"
//                                     className="btn btn-ghost"
//                                     onClick={() => navigate("/admin/categories")}
//                                 >
//                                     Cancel
//                                 </button>
//                             </div>
//                         </Form>
//                     ) : (
//                         <div className="text-base-content text-center py-12">
//                             <span>Select a category to edit</span>
//                         </div>
//                     )}
//                 </div>
//             </div>
//         </div>
//     );
// }
