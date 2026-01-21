import { Kysely, PostgresDialect } from "kysely";
import { Pool } from "pg";

// Database schema interfaces
interface User {
  id: string;
  email: string;
  name?: string;
  image?: string;
  emailVerified?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

interface Session {
  id: string;
  userId: string;
  expiresAt: Date;
  token: string;
  createdAt?: Date;
}

interface Account {
  id: string;
  userId: string;
  provider: string;
  providerAccountId: string;
  accessToken?: string;
  refreshToken?: string;
  expiresAt?: Date;
}

interface Verification {
  id: string;
  identifier: string;
  value: string;
  expiresAt: Date;
  createdAt?: Date;
}

interface Customer {
  id: string;
  user_id: string;
  stripe_customer_id: string;
  created_at?: Date;
  updated_at?: Date;
}

interface Subscription {
  id: string;
  user_id: string;
  stripe_subscription_id: string;
  stripe_customer_id?: string;
  status: string;
  price_id?: string;
  quantity?: number;
  cancel_at_period_end?: boolean;
  current_period_start?: Date;
  current_period_end?: Date;
  created_at?: Date;
  updated_at?: Date;
}

interface Database {
  user: User;
  session: Session;
  account: Account;
  verification: Verification;
  customer: Customer;
  subscription: Subscription;
}

const dialect = new PostgresDialect({
  pool: new Pool({
    connectionString: process.env.DATABASE_URL,
  }),
});

export const db = new Kysely<Database>({
  dialect,
});
