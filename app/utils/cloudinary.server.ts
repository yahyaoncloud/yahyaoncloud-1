import { v2 as cloudinary } from "cloudinary";
import fs from "fs";
import path from "path";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function uploadStampToCloudinary(filePath: string, clientName: string, serial: string) {
  if (!fs.existsSync(filePath)) throw new Error("File not found: " + filePath);

  const safeName = clientName.replace(/\s+/g, "_").replace(/[^a-zA-Z0-9-_]/g, "");
  const fileName = `${safeName}_${serial}_stamp.svg`;

  try {
    const result = await cloudinary.uploader.upload(filePath, {
      folder: "",
      public_id: path.parse(fileName).name,
      resource_type: "auto",
      overwrite: true,
    });


    return {
      url: result.secure_url,
      publicId: result.public_id,
    };
  } catch (err) {
    console.error("Cloudinary upload failed:", err);
    throw err;
  }
}

export async function uploadImage(file: File, path: string) {
  const buffer = await file.arrayBuffer();
  const base64 = Buffer.from(buffer).toString("base64");
  const ext = file.name.split(".").pop();
  const publicId = path.replace(/\.(png|jpg|jpeg|gif)$/, ""); // remove extension

  const result = await cloudinary.uploader.upload(`data:image/${ext};base64,${base64}`, {
    folder: "posts",
    public_id: publicId,
    overwrite: true,
  });

  return {
    url: result.secure_url,
    publicId: result.public_id,
  };
}

export async function getImageOfPosts(file: File, path: string) {
  const buffer = await file.arrayBuffer();
  const base64 = Buffer.from(buffer).toString("base64");
  const ext = file.name.split(".").pop();
  const publicId = path.replace(/\.(png|jpg|jpeg|gif)$/, ""); // remove extension

  const result = await cloudinary.uploader.upload(`data:image/${ext};base64,${base64}`, {
    folder: "posts",
    public_id: publicId,
    overwrite: true,
  });

  return {
    url: result.secure_url,
    publicId: result.public_id,
  };
}


export { cloudinary };


