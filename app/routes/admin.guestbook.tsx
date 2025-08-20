import { useState } from "react";
import { Send, Heart, Star, Clock } from "lucide-react";
import { FaGithub, FaGoogle, FaTwitter } from "react-icons/fa";

export default function MinimalistGuestbook() {
  const [formData, setFormData] = useState({
    name: "",
    message: "",
  });
  const [status, setStatus] = useState({ type: "", message: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Dummy comments
  const dummyComments = [
    {
      id: "1",
      author: { name: "Sarah Chen", avatar: "SC" },
      content:
        "Your tutorials completely changed my approach to React! Thank you for sharing your knowledge.",
      createdAt: "2025-06-28T14:30:00Z",
      reactions: { hearts: 12, stars: 8 },
    },
    {
      id: "2",
      author: { name: "Alex Rodriguez", avatar: "AR" },
      content:
        "Just landed my dream job thanks to your JavaScript guide series. Your content is pure gold!",
      createdAt: "2025-06-27T09:15:00Z",
      reactions: { hearts: 24, stars: 15 },
    },
    {
      id: "3",
      author: { name: "Maya Patel", avatar: "MP" },
      content:
        "Been following your blog for 2 years now. Every post is a masterpiece! Your coding style is so clean.",
      createdAt: "2025-06-26T16:45:00Z",
      reactions: { hearts: 18, stars: 11 },
    },
    {
      id: "4",
      author: { name: "David Kim", avatar: "DK" },
      content:
        "The Three.js tutorial series blew my mind! Never thought I could create 3D experiences on the web.",
      createdAt: "2025-06-25T11:20:00Z",
      reactions: { hearts: 31, stars: 22 },
    },
  ];

  const [comments, setComments] = useState(dummyComments);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    if (formData.name.trim().length < 2) {
      setStatus({
        type: "error",
        message: "Name must have at least 2 characters.",
      });
      setIsSubmitting(false);
      return;
    }
    if (formData.message.trim().length < 5) {
      setStatus({
        type: "error",
        message: "Message must have at least 5 characters.",
      });
      setIsSubmitting(false);
      return;
    }

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500));

    // Add new comment to the list
    const newComment = {
      id: Date.now().toString(),
      author: {
        name: formData.name.trim(),
        avatar: formData.name
          .trim()
          .split(" ")
          .map((n) => n[0])
          .join("")
          .toUpperCase()
          .slice(0, 2),
      },
      content: formData.message.trim(),
      createdAt: new Date().toISOString(),
      reactions: { hearts: 0, stars: 0 },
    };

    setComments((prev) => [newComment, ...prev]);

    setStatus({
      type: "success",
      message: "Message added successfully",
    });

    setTimeout(() => {
      setFormData({ name: "", message: "" });
      setStatus({ type: "", message: "" });
      setIsSubmitting(false);
    }, 2000);
  };

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
    if (status.message) setStatus({ type: "", message: "" });
  };

  const formatTime = (dateStr) => {
    const d = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    if (diffMs < 60000) return "now";
    if (diffMs < 3600000) return `${Math.floor(diffMs / 60000)}m`;
    if (diffMs < 86400000) return `${Math.floor(diffMs / 3600000)}h`;
    return `${Math.floor(diffMs / 86400000)}d`;
  };

  const handleReaction = (commentId, type) => {
    setComments((prev) =>
      prev.map((comment) =>
        comment.id === commentId
          ? {
              ...comment,
              reactions: {
                ...comment.reactions,
                [type]: comment.reactions[type] + 1,
              },
            }
          : comment
      )
    );
  };

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
      {/* Header */}
      <div className="px-6 py-8">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-5xl mt-8 lg:text-6xl font-bold bg-gradient-to-r from-zinc-900 via-indigo-800 to-purple-800 dark:from-white dark:via-indigo-200 dark:to-purple-200 bg-clip-text text-transparent mb-6">
            Guestbook
          </h1>
          <p className="text-zinc-600 dark:text-zinc-400 mt-2">
            Leave a message and see what others are saying
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 h-full">
          {/* Left Side - Message Form */}
          <div className="space-y-6 border border-zinc-500 dark:border-zinc-700 rounded-md p-10 bg-zinc-50 dark:bg-zinc-900/70">
            <h2 className="text-xl font-medium text-zinc-900 dark:text-white">
              Leave a message
            </h2>

            <div className="space-y-4">
              <div>
                <input
                  name="name"
                  type="text"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Your name"
                  className="w-full px-4 py-3 border border-zinc-200 dark:border-zinc-700 rounded-md bg-zinc-100 dark:bg-zinc-950/70 text-zinc-900 dark:text-white placeholder:text-zinc-500 focus:border-zinc-400 dark:focus:border-zinc-500 focus:outline-none transition-colors"
                />
              </div>

              <div>
                <textarea
                  name="message"
                  rows={6}
                  value={formData.message}
                  onChange={handleChange}
                  placeholder="Write your message here..."
                  className="w-full px-4 py-3 border border-zinc-200 dark:border-zinc-700 rounded-md bg-zinc-100 dark:bg-zinc-950/70 text-zinc-900 dark:text-white placeholder:text-zinc-500 focus:border-zinc-400 dark:focus:border-zinc-500 focus:outline-none resize-none transition-colors"
                />
              </div>

              {status.message && (
                <div
                  className={`text-sm ${
                    status.type === "error"
                      ? "text-red-600 dark:text-red-400"
                      : "text-green-600 dark:text-green-400"
                  }`}
                >
                  {status.message}
                </div>
              )}

              <button
                onClick={handleSubmit}
                disabled={!formData.name || !formData.message || isSubmitting}
                className={`w-full py-3 px-4 rounded-md font-medium transition-colors flex items-center justify-center gap-2 ${
                  !formData.name || !formData.message || isSubmitting
                    ? "bg-zinc-100 dark:bg-zinc-900 text-zinc-400 dark:text-zinc-500 cursor-not-allowed"
                    : "bg-zinc-900 dark:bg-zinc-50 text-white dark:text-zinc-900 hover:bg-zinc-800 dark:hover:bg-zinc-100"
                }`}
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-zinc-400 border-t-transparent rounded-full animate-spin"></div>
                    Submitting...
                  </>
                ) : (
                  <>
                    <Send size={16} />
                    Submit Message
                  </>
                )}
              </button>

              <div className="space-y-3">
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-zinc-300 dark:border-zinc-600"></div>
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-zinc-50 dark:bg-zinc-900/70 px-2 text-zinc-500 dark:text-zinc-400">
                      Or sign in with
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <button className="flex items-center justify-center px-4 py-2 border border-zinc-300 dark:border-zinc-600 rounded-md bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-white hover:text-red-500 hover:bg-zinc-50 dark:hover:bg-zinc-700 transition-colors">
                    <FaGoogle className="w-5 h-5" />
                  </button>

                  <button className="flex items-center justify-center px-4 py-2 border border-zinc-300 dark:border-zinc-600 rounded-md bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-white hover:text-black hover:bg-zinc-50 dark:hover:bg-zinc-700 transition-colors">
                    <FaGithub className="w-5 h-5" />
                  </button>

                  <button className="flex items-center justify-center px-4 py-2 border border-zinc-300 dark:border-zinc-600 rounded-md bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-white hover:text-zinc-900 hover:bg-zinc-50 dark:hover:bg-zinc-700 transition-colors">
                    <FaTwitter className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Right Side - Messages List */}
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-medium text-zinc-900 dark:text-white">
                Messages
              </h2>
              <span className="text-sm text-zinc-500 dark:text-zinc-400">
                {comments.length} total
              </span>
            </div>

            <div className="space-y-6 max-h-[600px] overflow-y-auto">
              {comments.map((comment) => (
                <div
                  key={comment.id}
                  className="border-b border-zinc-100 dark:border-zinc-800 pb-6 last:border-0"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-zinc-900 dark:bg-zinc-100 flex items-center justify-center text-white dark:text-zinc-900 text-xs font-medium flex-shrink-0">
                      {comment.author.avatar}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="font-medium text-zinc-900 dark:text-white text-sm">
                          {comment.author.name}
                        </span>
                        <div className="flex items-center gap-1 text-xs text-zinc-500 dark:text-zinc-400">
                          <Clock size={10} />
                          {formatTime(comment.createdAt)}
                        </div>
                      </div>
                      <p className="text-zinc-700 dark:text-zinc-300 text-sm leading-relaxed mb-3">
                        {comment.content}
                      </p>
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => handleReaction(comment.id, "hearts")}
                          className="flex items-center gap-1 text-xs text-zinc-500 dark:text-zinc-400 hover:text-red-500 dark:hover:text-red-400 transition-colors"
                        >
                          <Heart size={12} />
                          {comment.reactions.hearts}
                        </button>
                        <button
                          onClick={() => handleReaction(comment.id, "stars")}
                          className="flex items-center gap-1 text-xs text-zinc-500 dark:text-zinc-400 hover:text-yellow-500 dark:hover:text-yellow-400 transition-colors"
                        >
                          <Star size={12} />
                          {comment.reactions.stars}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
