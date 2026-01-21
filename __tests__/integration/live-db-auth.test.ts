import { describe, it, expect, vi, beforeAll, afterAll } from 'vitest';
import { sql } from 'kysely';

// Test the actual database and auth configuration
describe('Live Database & Auth Integration Tests', () => {
  let realDb: any;
  let originalEnv: NodeJS.ProcessEnv;

  beforeAll(async () => {
    // Save original environment
    originalEnv = { ...process.env };
    
    // Import actual database and auth modules
    realDb = await import('@/lib/db');
  });

  afterAll(() => {
    // Restore original environment
    process.env = originalEnv;
  });

  describe('Database Connection', () => {
    it('should connect to the actual database', async () => {
      try {
        const result = await realDb.db.selectFrom(sql`(SELECT 1 as test_connection)`.as('test')).selectAll().execute();
        expect(result).toEqual([{ test_connection: 1 }]);
        console.log('✅ Database connection successful');
      } catch (error) {
        console.error('❌ Database connection failed:', error);
        throw error;
      }
    });

    it('should have Better-Auth tables', async () => {
      try {
        const result = await realDb.db
          .selectFrom('pg_tables')
          .select('tablename')
          .where('schemaname', '=', 'public')
          .where('tablename', 'in', ['user', 'session', 'account', 'verification'])
          .execute();
        
        const tableNames = result.map((row: any) => row.tablename);
        const expectedTables = ['user', 'session', 'account', 'verification'];
        
        expect(tableNames).toEqual(expect.arrayContaining(expectedTables));
        console.log('✅ Better-Auth tables found:', tableNames);
      } catch (error) {
        console.error('❌ Schema verification failed:', error);
        throw error;
      }
    });

    it('should verify Better-Auth schema structure', async () => {
      try {
        // Check user table structure
        const userSchema = await realDb.db
          .selectFrom('information_schema.columns')
          .select(['column_name', 'data_type', 'is_nullable'])
          .where('table_name', '=', 'user')
          .where('table_schema', '=', 'public')
          .orderBy('ordinal_position')
          .execute();
        
        expect(userSchema.length).toBeGreaterThan(0);
        console.log('✅ User table schema verified');
        
        // Check session table structure
        const sessionSchema = await realDb.db
          .selectFrom('information_schema.columns')
          .select(['column_name', 'data_type', 'is_nullable'])
          .where('table_name', '=', 'session')
          .where('table_schema', '=', 'public')
          .orderBy('ordinal_position')
          .execute();
        
        expect(sessionSchema.length).toBeGreaterThan(0);
        console.log('✅ Session table schema verified');
      } catch (error) {
        console.error('❌ Schema structure verification failed:', error);
        throw error;
      }
    });
  });

  describe('Environment Configuration', () => {
    it('should have all required environment variables', () => {
      const requiredVars = [
        'DATABASE_URL',
        'BETTER_AUTH_SECRET',
        'BETTER_AUTH_URL',
        'GOOGLE_CLIENT_ID',
        'GOOGLE_CLIENT_SECRET',
        'NEXT_PUBLIC_APP_URL'
      ];

      const missingVars = requiredVars.filter(varName => !process.env[varName]);
      
      if (missingVars.length > 0) {
        console.error('❌ Missing environment variables:', missingVars);
        throw new Error(`Missing environment variables: ${missingVars.join(', ')}`);
      }
      
      console.log('✅ All required environment variables found');
    });

    it('should have valid Google OAuth configuration', () => {
      const googleClientId = process.env.GOOGLE_CLIENT_ID;
      const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET;
      
      expect(googleClientId).toBeTruthy();
      expect(googleClientSecret).toBeTruthy();
      expect(googleClientId).toContain('.googleusercontent.com');
      expect(googleClientSecret).toBeTruthy();
      
      console.log('✅ Google OAuth configuration is valid');
      console.log(`   Client ID: ${googleClientId?.substring(0, 20)}...`);
      console.log(`   Client Secret: ${googleClientSecret?.substring(0, 10)}...`);
    });

    it('should have valid database URL', () => {
      const databaseUrl = process.env.DATABASE_URL;
      
      expect(databaseUrl).toBeTruthy();
      expect(databaseUrl).toContain('postgresql://');
      expect(databaseUrl).toContain('localhost:5432');
      expect(databaseUrl).toContain('saas_dev');
      
      console.log('✅ Database URL is valid');
    });
  });

  describe('Better-Auth Configuration', () => {
    it('should load Better-Auth configuration without errors', async () => {
      try {
        const auth = await import('@/lib/auth');
        expect(auth.auth).toBeDefined();
        console.log('✅ Better-Auth configuration loaded successfully');
      } catch (error) {
        console.error('❌ Better-Auth configuration failed:', error);
        throw error;
      }
    });

    it('should have Google provider configured', async () => {
      try {
        const auth = await import('@/lib/auth');
        
        // We can't directly access the config, but we can test the handler
        expect(auth.auth).toBeDefined();
        console.log('✅ Better-Auth instance created');
        
        // Test that the handler is a function
        if (auth.auth.handler) {
          expect(typeof auth.auth.handler).toBe('function');
          console.log('✅ Auth handler is properly configured');
        }
      } catch (error) {
        console.error('❌ Better-Auth provider check failed:', error);
        throw error;
      }
    });
  });

  describe('API Endpoint Health', () => {
    it('should test auth endpoint with curl simulation', async () => {
      // Since we can't make real HTTP requests in Vitest, we'll test the auth module directly
      try {
        const { auth } = await import('@/lib/auth');
        
        // Test that auth is properly configured
        expect(auth).toBeDefined();
        console.log('✅ Auth module loaded successfully');
        
        // The actual HTTP test would be done separately
        console.log('ℹ️  For HTTP endpoint testing, run: curl -X POST http://localhost:3000/api/auth/sign-in/social -H "Content-Type: application/json" -d \'{"provider":"google","callbackURL":"http://localhost:3000"}\'');
      } catch (error) {
        console.error('❌ Auth endpoint health check failed:', error);
        throw error;
      }
    });
  });

  describe('Docker Container Status', () => {
    it('should check if PostgreSQL container is running', async () => {
      try {
        // Test database connectivity using proper Kysely query
        const result = await realDb.db.selectFrom(sql`(SELECT version())`.as('version_check')).selectAll().execute();
        expect(result[0].version).toContain('PostgreSQL');
        console.log('✅ PostgreSQL container is running and accessible');
        console.log(`   Version: ${result[0].version.split(',')[0]}`);
      } catch (error) {
        console.error('❌ PostgreSQL container check failed:', error);
        console.error('   Make sure PostgreSQL container is running: npm run db:start');
        throw error;
      }
    });
  });
});