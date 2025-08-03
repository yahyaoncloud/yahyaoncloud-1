// import React, { useState, useEffect } from "react";
// import {
//   Eye,
//   EyeOff,
//   Mail,
//   Lock,
//   ArrowRight,
//   Github,
//   Chrome,
//   ArrowLeft,
//   CheckCircle,
//   AlertCircle,
// } from "lucide-react";
// import { useTheme } from "../Contexts/ThemeContext";
// import { motion, AnimatePresence } from "framer-motion";
// import Glitch from "../assets/Gallery/glitch.png";
// import Glass from "../assets/Gallery/glass.png";
// import Glass2 from "../assets/Gallery/glass2.png";
// import BlacknWhite from "../assets/Gallery/bw.png";
// import Work from "../assets/Gallery/work.png";
// import Logo from "../assets/yoc-logo.png";
// import type { ActionFunction, LoaderFunction } from "@remix-run/node";
// import { json, redirect } from "@remix-run/node";
// import {
//   commitSession,
//   createAdminSession,
//   createUserSession2,
//   getSession,
//   getTokenFromSession,
// } from "../utils/session.server";
// import Navbar from "../components/LoginNavbar";
// import { useFetcher, useLoaderData } from "@remix-run/react";
// import { environment } from "../environments/environment";
// import { get } from "mongoose";

// const containerVariants = {
//   hidden: { opacity: 0 },
//   visible: {
//     opacity: 1,
//     transition: { staggerChildren: 0.15, delayChildren: 0.1 },
//   },
// };

// const itemVariants = {
//   hidden: { opacity: 0, y: 20 },
//   visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
// };

// const slideVariants = {
//   hidden: { opacity: 0, x: -30 },
//   visible: { opacity: 1, x: 0, transition: { duration: 0.6, ease: "easeOut" } },
// };

// const fadeInVariants = {
//   hidden: { opacity: 0, scale: 0.95 },
//   visible: {
//     opacity: 1,
//     scale: 1,
//     transition: { duration: 0.5, ease: "easeOut" },
//   },
// };

// const imageVariants = {
//   initial: { opacity: 0, scale: 1.1 },
//   animate: { opacity: 1, scale: 1 },
//   exit: { opacity: 0, scale: 0.9 },
// };

// export const loader: LoaderFunction = async ({ request }) => {
//   const token = await getTokenFromSession(request);
//   console.log("Login loader token:", token);
//   // if (!token) {
//   //   console.log("No token found, redirecting to /admin/login");
//   //   return redirect("/admin/login", {
//   //     headers: { "Set-Cookie": await commitSession(session) },
//   //   });
//   // }
//   if (token) {
//     return createUserSession2({ token }, "/admin/blog");
//   }

//   return json({
//     ENV: {
//       GITHUB_CLIENT_ID: environment.GITHUB_CLIENT_ID,
//       GITHUB_CALLBACK_URL: environment.GITHUB_CALLBACK_URL,
//     },
//   });
// };

// export const action: ActionFunction = async ({ request }) => {
//   console.log("Action triggered for GitHub callback");
//   const urlParams = new URLSearchParams(await request.text());
//   const code = urlParams.get("code");

//   if (!code) {
//     console.error("Invalid or missing code:", code);
//     return json(
//       { error: "Invalid or missing authorization code" },
//       { status: 400 }
//     );
//   }

//   try {
//     const backendResponse = await fetch(
//       `${environment.GO_BACKEND_URL}/auth/github/callback?code=${code}`,
//       {
//         method: "GET",
//         credentials: "include", // Ensure cookies are sent if needed
//       }
//     );

//     if (!backendResponse.ok) {
//       const errorText = await backendResponse.text();
//       console.error(
//         "Backend error:",
//         errorText,
//         "Status:",
//         backendResponse.status
//       );
//       return json(
//         { error: `Backend authentication failed: ${errorText}` },
//         { status: backendResponse.status }
//       );
//     }

//     const backendData = await backendResponse.json();
//     const tokener = backendData.token;

//     if (!tokener) {
//       console.error("No token received from backend");
//       return json({ error: "No token received from backend" }, { status: 500 });
//     }

//     const token = await getTokenFromSession(request);
//     console.log("Token set in session:", token);

//     return redirect("/admin/blog", {
//       headers: {
//         "Set-Cookie": await createAdminSession(request, "/admin/blog"),
//       },
//     });
//   } catch (error) {
//     console.error("OAuth error:", error);
//     return json(
//       { error: "Internal server error during authentication" },
//       { status: 500 }
//     );
//   }
// };

