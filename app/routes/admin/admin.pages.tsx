// import React from "react";

// type StaticPage = {
//     id: string;
//     title: string;
//     slug: string;
//     excerpt: string;
//     updatedAt: string;
// };

// const staticPages: StaticPage[] = [
//     {
//         id: "1",
//         title: "About Us",
//         slug: "about-us",
//         excerpt: "Learn more about our blog and mission.",
//         updatedAt: "2024-06-01",
//     },
//     {
//         id: "2",
//         title: "Contact",
//         slug: "contact",
//         excerpt: "Get in touch with us for inquiries or feedback.",
//         updatedAt: "2024-05-28",
//     },
//     {
//         id: "3",
//         title: "Privacy Policy",
//         slug: "privacy-policy",
//         excerpt: "Read our privacy policy and data protection practices.",
//         updatedAt: "2024-05-15",
//     },
// ];

// export default function AdminPages() {
//     return (
//         <div className="admin-pages">
//             <h1>Static Pages Preview</h1>
//             <table>
//                 <thead>
//                     <tr>
//                         <th>Title</th>
//                         <th>Slug</th>
//                         <th>Excerpt</th>
//                         <th>Last Updated</th>
//                         <th>Preview</th>
//                     </tr>
//                 </thead>
//                 <tbody>
//                     {staticPages.map((page) => (
//                         <tr key={page.id}>
//                             <td>{page.title}</td>
//                             <td>{page.slug}</td>
//                             <td>{page.excerpt}</td>
//                             <td>{page.updatedAt}</td>
//                             <td>
//                                 <a
//                                     href={`/pages/${page.slug}`}
//                                     target="_blank"
//                                     rel="noopener noreferrer"
//                                 >
//                                     Preview
//                                 </a>
//                             </td>
//                         </tr>
//                     ))}
//                 </tbody>
//             </table>
//         </div>
//     );
// }