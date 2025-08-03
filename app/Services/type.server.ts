import { Type, ITypeDoc } from "../models";
import { connectDB } from "./db.server";
import { faker } from "@faker-js/faker";

// Interface for Type input (used for create and update)
interface TypeInput {
  name: string;
}

// Connect to database before operations
const ensureDBConnection = async () => {
  await connectDB();
};

// Create a new type
export const createType = async (input: TypeInput): Promise<ITypeDoc> => {
  await ensureDBConnection();

  const { name } = input;
  const id = faker.string.uuid();
  const createdAt = new Date().toISOString();
  const updatedAt = createdAt;

  try {
    const type = await Type.create({
      id,
      name,
      createdAt,
      updatedAt,
    });
    return type;
  } catch (error) {
    throw new Error(`Failed to create type: ${(error as Error).message}`);
  }
};

// Get all types
export const getAllTypes = async (): Promise<ITypeDoc[]> => {
  await ensureDBConnection();

  try {
    const types = await Type.find();
    return types;
  } catch (error) {
    throw new Error(`Failed to fetch types: ${(error as Error).message}`);
  }
};

// Get a type by ID
export const getTypeById = async (id: string): Promise<ITypeDoc | null> => {
  await ensureDBConnection();

  try {
    const type = await Type.findOne({ id });
    if (!type) {
      throw new Error(`Type with ID ${id} not found`);
    }
    return type;
  } catch (error) {
    throw new Error(`Failed to fetch type: ${(error as Error).message}`);
  }
};

// Update a type by ID
export const updateType = async (
  id: string,
  input: Partial<TypeInput>
): Promise<ITypeDoc> => {
  await ensureDBConnection();

  try {
    const type = await Type.findOne({ id });
    if (!type) {
      throw new Error(`Type with ID ${id} not found`);
    }

    if (input.name) {
      type.name = input.name;
    }
    type.updatedAt = new Date().toISOString();

    await type.save();
    return type;
  } catch (error) {
    throw new Error(`Failed to update type: ${(error as Error).message}`);
  }
};

// Delete a type by ID
export const deleteType = async (id: string): Promise<void> => {
  await ensureDBConnection();

  try {
    const type = await Type.findOneAndDelete({ id });
    if (!type) {
      throw new Error(`Type with ID ${id} not found`);
    }
  } catch (error) {
    throw new Error(`Failed to delete type: ${(error as Error).message}`);
  }
};
