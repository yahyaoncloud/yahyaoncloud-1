import { parseMarkdownWithCloudinary } from "../utils/cloudinary.server";
import { Post as PostType } from "../Types/types"; // Import the type
import { Post } from "../models"; // Import the actual model (adjust path as needed)

export async function createPostFromMarkdown(slug: string) {
    const parsed = await parseMarkdownWithCloudinary(slug);

    return Post.create({
        slug: parsed.slug,
        title: parsed.frontmatter.title,
        content: parsed.content,
        categories: parsed.frontmatter.categories || [],
        tags: parsed.frontmatter.tags || [],
        status: parsed.frontmatter.status || "draft",
    });
}