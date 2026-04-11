import { Db, MongoClient } from "mongodb";

declare global {
  var __mongoClientPromise__: Promise<MongoClient> | undefined;
}

function getMongoClientPromise() {
  const uri = process.env.MONGODB_URI;

  if (!uri) {
    throw new Error("MONGODB_URI is not configured. Add it to your environment variables.");
  }

  if (!global.__mongoClientPromise__) {
    const client = new MongoClient(uri);
    global.__mongoClientPromise__ = client.connect();
  }

  return global.__mongoClientPromise__;
}

export async function getDatabase(): Promise<Db> {
  const databaseName = process.env.MONGODB_DB?.trim() || "northstar_studio";
  const client = await getMongoClientPromise();
  return client.db(databaseName);
}
