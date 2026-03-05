import { MongoClient, Db } from 'mongodb'

// Check for MongoDB URI
const uri = process.env.MONGODB_URI

if (!uri) {
  console.warn('⚠️ MONGODB_URI environment variable is missing. Database operations will be disabled.')
}

const options = {
  // Enhanced options for better Vercel compatibility
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverSelectionTimeoutMS: 30000, // Increased timeout for serverless
  socketTimeoutMS: 45000,
  family: 4, // Force IPv4 (helps with some Vercel networking issues)
  maxPoolSize: 10,
  retryWrites: true,
  // SSL options that work better with Vercel's infrastructure
  ssl: true,
  tlsAllowInvalidCertificates: false,
  tlsAllowInvalidHostnames: false,
}

let client: MongoClient | null = null
let clientPromise: Promise<MongoClient> | null = null

// Only create MongoDB client if URI is available
if (uri) {
  if (process.env.NODE_ENV === 'development') {
    // In development mode, use a global variable so that the value
    // is preserved across module reloads caused by HMR (Hot Module Replacement).
    let globalWithMongo = global as typeof globalThis & {
      _mongoClientPromise?: Promise<MongoClient>
    }

    if (!globalWithMongo._mongoClientPromise) {
      client = new MongoClient(uri, options)
      globalWithMongo._mongoClientPromise = client.connect()
    }
    clientPromise = globalWithMongo._mongoClientPromise
  } else {
    // In production mode, it's best to not use a global variable.
    client = new MongoClient(uri, options)
    clientPromise = client.connect()
  }
}

export async function getDatabase(): Promise<Db> {
  if (!uri || !clientPromise) {
    throw new Error('MONGODB_URI environment variable is not configured. Please add it to your environment variables.')
  }
  const client = await clientPromise
  return client.db('portfolio-blog')
}

// Helper function to check if database is available
export function isDatabaseAvailable(): boolean {
  return Boolean(uri && clientPromise)
}

// Export a module-scoped MongoClient promise. By doing this in a
// separate module, the client can be shared across functions.
export default clientPromise