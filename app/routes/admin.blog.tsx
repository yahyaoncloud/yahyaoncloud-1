import { Link } from "@remix-run/react";

const posts = [
  { id: 1, title: "First Blog Post", summary: "This is the first post." },
  { id: 2, title: "Second Blog Post", summary: "Another interesting post." },
];

export default function AdminBlog() {
  return (
    <main style={{ padding: "2rem" }}>
      <h1>Admin Blog</h1>
      <Link
        to="/admin/blog/new"
        style={{ marginBottom: "1rem", display: "inline-block" }}
      >
        Create New Post
      </Link>
      <ul>
        {posts.map((post) => (
          <li key={post.id} style={{ marginBottom: "1rem" }}>
            <h2>{post.title}</h2>
            <p>{post.summary}</p>
            <Link to={`/admin/blog/${post.id}/edit`}>Edit</Link>
          </li>
        ))}
      </ul>
    </main>
  );
}
