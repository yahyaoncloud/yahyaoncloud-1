// import { faker } from "@faker-js/faker";
// import { createCategory } from "../Services/category.server"; // Adjust path based on your project structure
// import { createTag } from "~/Services/post.server";
// import { createType } from "~/Services/post.server";
// import dotenv from "dotenv";

// dotenv.config();

// const generateDummyCategories = async (count: number = 10) => {
//   const categories = [];
//   for (let i = 0; i < count; i++) {
//     const name = faker.lorem.word({ length: { min: 5, max: 15 } });
//     const catID = `CAT-${faker.string.alphanumeric(6).toUpperCase()}`;

//     try {
//       const category = await createCategory({
//         name,
//         catID,
//       });
//       categories.push(category);
//       console.log(`Created category: ${category.name}`);
//     } catch (error) {
//       console.error(`Error creating category: ${(error as Error).message}`);
//     }
//   }

//   console.log(`Successfully created ${categories.length} dummy categories`);
//   return categories;
// };

// const generateDummyTags = async (count: number = 20) => {
//   const tags = [];
//   for (let i = 0; i < count; i++) {
//     const name = faker.lorem.word({ length: { min: 3, max: 10 } });
//     const tagID = `TAG-${faker.string.alphanumeric(6).toUpperCase()}`;

//     try {
//       const tag = await createTag({
//         name,
//         tagID,
//       });
//       tags.push(tag);
//       console.log(`Created tag: ${tag.name}`);
//     } catch (error) {
//       console.error(`Error creating tag: ${(error as Error).message}`);
//     }
//   }

//   console.log(`Successfully created ${tags.length} dummy tags`);
//   return tags;
// };

// const generateDummyTypes = async (count: number = 5) => {
//   const types = [];
//   for (let i = 0; i < count; i++) {
//     const name = faker.lorem.word({ length: { min: 5, max: 12 } });

//     try {
//       const type = await createType({
//         name,
//       });
//       types.push(type);
//       console.log(`Created type: ${type.name}`);
//     } catch (error) {
//       console.error(`Error creating type: ${(error as Error).message}`);
//     }
//   }

//   console.log(`Successfully created ${types.length} dummy types`);
//   return types;
// };

// // Run the seeders
// const seedAll = async () => {
//   try {
//     await generateDummyCategories(10);
//     await generateDummyTags(20);
//     await generateDummyTypes(5);
//     console.log("All seeders completed successfully");
//     process.exit(0);
//   } catch (err) {
//     console.error("Error running seeders:", err);
//     process.exit(1);
//   }
// };

// seedAll();
