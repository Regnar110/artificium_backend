import { Collection, MongoClient } from 'mongodb';
import dotenv from 'dotenv';

dotenv.config();

const uri = process.env.ATLAS_URI as string;

if (!uri) {
  throw new Error('Add Mongo URI to .env.local');
}

class MongoDBClient {
  private static instance: MongoClient;

  private constructor() {
    // Prywatny konstruktor, aby uniemożliwić tworzenie innych instancji
  }

  public static getInstance(): MongoClient {
    if (!MongoDBClient.instance) {
      MongoDBClient.instance = new MongoClient(uri);
      MongoDBClient.instance.connect();
    }

    return MongoDBClient.instance;
  }
  public static db_collection(collection_name:string) {
    return MongoDBClient.instance && MongoDBClient.instance.db("Artificium").collection(collection_name)
  }
}

export default MongoDBClient

export const {db_collection} = MongoDBClient