// const galleryImages = [
//   {
//     url: Glitch,
//     title: "Fragmented Signal",
//     description:
//       "A distorted self — caught mid-glitch in the digital ether, suspended between presence and breakdown.",
//   },
//   {
//     url: BlacknWhite,
//     title: "Binary Silence",
//     description:
//       "Stripped of color, identity becomes contrast — a study in shadows and stark introspection.",
//   },
//   {
//     url: Glass,
//     title: "Shattered Perception",
//     description:
//       "Seen through fractured glass — distorted, divided, and yet somehow still whole. A reflection of layered self.",
//   },
//   {
//     url: Glass2,
//     title: "Obscured Reality",
//     description:
//       "A face veiled by ribbed glass, emotions warped and blurred. Mystery breathes in the spaces light can't reach.",
//   },
//   {
//     url: Work,
//     title: "Synthetic Soul",
//     description:
//       "A digital echo of the human face — reconstructed under neon hues, where code meets consciousness.",
//   },
// ];

// export default function LoginPage() {
//   const { theme } = useTheme();
//   const [currentImageIndex, setCurrentImageIndex] = useState(0);
//   const [isLoading, setIsLoading] = useState(false);
//   const [showPassword, setShowPassword] = useState(false);
//   const [formMode, setFormMode] = useState("login");
//   const [formData, setFormData] = useState({
//     email: "",
//     password: "",
//     rememberMe: false,
//   });
//   const [notification, setNotification] = useState<{
//     type: "success" | "error";
//     message: string;
//   } | null>(null);
//   const fetcher = useFetcher();

//   useEffect(() => {
//     const urlParams = new URLSearchParams(window.location.search);
//     const code = urlParams.get("code");

//     if (code) {
//       console.log("Detected code in URL:", code);
//       setIsLoading(true);
//       const formData = new FormData();
//       formData.append("code", code);
//       fetcher.submit(formData, { method: "post", action: "/admin/login" });
//     }
//   }, [fetcher]);

//   useEffect(() => {
//     if (fetcher.state === "idle" && fetcher.data) {
//       console.log("Fetcher data:", fetcher.data);
//       if (fetcher.data.error) {
//         setNotification({ type: "error", message: fetcher.data.error });
//         setIsLoading(false);
//       } else {
//         setNotification({
//           type: "success",
//           message: "Login successful! Redirecting...",
//         });
//         setIsLoading(false);
//         // Optionally, manually trigger redirect if needed
//         setTimeout(() => {
//           window.location.href = "/admin/blog";
//         }, 1000);
//       }
//     }
//   }, [fetcher.state, fetcher.data]);
//   useEffect(() => {
//     const interval = setInterval(() => {
//       setCurrentImageIndex((prevIndex) =>
//         prevIndex === galleryImages.length - 1 ? 0 : prevIndex + 1
//       );
//     }, 5000);
//     return () => clearInterval(interval);
//   }, []);

//   const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     const { name, value, type, checked } = e.target;
//     setFormData((prev) => ({
//       ...prev,
//       [name]: type === "checkbox" ? checked : value,
//     }));
//   };

//   const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
//     e.preventDefault();
//     setIsLoading(true);
//     setNotification(null);

//     await new Promise((resolve) => setTimeout(resolve, 1500));

//     if (formMode === "login") {
//       if (formData.email && formData.password) {
//         setNotification({
//           type: "success",
//           message: "Login successful! Redirecting...",
//         });
//         setTimeout(() => {
//           setFormMode("success");
//         }, 1000);
//       } else {
//         setNotification({
//           type: "error",
//           message: "Please fill in all required fields",
//         });
//       }
//     } else if (formMode === "forgot") {
//       if (formData.email) {
//         setNotification({
//           type: "success",
//           message: "Password reset link sent to your email!",
//         });
//         setTimeout(() => {
//           setFormMode("login");
//         }, 2000);
//       } else {
//         setNotification({
//           type: "error",
//           message: "Please enter your email address",
//         });
//       }
//     }

//     setIsLoading(false);
//   };

//   const handleSSOLogin = (provider: "GitHub" | "Google") => {
//     if (provider === "GitHub") {
//       const githubAuthUrl = `https://github.com/login/oauth/authorize?client_id=${environment.GITHUB_CLIENT_ID}&redirect_uri=${environment.GITHUB_CALLBACK_URL}&scope=user:email`;
//       console.log("Redirecting to GitHub:", githubAuthUrl);
//       window.location.href = githubAuthUrl;
//       console.log("????????????????", githubAuthUrl);
//     }
//   };

