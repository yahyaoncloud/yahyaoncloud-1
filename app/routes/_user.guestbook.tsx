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
    {
      id: "5",
      author: { name: "Emma Watson", avatar: "EW" },
      content:
        "Clean code, great explanations, and amazing projects. Keep up the fantastic work!",
      createdAt: "2025-06-24T08:30:00Z",
      reactions: { hearts: 16, stars: 9 },
    },
    {
      id: "6",
      author: { name: "James Liu", avatar: "JL" },
      content:
        "Your portfolio inspired me to redesign mine. Love the minimalist approach!",
      createdAt: "2025-06-23T15:45:00Z",
      reactions: { hearts: 21, stars: 13 },
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
      message: "Message added successfully!",
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
    if (diffMs < 3600000) return `${Math.floor(diffMs / 60000)}m ago`;
    if (diffMs < 86400000) return `${Math.floor(diffMs / 3600000)}h ago`;
    return `${Math.floor(diffMs / 86400000)}d ago`;
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
    <div className="min-h-screen ">
      {/* Header */}
      <div className="max-w-5xl mx-auto px-6 pt-20 pb-12">
        <h1 className="text-4xl md:text-5xl font-bold text-slate-900 dark:text-white mb-4">
          Guestbook
        </h1>
        <p className="text-slate-600 dark:text-slate-300">
          Leave a message and see what others are saying
        </p>
      </div>

      {/* Main Content */}
      <div className="max-w-5xl mx-auto px-6 pb-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Message Form */}
          <div className="order-2 lg:order-1">
            <div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-8 border border-slate-200 dark:border-slate-700">
              <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-6">
                Leave a message
              </h2>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <input
                    name="name"
                    type="text"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Your name"
                    className="w-full px-4 py-3 rounded-lg bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white placeholder-slate-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                  />
                </div>

                <div>
                  <textarea
                    name="message"
                    rows={5}
                    value={formData.message}
                    onChange={handleChange}
                    placeholder="Write your message here..."
                    className="w-full px-4 py-3 rounded-lg bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white placeholder-slate-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none transition-all"
                  />
                </div>

                {status.message && (
                  <div
                    className={`text-sm p-3 rounded-lg ${
                      status.type === "error"
                        ? "bg-red-50 border border-red-200 text-red-700 dark:bg-red-900/30 dark:border-red-800 dark:text-red-300"
                        : "bg-green-50 border border-green-200 text-green-700 dark:bg-green-900/30 dark:border-green-800 dark:text-green-300"
                    }`}
                  >
                    {status.message}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={!formData.name || !formData.message || isSubmitting}
                  className={`w-full py-3 px-4 rounded-lg font-medium transition-all flex items-center justify-center gap-2 ${
                    !formData.name || !formData.message || isSubmitting
                      ? "bg-slate-200 dark:bg-slate-700 text-slate-400 dark:text-slate-500 cursor-not-allowed"
                      : "bg-blue-600 hover:bg-blue-700 text-white shadow-sm hover:shadow-md"
                  }`}
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      Submitting...
                    </>
                  ) : (
                    <>
                      <Send size={16} />
                      Submit Message
                    </>
                  )}
                </button>
              </form>

              {/* Social Sign In */}
              <div className="mt-8">
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-slate-300 dark:border-slate-600"></div>
                  </div>
                  <div className="relative flex justify-center text-xs">
                    <span className="bg-slate-50 dark:bg-slate-800/50 px-3 text-slate-500 dark:text-slate-400">
                      Or sign in with
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3 mt-4">
                  <button className="flex items-center justify-center p-3 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors group">
                    <FaGoogle className="w-5 h-5 text-slate-600 dark:text-slate-400 group-hover:text-red-500" />
                  </button>
                  <button className="flex items-center justify-center p-3 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors group">
                    <FaGithub className="w-5 h-5 text-slate-600 dark:text-slate-400 group-hover:text-slate-900 dark:group-hover:text-white" />
                  </button>
                  <button className="flex items-center justify-center p-3 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors group">
                    <FaTwitter className="w-5 h-5 text-slate-600 dark:text-slate-400 group-hover:text-blue-500" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Messages List */}
          <div className="order-1 lg:order-3">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
                Recent Messages
              </h2>
              <span className="text-sm text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-full">
                {comments.length} messages
              </span>
            </div>

            <div className="space-y-6 max-h-[70vh] overflow-y-auto pr-2">
              {comments.map((comment) => (
                <div
                  key={comment.id}
                  className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-6 border border-slate-200 dark:border-slate-700"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-full bg-blue-600 dark:bg-blue-500 flex items-center justify-center text-white text-sm font-medium flex-shrink-0">
                      {comment.author.avatar}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="font-medium text-slate-900 dark:text-white">
                          {comment.author.name}
                        </span>
                        <div className="flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400">
                          <Clock size={12} />
                          {formatTime(comment.createdAt)}
                        </div>
                      </div>
                      <p className="text-slate-700 dark:text-slate-300 leading-relaxed mb-4">
                        {comment.content}
                      </p>
                      <div className="flex items-center gap-4">
                        <button
                          onClick={() => handleReaction(comment.id, "hearts")}
                          className="flex items-center gap-1 text-sm text-slate-500 dark:text-slate-400 hover:text-red-500 dark:hover:text-red-400 transition-colors"
                        >
                          <Heart size={14} />
                          <span>{comment.reactions.hearts}</span>
                        </button>
                        <button
                          onClick={() => handleReaction(comment.id, "stars")}
                          className="flex items-center gap-1 text-sm text-slate-500 dark:text-slate-400 hover:text-yellow-500 dark:hover:text-yellow-400 transition-colors"
                        >
                          <Star size={14} />
                          <span>{comment.reactions.stars}</span>
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
