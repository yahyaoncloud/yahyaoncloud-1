import { Tag, ITagDoc } from "../models";
import { connectDB } from "./db.server";
import { faker } from "@faker-js/faker";

// Interface for Tag input (used for create and update)
interface TagInput {
  name: string;
  tagID: string;
}

// Connect to database before operations
const ensureDBConnection = async () => {
  await connectDB();
};

// Create a new tag
export const createTag = async (input: TagInput): Promise<ITagDoc> => {
  await ensureDBConnection();

  const { name, tagID } = input;
  const id = faker.string.uuid();
  const createdAt = new Date().toISOString();
  const updatedAt = createdAt;

  try {
    const tag = await Tag.create({
      id,
      tagID,
      name,
      createdAt,
      updatedAt,
    });
    return tag;
  } catch (error) {
    throw new Error(`Failed to create tag: ${(error as Error).message}`);
  }
};

// Get all tags
export const getAllTags = async (): Promise<ITagDoc[]> => {
  await ensureDBConnection();

  try {
    const tags = await Tag.find();
    return tags;
  } catch (error) {
    throw new Error(`Failed to fetch tags: ${(error as Error).message}`);
  }
};

// Get a tag by ID
export const getTagById = async (id: string): Promise<ITagDoc | null> => {
  await ensureDBConnection();

  try {
    const tag = await Tag.findOne({ id });
    if (!tag) {
      throw new Error(`Tag with ID ${id} not found`);
    }
    return tag;
  } catch (error) {
    throw new Error(`Failed to fetch tag: ${(error as Error).message}`);
  }
};

// Update a tag by ID
export const updateTag = async (
  id: string,
  input: Partial<TagInput>
): Promise<ITagDoc> => {
  await ensureDBConnection();

  try {
    const tag = await Tag.findOne({ id });
    if (!tag) {
      throw new Error(`Tag with ID ${id} not found`);
    }

    if (input.name) {
      tag.name = input.name;
    }
    if (input.tagID) {
      tag.tagID = input.tagID;
    }
    tag.updatedAt = new Date().toISOString();

    await tag.save();
    return tag;
  } catch (error) {
    throw new Error(`Failed to update tag: ${(error as Error).message}`);
  }
};

// Delete a tag by ID
export const deleteTag = async (id: string): Promise<void> => {
  await ensureDBConnection();

  try {
    const tag = await Tag.findOneAndDelete({ id });
    if (!tag) {
      throw new Error(`Tag with ID ${id} not found`);
    }
  } catch (error) {
    throw new Error(`Failed to delete tag: ${(error as Error).message}`);
  }
};