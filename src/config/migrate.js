import { sql } from './database.js';
import logger from './logger.js';
import { readFileSync, existsSync } from 'fs';
import { join } from 'path';

export const runMigrations = async () => {
  try {
    logger.info('Checking database connection and tables...');

    // check if users table exists
    let tableExists = false;
    try {
      const result = await sql`
        SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_schema = 'public' 
          AND table_name = 'users'
        );
      `;
      tableExists = result[0]?.exists || false;
    } catch (checkError) {
      logger.warn(
        'Could not check if table exists, will attempt to create:',
        checkError.message
      );
      // continue to try migration anyway
    }

    if (tableExists) {
      logger.info('Database tables already exist, skipping migrations');
      return;
    }

    logger.info('Users table does not exist, running migrations...');

    // try to read migration file from project root
    const migrationPath = join(
      process.cwd(),
      'drizzle/0000_chunky_dazzler.sql'
    );
    logger.info(`Looking for migration file at: ${migrationPath}`);

    let migrationSQL;
    if (existsSync(migrationPath)) {
      migrationSQL = readFileSync(migrationPath, 'utf-8');
      logger.info('Migration file found, executing SQL...');
    } else {
      logger.warn('Migration file not found, creating table directly...');
      // fallback: create table directly
      migrationSQL = `
        CREATE TABLE IF NOT EXISTS "users" (
          "id" serial PRIMARY KEY NOT NULL,
          "name" varchar(255) NOT NULL,
          "email" varchar(255) NOT NULL,
          "password" varchar(255) NOT NULL,
          "role" varchar(50) DEFAULT 'user' NOT NULL,
          "created_at" timestamp DEFAULT now() NOT NULL,
          "updated_at" timestamp DEFAULT now() NOT NULL,
          CONSTRAINT "users_email_unique" UNIQUE("email")
        );
      `;
    }

    // execute migration
    await sql.unsafe(migrationSQL);

    logger.info('Database migrations completed successfully');

    // verify table was created
    const verifyResult = await sql`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'users'
      );
    `;

    if (verifyResult[0]?.exists) {
      logger.info('Verified: users table created successfully');
    } else {
      logger.warn('Warning: users table may not have been created');
    }
  } catch (error) {
    logger.error('Migration error:', {
      message: error.message,
      code: error.code,
      stack: error.stack,
    });
    // re-throw so we know migrations failed
    throw new Error(`Migration failed: ${error.message}`);
  }
};
