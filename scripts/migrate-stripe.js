const { Pool } = require('pg');
require('dotenv').config({ path: '.env.local' });

async function createStripeTables() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
  });

  try {
    console.log('Creating Stripe plugin tables...');

    // Create customer table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS customer (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
        stripe_customer_id TEXT NOT NULL UNIQUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Create subscription table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS subscription (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
        stripe_subscription_id TEXT NOT NULL UNIQUE,
        stripe_customer_id TEXT NOT NULL,
        status TEXT NOT NULL,
        price_id TEXT NOT NULL,
        quantity INTEGER DEFAULT 1,
        cancel_at_period_end BOOLEAN DEFAULT FALSE,
        current_period_start TIMESTAMP,
        current_period_end TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Create indexes
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_customer_user_id ON customer(user_id);
      CREATE INDEX IF NOT EXISTS idx_customer_stripe_id ON customer(stripe_customer_id);
      CREATE INDEX IF NOT EXISTS idx_subscription_user_id ON subscription(user_id);
      CREATE INDEX IF NOT EXISTS idx_subscription_stripe_id ON subscription(stripe_subscription_id);
    `);

    console.log('Stripe plugin tables created successfully!');
  } catch (error) {
    console.error('Error creating Stripe tables:', error);
    throw error;
  } finally {
    await pool.end();
  }
}

createStripeTables().catch(console.error);