//   const currentImage = galleryImages[currentImageIndex];

//   return (
//     <motion.div
//       className={`min-h-screen flex flex-col ${
//         theme === "dark"
//           ? "bg-gradient-to-br from-gray-900 to-gray-950 text-gray-100"
//           : "bg-gradient-to-br from-amber-50 to-indigo-50 text-gray-900"
//       }`}
//       initial={{ opacity: 0 }}
//       animate={{ opacity: 1 }}
//       transition={{ duration: 0.8 }}
//     >
//       <motion.div
//         initial={{ opacity: 0, y: -20 }}
//         animate={{ opacity: 1, y: 0 }}
//         transition={{ duration: 0.6 }}
//       >
//         <Navbar />
//       </motion.div>

//       <div className="flex flex-1">
//         <motion.div
//           className="w-full md:w-1/2 flex items-center justify-center p-6 md:p-12"
//           variants={containerVariants}
//           initial="hidden"
//           animate="visible"
//         >
//           <div className="w-full max-w-md space-y-8">
//             <motion.div variants={itemVariants} className="text-center">
//               <motion.div
//                 className="w-32 h-32 mx-auto flex items-center justify-center shadow-lg"
//                 whileHover={{ scale: 1.05 }}
//                 transition={{ type: "spring", stiffness: 300 }}
//               >
//                 <img
//                   src={Logo}
//                   alt="YahyaOnCloud Logo"
//                   className="w-28 h-28 object-contain"
//                 />
//               </motion.div>
//               <motion.div
//                 className="text-xl font-light text-center mb-2"
//                 variants={slideVariants}
//               >
//                 YahyaOnCloud
//               </motion.div>
//               <motion.h1
//                 className={`text-3xl font-bold ${
//                   theme === "dark"
//                     ? "bg-gradient-to-r from-white via-blue-300 to-white text-transparent bg-clip-text"
//                     : "text-gray-900"
//                 } mb-2`}
//                 variants={slideVariants}
//               >
//                 {formMode === "login"
//                   ? "Welcome Back"
//                   : formMode === "forgot"
//                   ? "Reset Password"
//                   : "Login Success"}
//               </motion.h1>
//               <motion.p
//                 className={`text-sm ${
//                   theme === "dark" ? "text-gray-300" : "text-gray-600"
//                 }`}
//                 variants={slideVariants}
//               >
//                 {formMode === "login"
//                   ? "Login"
//                   : formMode === "forgot"
//                   ? "Enter your email to reset"
//                   : "Redirecting..."}
//               </motion.p>
//             </motion.div>

//             <AnimatePresence>
//               {notification && (
//                 <motion.div
//                   initial={{ opacity: 0, y: -10, scale: 0.95 }}
//                   animate={{ opacity: 1, y: 0, scale: 1 }}
//                   exit={{ opacity: 0, y: -10, scale: 0.95 }}
//                   transition={{ duration: 0.3 }}
//                   className={`flex items-center gap-2 px-4 py-3 rounded-lg text-sm border ${
//                     notification.type === "success"
//                       ? "bg-green-500/10 border-green-500 text-green-300"
//                       : "bg-red-500/10 border-red-500 text-red-300"
//                   }`}
//                 >
//                   <motion.div
//                     initial={{ scale: 0 }}
//                     animate={{ scale: 1 }}
//                     transition={{ delay: 0.1 }}
//                   >
//                     {notification.type === "success" ? (
//                       <CheckCircle className="w-4 h-4" />
//                     ) : (
//                       <AlertCircle className="w-4 h-4" />
//                     )}
//                   </motion.div>
//                   {notification.message}
//                 </motion.div>
//               )}
//             </AnimatePresence>

