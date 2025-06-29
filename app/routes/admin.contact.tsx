// import { useState } from "react";
// import { Mail, Send, Linkedin, Github, MessageCircle } from "lucide-react";

// export default function ContactPage() {
//   const [formData, setFormData] = useState({
//     name: "",
//     email: "",
//     message: "",
//   });
//   const [status, setStatus] = useState({ type: "", message: "" });

//   const handleSubmit = async (e) => {
//     e.preventDefault();

//     if (formData.name.trim().length < 2) {
//       setStatus({ type: "error", message: "Name must have ≥2 characters." });
//       return;
//     }
//     if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
//       setStatus({ type: "error", message: "Invalid email." });
//       return;
//     }
//     if (formData.message.trim().length < 10) {
//       setStatus({ type: "error", message: "Message too short." });
//       return;
//     }

//     setStatus({
//       type: "success",
//       message: "Thanks! Your message has been sent.",
//     });

//     setTimeout(() => {
//       setFormData({ name: "", email: "", message: "" });
//       setStatus({ type: "", message: "" });
//     }, 3000);
//   };

//   const handleChange = (e) => {
//     setFormData((prev) => ({
//       ...prev,
//       [e.target.name]: e.target.value,
//     }));
//     if (status.message) setStatus({ type: "", message: "" });
//   };

//   const contactLinks = [
//     {
//       name: "Email",
//       href: "mailto:yahya@example.com",
//       icon: Mail,
//       display: "yahya@example.com",
//     },
//     {
//       name: "LinkedIn",
//       href: "https://www.linkedin.com/in/yahya",
//       icon: Linkedin,
//       display: "linkedin.com/in/yahya",
//     },
//     {
//       name: "GitHub",
//       href: "https://github.com/yahya",
//       icon: Github,
//       display: "github.com/yahya",
//     },
//   ];

//   return (
//     <div className="min-h-screen bg-gray-50 dark:bg-gray-950 py-12 px-6">
//       <div className="max-w-4xl mx-auto">
//         {/* Header */}
//         <header className="flex justify-between items-center mb-8 max-w-5xl mx-auto">
//           <div className="flex items-center gap-4">
//             <MessageCircle className="w-8 h-8 text-gray-600 dark:text-gray-400" />
//             <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
//               Get in touch
//             </h1>
//           </div>
//         </header>
//         <div className="mb-8 max-w-2xl mx-auto text-center">
//           <p className="text-lg text-gray-600 dark:text-gray-400">
//             Have a project in mind or just want to chat? I'd love to hear from you. Drop me a message and I'll get back to you as soon as possible.
//           </p>
//         </div>

//         {/* Main Content Grid */}
//         <div className="grid lg:grid-cols-3 gap-12 items-start">
//           {/* Contact Form - Takes 2 columns */}
//           <div className="lg:col-span-2">
//             <div className="bg-white dark:bg-gray-900 rounded-2xl p-8 shadow-sm border border-gray-200 dark:border-gray-800">
//               <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
//                 Send a message
//               </h2>

//               <form onSubmit={handleSubmit} className="space-y-6">
//                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//                   <div>
//                     <label
//                       htmlFor="name"
//                       className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
//                     >
//                       Name
//                     </label>
//                     <input
//                       id="name"
//                       name="name"
//                       type="text"
//                       value={formData.name}
//                       onChange={handleChange}
//                       className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-950 text-gray-900 dark:text-white focus:border-gray-400 dark:focus:border-gray-600 focus:outline-none transition-colors"
//                       placeholder="Your name"
//                     />
//                   </div>
//                   <div>
//                     <label
//                       htmlFor="email"
//                       className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
//                     >
//                       Email
//                     </label>
//                     <input
//                       id="email"
//                       name="email"
//                       type="email"
//                       value={formData.email}
//                       onChange={handleChange}
//                       className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-950 text-gray-900 dark:text-white focus:border-gray-400 dark:focus:border-gray-600 focus:outline-none transition-colors"
//                       placeholder="your@email.com"
//                     />
//                   </div>
//                 </div>

