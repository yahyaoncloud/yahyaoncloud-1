// import { faker } from "@faker-js/faker";
// import { connectDB } from "../Services/db.server";
// import { Category, MediaAsset, Post, Tag, Type, User } from "../models";
// // import { User, Category, Tag, Type } from "../Types/types";
// import dotenv from "dotenv";
// dotenv.config();

// // Generate markdown content with realistic structure
// const generateMarkdownContent = () => {
//   const headings = [
//     `## ${faker.lorem.sentence()}`,
//     `### ${faker.lorem.sentence()}`,
//     `#### ${faker.lorem.sentence()}`,
//   ];

//   const paragraphs = Array.from({ length: 5 }, () => faker.lorem.paragraphs(2));
//   const listItems = Array.from(
//     { length: 5 },
//     () => `- ${faker.lorem.sentence()}`
//   );
//   const codeBlock =
//     "```javascript\n" +
//     `const ${faker.lorem.word()} = () => {\n` +
//     `  return "${faker.lorem.sentence()}"\n` +
//     "}\n```";

//   return [
//     headings[0],
//     paragraphs[0],
//     headings[1],
//     listItems.join("\n"),
//     headings[2],
//     codeBlock,
//     paragraphs[2],
//   ].join("\n\n");
// };

// const generateDummyPosts = async (count: number = 10) => {
//   await connectDB();

//   // Clear existing data (optional)
//   // await Post.deleteMany({});
//   // await MediaAsset.deleteMany({});

//   // Get existing references
//   const users = await User.find().limit(5);
//   const categories = await Category.find().limit(5);
//   const tags = await Tag.find().limit(10);
//   const types = await Type.find().limit(3);

//   if (!users.length || !categories.length || !tags.length || !types.length) {
//     throw new Error(
//       "Need at least some users, categories, tags and types in DB first"
//     );
//   }

//   // Create some media assets
//   const mediaAssets = await Promise.all(
//     Array.from({ length: 5 }, async (_, i) => {
//       return MediaAsset.create({
//         url: `https://picsum.photos/seed/${faker.string.uuid()}/800/600`,
//         altText: faker.lorem.sentence(),
//         type: "image",
//         uploadedBy: users[0]._id,
//       });
//     })
//   );

//   // Generate posts
//   const posts = [];
//   for (let i = 0; i < count; i++) {
//     const title = faker.lorem.sentence();
//     const slug = faker.helpers.slugify(title).toLowerCase();
//     const content = generateMarkdownContent();
//     const summary = faker.lorem.paragraph();
//     const date = faker.date.recent({ days: 60 });
//     const author = faker.helpers.arrayElement(users);
//     const postCategories = faker.helpers.arrayElements(categories, {
//       min: 1,
//       max: 3,
//     });
//     const postTags = faker.helpers.arrayElements(tags, { min: 1, max: 5 });
//     const postTypes = faker.helpers.arrayElements(types, { min: 1, max: 2 });
//     const coverImage = faker.helpers.arrayElement(mediaAssets);
//     const gallery = faker.helpers.arrayElements(mediaAssets, {
//       min: 1,
//       max: 3,
//     });
//     const minuteRead = faker.number.int({ min: 3, max: 15 });
//     const likes = faker.number.int({ min: 0, max: 100 });
//     const views = faker.number.int({ min: 50, max: 1000 });
//     const status = faker.datatype.boolean(0.8) ? "published" : "draft";
//     const seoTitle = `${title} | ${faker.company.name()}`;
//     const seoDescription = faker.lorem.sentences(2);
//     const seoKeywords = Array.from({ length: 5 }, () => faker.lorem.word());

//     const post = await Post.create({
//       title,
//       slug,
//       content,
//       summary,
//       date,
//       authorId: author._id,
//       categories: postCategories.map((c) => c._id),
//       tags: postTags.map((t) => t._id),
//       types: postTypes.map((t) => t._id),
//       coverImage: coverImage._id,
//       gallery: gallery.map((g) => g._id),
//       minuteRead,
//       likes,
//       views,
//       status,
//       seoTitle,
//       seoDescription,
//       seoKeywords,
//     });

//     posts.push(post);
//     console.log(`Created post: ${post.title}`);
//   }

//   console.log(`Successfully created ${posts.length} dummy posts`);
//   return posts;
// };

// // Run the script
// generateDummyPosts(20)
//   .then(() => process.exit(0))
//   .catch((err) => {
//     console.error("Error generating dummy posts:", err);
//     process.exit(1);
//   });
