import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { Kysely, PostgresDialect } from 'kysely';
import { Pool } from 'pg';

describe('Database Connection', () => {
  let db: Kysely;

  beforeAll(() => {
    process.env.DATABASE_URL = process.env.DATABASE_URL || 'postgresql://saas_user:saas_password@localhost:5432/saas_dev';
    
    db = new Kysely({
      dialect: new PostgresDialect({
        pool: new Pool({
          connectionString: process.env.DATABASE_URL,
        }),
      }),
    });
  });

  afterAll(async () => {
    await db.destroy();
  });

  it('should connect to PostgreSQL successfully', async () => {
    const result = await db.introspection.getTables();
    expect(result).toBeDefined();
    expect(Array.isArray(result)).toBe(true);
  });

  it('should execute a simple query', async () => {
    const result = await db.selectFrom('user').selectAll().execute();
    expect(Array.isArray(result)).toBe(true);
  });

  it('should handle connection errors gracefully', async () => {
    const invalidDb = new Kysely({
      dialect: new PostgresDialect({
        pool: new Pool({
          connectionString: 'postgresql://invalid:invalid@localhost:5432/invalid',
        }),
      }),
    });

    await expect(invalidDb.executeQuery({
      query: 'SELECT 1',
    })).rejects.toThrow();
  });
});