//             <AnimatePresence mode="wait">
//               {formMode === "success" ? (
//                 <motion.div
//                   key="success"
//                   initial={{ opacity: 0, scale: 0.8 }}
//                   animate={{ opacity: 1, scale: 1 }}
//                   exit={{ opacity: 0, scale: 0.8 }}
//                   transition={{ duration: 0.5 }}
//                   className="text-center space-y-4"
//                 >
//                   <motion.div
//                     initial={{ scale: 0 }}
//                     animate={{ scale: 1 }}
//                     transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
//                   >
//                     <CheckCircle
//                       className={`w-12 h-12 mx-auto ${
//                         theme === "dark" ? "text-green-400" : "text-green-600"
//                       }`}
//                     />
//                   </motion.div>
//                   <motion.p
//                     className={`text-lg font-semibold ${
//                       theme === "dark" ? "text-gray-100" : "text-gray-900"
//                     }`}
//                     initial={{ opacity: 0 }}
//                     animate={{ opacity: 1 }}
//                     transition={{ delay: 0.4 }}
//                   >
//                     Redirecting to dashboard...
//                   </motion.p>
//                   <motion.button
//                     onClick={() => setFormMode("login")}
//                     className={`text-sm ${
//                       theme === "dark"
//                         ? "text-blue-400 hover:text-blue-300"
//                         : "text-blue-600 hover:text-blue-500"
//                     } hover:underline`}
//                     initial={{ opacity: 0 }}
//                     animate={{ opacity: 1 }}
//                     transition={{ delay: 0.6 }}
//                     whileHover={{ scale: 1.05 }}
//                   >
//                     Back to Login
//                   </motion.button>
//                 </motion.div>
//               ) : (
//                 <motion.form
//                   key="form"
//                   className="space-y-6"
//                   onSubmit={handleSubmit}
//                   variants={containerVariants}
//                   initial="hidden"
//                   animate="visible"
//                 >
//                   <motion.div className="relative" variants={itemVariants}>
//                     <Mail
//                       className={`absolute left-3 top-3.5 ${
//                         theme === "dark" ? "text-gray-400" : "text-gray-500"
//                       }`}
//                     />
//                     <motion.input
//                       name="email"
//                       type="email"
//                       required
//                       value={formData.email}
//                       onChange={handleInputChange}
//                       placeholder="Email"
//                       className={`w-full pl-10 pr-4 py-3 rounded-xl border focus:ring-2 focus:ring-blue-500 outline-none ${
//                         theme === "dark"
//                           ? "bg-gray-800 border-gray-700 text-white placeholder:text-gray-400"
//                           : "bg-white border-gray-300 text-gray-900 placeholder:text-gray-400"
//                       }`}
//                       whileFocus={{ scale: 1.02 }}
//                       transition={{ type: "spring", stiffness: 300 }}
//                     />
//                   </motion.div>

//                   <AnimatePresence>
//                     {formMode === "login" && (
//                       <motion.div
//                         className="relative"
//                         variants={itemVariants}
//                         initial={{ opacity: 0, height: 0 }}
//                         animate={{ opacity: 1, height: "auto" }}
//                         exit={{ opacity: 0, height: 0 }}
//                         transition={{ duration: 0.3 }}
//                       >
//                         <Lock
//                           className={`absolute left-3 top-3.5 ${
//                             theme === "dark" ? "text-gray-400" : "text-gray-500"
//                           }`}
//                         />
//                         <motion.input
//                           name="password"
//                           type={showPassword ? "text" : "password"}
//                           required
//                           value={formData.password}
//                           onChange={handleInputChange}
//                           placeholder="Password"
//                           className={`w-full pl-10 pr-10 py-3 rounded-xl border focus:ring-2 focus:ring-blue-500 outline-none ${
//                             theme === "dark"
//                               ? "bg-gray-800 border-gray-700 text-white placeholder:text-gray-400"
//                               : "bg-white border-gray-300 text-gray-900 placeholder:text-gray-400"
//                           }`}
//                           whileFocus={{ scale: 1.02 }}
//                           transition={{ type: "spring", stiffness: 300 }}
//                         />
//                         <motion.button
//                           type="button"
//                           className={`absolute right-3 top-3.5 ${
//                             theme === "dark" ? "text-gray-400" : "text-gray-500"
//                           }`}
//                           onClick={() => setShowPassword((prev) => !prev)}
//                           whileHover={{ scale: 1.1 }}
//                           whileTap={{ scale: 0.9 }}
//                         >
//                           {showPassword ? (
//                             <EyeOff size={18} />
//                           ) : (
//                             <Eye size={18} />
//                           )}
//                         </motion.button>
//                       </motion.div>
//                     )}
//                   </AnimatePresence>

