import 'dotenv/config';
import { readFileSync } from 'fs';
import { join } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Use standard PostgreSQL client for CI
async function runMigrations() {
  try {
    // Dynamically import pg only when needed (for CI)
    const { Client } = await import('pg');
    
    const client = new Client({
      connectionString: process.env.DATABASE_URL,
    });

    await client.connect();
    console.log('Connected to database');

    // Check if users table already exists
    const checkResult = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'users'
      );
    `);

    if (checkResult.rows[0]?.exists) {
      console.log('Users table already exists, skipping migration');
      await client.end();
      process.exit(0);
    }

    // Read migration file
    const migrationPath = join(__dirname, '..', 'drizzle', '0000_chunky_dazzler.sql');
    const migrationSQL = readFileSync(migrationPath, 'utf-8');

    // Execute migration
    await client.query(migrationSQL);
    console.log('Migration executed successfully');

    await client.end();
    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error.message);
    process.exit(1);
  }
}

runMigrations();
