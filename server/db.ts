import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from '../shared/schema';

// Create postgres connection
const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error('DATABASE_URL environment variable is not set');
}

// For migrating the database (used in npm scripts)
export const migrationClient = postgres(connectionString, { max: 1 });

// For query purposes (used in the application)
const queryClient = postgres(connectionString);
export const db = drizzle(queryClient, { schema });