//                   <motion.div
//                     className={`flex justify-between text-sm ${
//                       theme === "dark" ? "text-gray-300" : "text-gray-600"
//                     }`}
//                     variants={itemVariants}
//                   >
//                     <AnimatePresence>
//                       {formMode === "login" && (
//                         <>
//                           <motion.label
//                             className="flex items-center gap-2"
//                             initial={{ opacity: 0, x: -10 }}
//                             animate={{ opacity: 1, x: 0 }}
//                             exit={{ opacity: 0, x: -10 }}
//                           >
//                             <input
//                               type="checkbox"
//                               name="rememberMe"
//                               checked={formData.rememberMe}
//                               onChange={handleInputChange}
//                               className={`${
//                                 theme === "dark"
//                                   ? "text-blue-500 bg-gray-700"
//                                   : "text-blue-500 bg-gray-200"
//                               } rounded`}
//                             />
//                             Remember me
//                           </motion.label>
//                           <motion.button
//                             type="button"
//                             className={`${
//                               theme === "dark"
//                                 ? "hover:text-blue-300"
//                                 : "hover:text-blue-500"
//                             }`}
//                             onClick={() => setFormMode("forgot")}
//                             initial={{ opacity: 0, x: 10 }}
//                             animate={{ opacity: 1, x: 0 }}
//                             exit={{ opacity: 0, x: 10 }}
//                             whileHover={{ scale: 1.05 }}
//                           >
//                             Forgot password?
//                           </motion.button>
//                         </>
//                       )}
//                     </AnimatePresence>
//                   </motion.div>

//                   <motion.button
//                     type="submit"
//                     disabled={isLoading || fetcher.state !== "idle"}
//                     className={`w-full flex items-center justify-center gap-2 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white py-3 rounded-xl font-semibold transition-all disabled:opacity-50`}
//                     variants={itemVariants}
//                     whileHover={{ scale: 1.02 }}
//                     whileTap={{ scale: 0.98 }}
//                   >
//                     {isLoading || fetcher.state !== "idle" ? (
//                       <motion.div
//                         className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
//                         animate={{ rotate: 360 }}
//                         transition={{
//                           duration: 1,
//                           repeat: Infinity,
//                           ease: "linear",
//                         }}
//                       />
//                     ) : (
//                       <>
//                         {formMode === "login" ? "Sign In" : "Send Reset Link"}
//                         <ArrowRight size={18} />
//                       </>
//                     )}
//                   </motion.button>

//                   <AnimatePresence>
//                     {formMode === "login" && (
//                       <motion.div
//                         className="space-y-3"
//                         variants={itemVariants}
//                         initial={{ opacity: 0, y: 20 }}
//                         animate={{ opacity: 1, y: 0 }}
//                         exit={{ opacity: 0, y: 20 }}
//                         transition={{ duration: 0.5 }}
//                       >
//                         <motion.div
//                           className={`text-center text-sm ${
//                             theme === "dark" ? "text-gray-400" : "text-gray-500"
//                           }`}
//                           variants={fadeInVariants}
//                         >
//                           Or sign in with
//                         </motion.div>
//                         <motion.div
//                           className="flex gap-3"
//                           variants={containerVariants}
//                           initial="hidden"
//                           animate="visible"
//                         >
//                           <motion.button
//                             onClick={() => handleSSOLogin("Google")}
//                             type="button"
//                             disabled={isLoading || fetcher.state !== "idle"}
//                             className={`flex-1 flex items-center justify-center gap-2 border py-2 rounded-xl transition-all ${
//                               theme === "dark"
//                                 ? "bg-gray-800 border-gray-700 hover:bg-gray-700 text-white"
//                                 : "bg-white border-gray-300 hover:bg-gray-100 text-gray-900"
//                             }`}
//                             variants={itemVariants}
//                             whileHover={{ scale: 1.02 }}
//                             whileTap={{ scale: 0.98 }}
//                           >
//                             <Chrome size={18} />
//                             Google
//                           </motion.button>
//                           <motion.button
//                             onClick={() => handleSSOLogin("GitHub")}
//                             type="button"
//                             disabled={isLoading || fetcher.state !== "idle"}
//                             className={`flex-1 flex items-center justify-center gap-2 border py-2 rounded-xl transition-all ${
//                               theme === "dark"
//                                 ? "bg-gray-800 border-gray-700 hover:bg-gray-700 text-white"
//                                 : "bg-white border-gray-300 hover:bg-gray-100 text-gray-900"
//                             }`}
//                             variants={itemVariants}
//                             whileHover={{ scale: 1.02 }}
//                             whileTap={{ scale: 0.98 }}
//                           >
//                             <Github size={18} />
//                             GitHub
//                           </motion.button>
//                         </motion.div>
//                       </motion.div>
//                     )}
//                   </AnimatePresence>

