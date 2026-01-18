import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { Kysely, PostgresDialect } from 'kysely';
import { Pool } from 'pg';

describe('Database Health Check', () => {
  let db: Kysely;

  beforeAll(() => {
    process.env.DATABASE_URL = process.env.DATABASE_URL || 'postgresql://saas_user:saas_password@localhost:5433/saas_dev';
    
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

  it('should verify all required tables exist', async () => {
    const tables = await db.introspection.getTables();
    const tableNames = tables.map(t => t.name);
    
    expect(tableNames).toContain('user');
    expect(tableNames).toContain('session');
    expect(tableNames).toContain('account');
    expect(tableNames).toContain('verification');
  });

  it('should perform CRUD operations on test table', async () => {
    const testTableName = 'test_table';
    
    await db.schema
      .createTable(testTableName)
      .addColumn('id', 'varchar(255)', (col) => col.primaryKey())
      .addColumn('name', 'varchar(255)')
      .execute();

    await db.insertInto(testTableName)
      .values({ id: '1', name: 'test' })
      .execute();

    const result = await db.selectFrom(testTableName)
      .selectAll()
      .execute();

    expect(result).toHaveLength(1);
    expect(result[0].name).toBe('test');

    await db.schema.dropTable(testTableName).execute();
  });
});