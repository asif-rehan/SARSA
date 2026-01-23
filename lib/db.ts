import { Kysely, PostgresDialect } from "kysely";
import { Pool } from "pg";

// Database schema interfaces
interface User {
  id: string;
  name: string;
  email: string;
  emailVerified: boolean;
  image?: string;
  createdAt: Date;
  updatedAt: Date;
  stripeCustomerId?: string;
  role?: string;
  banned?: boolean;
  banReason?: string;
  banExpires?: Date;
  username?: string;
  displayUsername?: string;
  twoFactorEnabled?: boolean;
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

interface Subscription {
  id: string;
  plan: string;
  referenceId: string;
  stripeCustomerId?: string;
  stripeSubscriptionId?: string;
  status: string;
  periodStart?: Date;
  periodEnd?: Date;
  trialStart?: Date;
  trialEnd?: Date;
  cancelAtPeriodEnd?: boolean;
  cancelAt?: Date;
  canceledAt?: Date;
  endedAt?: Date;
  seats?: number;
}

interface Database {
  user: User;
  session: Session;
  account: Account;
  verification: Verification;
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
