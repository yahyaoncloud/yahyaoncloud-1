import { json } from "@remix-run/node";
import type { LoaderFunction, ActionFunction } from "@remix-run/node";
import { cloudinary } from "../utils/cloudinary.server";

export const loader: LoaderFunction = async ({ request }) => {
  const url = new URL(request.url);
  const prefix = url.searchParams.get("prefix") || "";

  const resources = await cloudinary.api.resources({
    type: "upload",
    prefix,
    max_results: 100,
  });

  const folders = await cloudinary.api.sub_folders(prefix);

  return json({ assets: resources.resources, folders: folders.folders || [] });
};

export const action: ActionFunction = async ({ request }) => {
  const formData = await request.formData();
  const intent = formData.get("_action");

  if (intent === "upload") {
    const file = formData.get("file") as File;
    const folder = formData.get("folder")?.toString() || "";
    if (!file) return json({ error: "No file" }, { status: 400 });

    const buffer = Buffer.from(await file.arrayBuffer());
    const base64 = `data:${file.type};base64,${buffer.toString("base64")}`;
    const result = await cloudinary.uploader.upload(base64, { folder });
    return json({ asset: result });
  }

  if (intent === "delete") {
    const publicId = formData.get("public_id")?.toString() || "";
    await cloudinary.uploader.destroy(publicId);
    return json({ success: true });
  }

  if (intent === "bulk_delete") {
    const publicIds = JSON.parse(formData.get("public_ids")?.toString() || "[]") as string[];
    if (!publicIds.length) return json({ error: "No assets selected" }, { status: 400 });
    const results = await Promise.all(
      publicIds.map(id => cloudinary.uploader.destroy(id))
    );
    return json({ success: true, deleted: results });
  }

  if (intent === "rename") {
    const publicId = formData.get("public_id")?.toString() || "";
    const newName = formData.get("new_name")?.toString() || "";
    if (!publicId || !newName) return json({ error: "Invalid input" }, { status: 400 });
    const result = await cloudinary.uploader.rename(publicId, newName);
    return json({ asset: result });
  }

  return json({ error: "Unknown action" }, { status: 400 });
};