//                   <AnimatePresence>
//                     {formMode === "forgot" && (
//                       <motion.div
//                         className="text-center"
//                         initial={{ opacity: 0 }}
//                         animate={{ opacity: 1 }}
//                         exit={{ opacity: 0 }}
//                         transition={{ duration: 0.3 }}
//                       >
//                         <motion.button
//                           type="button"
//                           onClick={() => setFormMode("login")}
//                           className={`text-sm ${
//                             theme === "dark"
//                               ? "text-blue-400 hover:text-blue-300"
//                               : "text-blue-600 hover:text-blue-500"
//                           } hover:underline`}
//                           whileHover={{ scale: 1.05 }}
//                         >
//                           <ArrowLeft className="inline mr-1" size={14} />
//                           Back to Login
//                         </motion.button>
//                       </motion.div>
//                     )}
//                   </AnimatePresence>
//                 </motion.form>
//               )}
//             </AnimatePresence>
//           </div>
//         </motion.div>

//         {/* Right Panel - Gallery */}
//         <motion.div
//           className="hidden md:block w-1/2 relative overflow-hidden m-10 rounded-xl shadow-lg"
//           initial={{ opacity: 0, x: 100 }}
//           animate={{ opacity: 1, x: 0 }}
//           transition={{ duration: 0.8, delay: 0.2 }}
//         >
//           <div className="absolute inset-0 bg-black/40 z-10 h-full" />
//           <div className="relative h-full">
//             <AnimatePresence>
//               <motion.div
//                 key={currentImageIndex}
//                 variants={imageVariants}
//                 initial="initial"
//                 animate="animate"
//                 exit="exit"
//                 transition={{ duration: 1, ease: "easeInOut" }}
//                 className="absolute inset-0 z-0"
//               >
//                 <img
//                   src={currentImage.url}
//                   alt={currentImage.title}
//                   className="w-full h-full object-cover"
//                 />
//                 <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
//               </motion.div>
//             </AnimatePresence>
//           </div>
//           <motion.div
//             className="absolute bottom-0 left-0 right-0 z-20 px-8 pb-10 text-white"
//             initial={{ opacity: 0, y: 50 }}
//             animate={{ opacity: 1, y: 0 }}
//             transition={{ duration: 0.6, delay: 0.4 }}
//           >
//             <div className="max-w-md">
//               <AnimatePresence mode="wait">
//                 <motion.h3
//                   key={currentImage.title}
//                   className="text-2xl font-bold tracking-tight mb-1 drop-shadow-md zen-dots"
//                   initial={{ opacity: 0, y: 20 }}
//                   animate={{ opacity: 1, y: 0 }}
//                   exit={{ opacity: 0, y: -20 }}
//                   transition={{ duration: 0.5 }}
//                 >
//                   {currentImage.title}
//                 </motion.h3>
//               </AnimatePresence>
//               <AnimatePresence mode="wait">
//                 <motion.p
//                   key={currentImage.description}
//                   className="text-sm text-gray-300 mb-4"
//                   initial={{ opacity: 0, y: 20 }}
//                   animate={{ opacity: 1, y: 0 }}
//                   exit={{ opacity: 0, y: -20 }}
//                   transition={{ duration: 0.5, delay: 0.1 }}
//                 >
//                   {currentImage.description}
//                 </motion.p>
//               </AnimatePresence>
//               <motion.div
//                 className="flex gap-2"
//                 initial={{ opacity: 0 }}
//                 animate={{ opacity: 1 }}
//                 transition={{ delay: 0.6 }}
//               >
//                 {galleryImages.map((_, index) => (
//                   <motion.button
//                     key={index}
//                     onClick={() => setCurrentImageIndex(index)}
//                     className={`w-9 h-2 rounded-full transition-all duration-300 ${
//                       index === currentImageIndex
//                         ? "bg-blue-100 shadow-md shadow-white/20 scale-110"
//                         : "bg-white/40 hover:bg-blue-100/70 hover:shadow-sm"
//                     }`}
//                     whileHover={{ scale: 1.05 }}
//                     whileTap={{ scale: 0.9 }}
//                   />
//                 ))}
//               </motion.div>
//             </div>
//           </motion.div>
//         </motion.div>
//       </div>
//     </motion.div>
//   );
// }
