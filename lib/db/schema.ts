import { pgTable, text, timestamp, boolean, serial, integer } from 'drizzle-orm/pg-core'

// --- Better Auth required tables -------------------------------------------
// Column names are camelCase to match Better Auth's defaults. Do not rename.

export const user = pgTable('user', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  emailVerified: boolean('emailVerified').notNull().default(false),
  image: text('image'),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
  updatedAt: timestamp('updatedAt').notNull().defaultNow(),
})

export const session = pgTable('session', {
  id: text('id').primaryKey(),
  expiresAt: timestamp('expiresAt').notNull(),
  token: text('token').notNull().unique(),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
  updatedAt: timestamp('updatedAt').notNull().defaultNow(),
  ipAddress: text('ipAddress'),
  userAgent: text('userAgent'),
  userId: text('userId')
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' }),
})

export const account = pgTable('account', {
  id: text('id').primaryKey(),
  accountId: text('accountId').notNull(),
  providerId: text('providerId').notNull(),
  userId: text('userId')
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' }),
  accessToken: text('accessToken'),
  refreshToken: text('refreshToken'),
  idToken: text('idToken'),
  accessTokenExpiresAt: timestamp('accessTokenExpiresAt'),
  refreshTokenExpiresAt: timestamp('refreshTokenExpiresAt'),
  scope: text('scope'),
  password: text('password'),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
  updatedAt: timestamp('updatedAt').notNull().defaultNow(),
})

export const verification = pgTable('verification', {
  id: text('id').primaryKey(),
  identifier: text('identifier').notNull(),
  value: text('value').notNull(),
  expiresAt: timestamp('expiresAt').notNull(),
  createdAt: timestamp('createdAt').defaultNow(),
  updatedAt: timestamp('updatedAt').defaultNow(),
})

// --- App tables ------------------------------------------------------------

// The protected content. Only the owner (scoped by userId) can read/edit this
// through the dashboard. The raw `content` is never exposed except through the
// key-gated delivery endpoint. Content is provided by the owner — never seeded.
export const scripts = pgTable('scripts', {
  id: serial('id').primaryKey(),
  userId: text('userId').notNull(),
  name: text('name').notNull(),
  // The raw protected payload the owner pastes in. Optionally obfuscated at
  // delivery time before being sent to a client.
  content: text('content').notNull().default(''),
  // Whether delivery should run the obfuscation pass before sending.
  obfuscate: boolean('obfuscate').notNull().default(true),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
  updatedAt: timestamp('updatedAt').notNull().defaultNow(),
})

// License keys that gate access to a script's content via the delivery API.
export const licenseKeys = pgTable('license_keys', {
  id: serial('id').primaryKey(),
  userId: text('userId').notNull(),
  // Which script this key unlocks.
  scriptId: integer('scriptId').notNull(),
  // The random key string the client presents.
  key: text('key').notNull().unique(),
  // Human label so the owner knows who this key is for.
  label: text('label').notNull().default(''),
  // Hardware id this key locks to. Null until first use, then pinned.
  hwid: text('hwid'),
  // Null = never expires. Otherwise the key stops working after this time.
  expiresAt: timestamp('expiresAt'),
  // Owner can instantly disable a key without deleting it.
  active: boolean('active').notNull().default(true),
  // Usage telemetry.
  uses: integer('uses').notNull().default(0),
  lastUsedAt: timestamp('lastUsedAt'),
  lastIp: text('lastIp'),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
})
