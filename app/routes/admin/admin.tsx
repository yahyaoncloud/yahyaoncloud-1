// import { json, Outlet, useLocation } from "@remix-run/react";
// import UserLayout from "../components/layouts/UserLayout";
// import MainLayout from "../components/layouts/MainLayout";
// import { ThemeProvider } from "../Contexts/ThemeContext";
// import { LoaderFunction, redirect } from "@remix-run/node";
// import { getTokenFromSession } from "../utils/session.server";
// import { environment } from "../environments/environment";
// import { NotFound } from "../components/404";

// export const loader: LoaderFunction = async ({ request }) => {
//   // throw new Response("Not Found", { status: 404 });

//   const url = new URL(request.url);
//   if (url.pathname === "/admin") {
//     return redirect("/admin/blog");
//   }
//   const token = await getTokenFromSession(request);
//   console.log("Token in loader:", token);

//   // if (!token) {
//   //   redirect("/admin/login");
//   //   throw new Error("Authentication token is missing");
//   // }

//   // Validate token with backend
//   try {
//     const response = await fetch(
//       `${environment.GO_BACKEND_URL}/validate-token`,
//       {
//         method: "GET",
//         headers: { Authorization: `Bearer ${token}` },
//       }
//     );

//     const userData = await response.text();
//     return json({ user: userData });
//   } catch (error) {
//     console.error("Token validation error:", error);
//     return redirect("/admin/login");
//   }
// };

// export default function AdminLayout() {
//   const location = useLocation();
//   const isLoginPage = location.pathname === "/admin/login";
//   const Layout = isLoginPage ? MainLayout : UserLayout;

//   return (
//     <ThemeProvider>
//       <MainLayout>
//         <Outlet />
//       </MainLayout>
//     </ThemeProvider>
//   );
// }

// export function CatchBoundary() {
//   return <NotFound />;
// }
