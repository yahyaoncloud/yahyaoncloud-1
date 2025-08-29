import { MongoClient } from "mongodb";

declare global {
  // eslint-disable-next-line no-var
  var _mongoClient: MongoClient | undefined;
}

const MAX_POOL_SIZE = 10;
const SERVER_SELECTION_TIMEOUT = 30000;

const uri = process.env.MONGODB_URI || "mongodb://localhost:27017";
const options = {};

let client: MongoClient;
let clientPromise: Promise<MongoClient>;

if (!global._mongoClient) {
  client = new MongoClient(uri, options);
  global._mongoClient = client;
  clientPromise = client.connect();
} else {
  client = global._mongoClient;
  clientPromise = Promise.resolve(client);
}

export async function getBlogCollection() {
  const client = await clientPromise;
  const db = client.db(process.env.MONGODB_DB || "blog");
  return db.collection("articles");
}
