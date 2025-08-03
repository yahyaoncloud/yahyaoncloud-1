import { Category, ICategoryDoc } from "../models";
import { connectDB } from "./db.server";
import { faker } from "@faker-js/faker";

// Interface for Category input (used for create and update)
interface CategoryInput {
  name: string;
  slug?: string;
  catID: string;
}

// Connect to database before operations
const ensureDBConnection = async () => {
  await connectDB();
};

// Create a new category
export const createCategory = async (
  input: CategoryInput
): Promise<ICategoryDoc> => {
  await ensureDBConnection();

  const { name, catID } = input;
  const slug = input.slug || faker.helpers.slugify(name).toLowerCase();
  const id = faker.string.uuid();
  const createdAt = new Date().toISOString();
  const updatedAt = createdAt;

  try {
    const category = await Category.create({
      id,
      catID,
      name,
      slug,
      createdAt,
      updatedAt,
    });
    return category;
  } catch (error) {
    throw new Error(`Failed to create category: ${(error as Error).message}`);
  }
};

// Get all categories
export const getAllCategories = async (): Promise<ICategoryDoc[]> => {
  await ensureDBConnection();

  try {
    const categories = await Category.find();
    return categories;
  } catch (error) {
    throw new Error(`Failed to fetch categories: ${(error as Error).message}`);
  }
};

// Get a category by ID
export const getCategoryById = async (
  id: string
): Promise<ICategoryDoc | null> => {
  await ensureDBConnection();

  try {
    const category = await Category.findOne({ id });
    if (!category) {
      throw new Error(`Category with ID ${id} not found`);
    }
    return category;
  } catch (error) {
    throw new Error(`Failed to fetch category: ${(error as Error).message}`);
  }
};

// Update a category by ID
export const updateCategory = async (
  id: string,
  input: Partial<CategoryInput>
): Promise<ICategoryDoc> => {
  await ensureDBConnection();

  try {
    const category = await Category.findOne({ id });
    if (!category) {
      throw new Error(`Category with ID ${id} not found`);
    }

    if (input.name) {
      category.name = input.name;
      category.slug =
        input.slug || faker.helpers.slugify(input.name).toLowerCase();
    }
    if (input.catID) {
      category.catID = input.catID;
    }
    category.updatedAt = new Date().toISOString();

    await category.save();
    return category;
  } catch (error) {
    throw new Error(`Failed to update category: ${(error as Error).message}`);
  }
};

// Delete a category by ID
export const deleteCategory = async (id: string): Promise<void> => {
  await ensureDBConnection();

  try {
    const category = await Category.findOneAndDelete({ id });
    if (!category) {
      throw new Error(`Category with ID ${id} not found`);
    }
  } catch (error) {
    throw new Error(`Failed to delete category: ${(error as Error).message}`);
  }
};