//                 <div>
//                   <label
//                     htmlFor="message"
//                     className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
//                   >
//                     Message
//                   </label>
//                   <textarea
//                     id="message"
//                     name="message"
//                     rows={6}
//                     value={formData.message}
//                     onChange={handleChange}
//                     className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-950 text-gray-900 dark:text-white focus:border-gray-400 dark:focus:border-gray-600 focus:outline-none transition-colors resize-none"
//                     placeholder="Tell me about your project, idea, or just say hello..."
//                   />
//                 </div>

//                 {status.message && (
//                   <div
//                     className={`text-sm ${
//                       status.type === "error"
//                         ? "text-red-500"
//                         : "text-green-500"
//                     }`}
//                   >
//                     {status.message}
//                   </div>
//                 )}

//                 <button
//                   type="submit"
//                   disabled={
//                     !formData.name || !formData.email || !formData.message
//                   }
//                   className={`w-full py-3 rounded-lg font-medium transition-all flex items-center justify-center gap-2 ${
//                     !formData.name || !formData.email || !formData.message
//                       ? "bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-500 cursor-not-allowed"
//                       : "bg-gray-900 dark:bg-white text-white dark:text-gray-900 hover:bg-gray-800 dark:hover:bg-gray-100"
//                   }`}
//                 >
//                   <Send size={16} />
//                   Send message
//                 </button>
//               </form>
//             </div>
//           </div>

//           {/* Contact Information - Takes 1 column */}
//           <div className="space-y-8">
//             {/* Contact Methods */}
//             <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 shadow-sm border border-gray-200 dark:border-gray-800">
//               <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
//                 Other ways to reach me
//               </h3>
//               <div className="space-y-3">
//                 {contactLinks.map((link) => (
//                   <a
//                     key={link.name}
//                     href={link.href}
//                     target="_blank"
//                     rel="noopener noreferrer"
//                     className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors group"
//                   >
//                     <link.icon
//                       size={18}
//                       className="text-gray-500 dark:text-gray-400 group-hover:text-gray-700 dark:group-hover:text-gray-200 transition-colors"
//                     />
//                     <div className="min-w-0">
//                       <div className="font-medium text-gray-900 dark:text-white text-sm">
//                         {link.name}
//                       </div>
//                       <div className="text-xs text-gray-500 dark:text-gray-400 truncate">
//                         {link.display}
//                       </div>
//                     </div>
//                   </a>
//                 ))}
//               </div>
//             </div>

//             {/* Response Time Info */}
//             <div className="bg-gray-100 dark:bg-gray-800 rounded-2xl p-6">
//               <div className="text-center">
//                 <div className="w-3 h-3 bg-green-400 rounded-full mx-auto mb-3 animate-pulse"></div>
//                 <h4 className="font-medium text-gray-900 dark:text-white text-sm mb-1">
//                   Available for projects
//                 </h4>
//                 <p className="text-xs text-gray-600 dark:text-gray-400">
//                   I typically respond within 24 hours
//                 </p>
//               </div>
//             </div>

//             {/* Location */}
//             <div className="text-center">
//               <p className="text-sm text-gray-500 dark:text-gray-400">
//                 📍 Based in Hyderabad, India
//               </p>
//               <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
//                 UTC+5:30
//               </p>
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }

import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";

// Work in progress animation variants
const variants = {
  hidden: { opacity: 0, y: 20, scale: 0.95 },
  visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.7 } },
};

export default function AdminAbout() {
  return (
    <div className="min-h-screen flex items-center  justify-center bg-gray-100 dark:bg-gray-900">
      <motion.div
        initial="hidden"
        animate="visible"
        variants={variants}
        className="items-center gap-4 absolute top-50% left-50%"
      >
        <div className="flex flex-col items-center space-y-4">
          <Loader2 size={48} className="text-blue-500 animate-spin" />
          <motion.h1
            className="text-2xl font-bold text-gray-900 dark:text-gray-100"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            Work in progress
          </motion.h1>
          <motion.p
            className="text-gray-600 dark:text-gray-400"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            This page is under construction. Please check back soon!
          </motion.p>
        </div>
      </motion.div>
    </div>
  );
}
