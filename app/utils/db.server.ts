import { MongoClient } from "mongodb";

declare global {
  // eslint-disable-next-line no-var
  var _mongoClientPromise: Promise<MongoClient> | undefined;
}

const uri = process.env.MONGODB_URI || "mongodb://localhost:27017";
const client = new MongoClient(uri);

const clientPromise: Promise<MongoClient> = (async () => {
  if (!global._mongoClientPromise) {
    global._mongoClientPromise = client.connect();
  }
  return global._mongoClientPromise;
})() as Promise<MongoClient>;

export async function getBlogCollection() {
  const client = await clientPromise;
  const db = client.db("blog");
  return db.collection("articles");
}
