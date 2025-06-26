import { useState } from "react";
import { useTheme } from "../Contexts/ThemeContext";
import { useLoaderData } from "@remix-run/react";
import type { LoaderFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { Heart, ExternalLink } from "lucide-react";
import ArticleCard from "../components/ArticleCard";
import { environment } from "~/environments/environment";
import type { Category, Post } from "../Types/types";
import dummyImage from "../assets/yahya_glass.png"; // Adjust the path as necessary

// Loader function to fetch all articles from /posts
export async function loader({ request }: LoaderFunctionArgs) {
  try {
    const [postsRes, categoriesRes] = await Promise.all([
      fetch(`${environment.GO_BACKEND_URL}/posts`),
      fetch(`${environment.GO_BACKEND_URL}/categories`), // assuming this endpoint exists
    ]);

    const posts = await postsRes.json();
    console.log("Posts received:", posts);

    const categories = await categoriesRes.json();

    return json({ posts, categories });
  } catch (error) {
    console.error("Loader error:", error);
    return json({ posts: [], categories: [] }, { status: 500 });
  }
}

const CategoryStrip = ({ categories }: { categories: Category[] }) => {
  const { theme } = useTheme();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  return (
    <div
      className={`backdrop-blur-sm border-y py-4 mb-12 ${
        theme === "dark"
          ? "bg-gray-900/50 border-gray-700"
          : "bg-white/50 border-gray-200"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-start gap-4">
          {/* Fixed Explore label */}
          <span
            className={`text-sm font-medium whitespace-nowrap mt-2 ${
              theme === "dark" ? "text-gray-400" : "text-gray-600"
            }`}
          >
            Explore:
          </span>

          {/* Scrollable category grid */}
          <div
            className={`
              overflow-x-auto scrollbar-thin scrollbar-track-transparent scrollbar-thumb-gray-400
              max-w-full
            `}
          >
            <div
              className={`
                grid grid-flow-col auto-cols-max gap-2
                grid-rows-2
                pr-4
              `}
            >
              {categories.map((category) => (
                <button
                  key={category.id || category.catID || category.slug}
                  onClick={() =>
                    setSelectedCategory(
                      category.name === selectedCategory ? null : category.name
                    )
                  }
                  className={`
                    px-4 py-2 rounded-full text-sm font-medium
                    whitespace-nowrap border transition-all duration-200
                    ${
                      selectedCategory === category.name
                        ? "bg-blue-600 text-white border-blue-500 shadow-lg"
                        : theme === "dark"
                        ? "bg-gray-800/70 text-gray-300 border-gray-700 hover:bg-gray-700 hover:text-white hover:border-blue-500"
                        : "bg-gray-100/70 text-gray-700 border-gray-200 hover:bg-gray-200 hover:text-gray-900 hover:border-blue-400"
                    }
                  `}
                >
                  {category.name}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default function Homepage() {
  const { theme } = useTheme();
  const { posts, categories } = useLoaderData<typeof loader>();

  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const filteredPosts = selectedCategory
    ? posts.filter((p) => {
        const cat = categories.find((c) => c.id === p.categoryId);
        return cat?.name === selectedCategory;
      })
    : posts;

  const textColor = theme === "dark" ? "text-gray-100" : "text-gray-900";
  const borderColor = theme === "dark" ? "border-gray-700" : "border-gray-200";
  const bgGradient =
    theme === "dark"
      ? "bg-gradient-to-r from-blue-500 to-blue-300"
      : "bg-gradient-to-r from-blue-600 to-blue-400";

  return (
    <>
      <div
        className={`min-h-screen ${
          theme === "dark" ? "bg-gray-900" : "bg-gray-50"
        }`}
      >
        {/* CATEGORY FILTER */}
        <div className={`backdrop-blur-sm border-y py-4 mb-12 ${borderColor}`}>
          <div className="max-w-7xl mx-auto px-4 flex items-start gap-4">
            <span
              className={`text-sm font-medium mt-2 ${
                theme === "dark" ? "text-gray-400" : "text-gray-600"
              }`}
            >
              Explore:
            </span>
            <div className="overflow-x-auto max-w-full scrollbar-thin scrollbar-thumb-gray-400">
              <div className="grid grid-flow-col auto-cols-max gap-2 pr-4 grid-rows-2">
                {categories.map((category) => {
                  const isSelected = selectedCategory === category.name;
                  return (
                    <button
                      key={category.id}
                      onClick={() =>
                        setSelectedCategory(isSelected ? null : category.name)
                      }
                      className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap border transition-all duration-200
                        ${
                          isSelected
                            ? "bg-blue-600 text-white border-blue-500 shadow-lg"
                            : theme === "dark"
                            ? "bg-gray-800/70 text-gray-300 border-gray-700 hover:bg-gray-700 hover:border-blue-500"
                            : "bg-gray-100/70 text-gray-700 border-gray-200 hover:bg-gray-200 hover:border-blue-400"
                        }`}
                    >
                      {category.name}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* POSTS */}
        <div className="max-w-7xl mx-auto px-4 py-8">
          {filteredPosts.length > 0 ? (
            <section>
              <div className="flex items-center mb-8">
                <h2 className={`text-3xl font-bold ${textColor}`}>
                  {selectedCategory ? selectedCategory : "Latest Articles"}
                </h2>
                <div className={`ml-4 w-12 h-1 rounded-full ${bgGradient}`} />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 auto-rows-min">
                {filteredPosts.map((article: Post) => (
                  <ArticleCard
                    key={article.id}
                    post={{
                      _id: article.id,
                      title: article.title,
                      slug: article.slug ?? article.id,
                      summary: article.summary,
                      excerpt: article.summary, // use excerpt if available in the future
                      coverImage: article.coverImage?.url || dummyImage,
                      createdAt: article.createdAt,
                      category:
                        categories.find((c) => c.id === article.catID)?.name ||
                        "Uncategorized",
                      tags: article.tags?.map((tagObj) =>
                        typeof tagObj === "string" ? tagObj : tagObj.name
                      ),
                    }}
                  />
                ))}
              </div>
            </section>
          ) : (
            <p
              className={`text-center text-lg ${
                theme === "dark" ? "text-gray-400" : "text-gray-600"
              }`}
            >
              No articles found.
            </p>
          )}
        </div>

        {/* GRID BACKDROP */}
        <div className="fixed inset-0 pointer-events-none opacity-5">
          <div
            className="absolute top-0 left-0 w-full h-full"
            style={{
              backgroundImage: `radial-gradient(circle at 1px 1px, ${
                theme === "dark" ? "rgb(96 165 250)" : "rgb(59 130 246)"
              } 1px, transparent 0)`,
              backgroundSize: "50px 50px",
            }}
          />
        </div>
      </div>

      {/* PALESTINE SUPPORT */}
      <div
        className={`max-w-4xl m-10 mx-auto rounded-2xl p-6 mb-8 border ${
          theme === "dark"
            ? "bg-gradient-to-r from-green-900/10 to-red-900/10 border-green-800"
            : "bg-gradient-to-r from-green-50 to-red-50 border-green-200"
        }`}
      >
        <div className="flex items-center mb-4">
          <div className="w-6 h-6 rounded mr-3 bg-gradient-to-b from-green-500 to-red-500" />
          <h3 className={`font-semibold flex items-center ${textColor}`}>
            <Heart size={18} className="text-red-500 mr-2" />
            Support Palestine
          </h3>
        </div>
        <p
          className={`text-sm ${
            theme === "dark" ? "text-gray-400" : "text-gray-600"
          }`}
        >
          Stand with Palestine. Every contribution helps provide humanitarian
          aid and support to those in need.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-4">
          {[
            {
              name: "UNRWA",
              href: "https://www.unrwa.org/donate",
              description: "UN Relief for Palestine Refugees",
            },
            {
              name: "Medical Aid",
              href: "https://www.map.org.uk/donate",
              description: "Medical Aid for Palestinians",
            },
            {
              name: "Gaza Relief",
              href: "https://www.pcrf.net/",
              description: "Palestine Children's Relief Fund",
            },
          ].map((link) => (
            <a
              key={link.name}
              href={link.href}
              target="_blank"
              rel="noopener noreferrer"
              className={`group p-3 rounded-lg border transition-all duration-200 hover:shadow-md ${
                theme === "dark"
                  ? "bg-gray-800 border-gray-700 hover:border-green-500"
                  : "bg-white border-gray-200 hover:border-green-400"
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className={`font-medium text-sm ${textColor}`}>
                  {link.name}
                </span>
                <ExternalLink
                  size={14}
                  className={`${
                    theme === "dark" ? "text-gray-400" : "text-gray-500"
                  } group-hover:text-green-500 transition-colors duration-200`}
                />
              </div>
              <p
                className={`text-xs ${
                  theme === "dark" ? "text-gray-400" : "text-gray-600"
                }`}
              >
                {link.description}
              </p>
            </a>
          ))}
        </div>
      </div>
    </>
  );
}
