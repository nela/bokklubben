/**
 * Tables owned by Better Auth. Property names must match what Better Auth expects;
 * column names are snake_cased by Drizzle's `casing` option.
 */
import { boolean, index, pgTable, text, timestamp, uniqueIndex } from 'drizzle-orm/pg-core';

const createdAt = () => timestamp({ withTimezone: true }).notNull().defaultNow();
const updatedAt = () =>
	timestamp({ withTimezone: true })
		.notNull()
		.defaultNow()
		.$onUpdate(() => new Date());

export const user = pgTable('user', {
	id: text().primaryKey(),
	name: text().notNull(),
	email: text().notNull().unique(),
	emailVerified: boolean().notNull().default(false),
	image: text(),
	createdAt: createdAt(),
	updatedAt: updatedAt()
});

export const session = pgTable(
	'session',
	{
		id: text().primaryKey(),
		userId: text()
			.notNull()
			.references(() => user.id, { onDelete: 'cascade' }),
		token: text().notNull().unique(),
		expiresAt: timestamp({ withTimezone: true }).notNull(),
		ipAddress: text(),
		userAgent: text(),
		createdAt: createdAt(),
		updatedAt: updatedAt()
	},
	(t) => [index('session_user_id_idx').on(t.userId)]
);

/** One row per login method: `credential` (password) or an OAuth provider. */
export const account = pgTable(
	'account',
	{
		id: text().primaryKey(),
		userId: text()
			.notNull()
			.references(() => user.id, { onDelete: 'cascade' }),
		providerId: text().notNull(),
		accountId: text().notNull(),
		password: text(),
		accessToken: text(),
		refreshToken: text(),
		idToken: text(),
		accessTokenExpiresAt: timestamp({ withTimezone: true }),
		refreshTokenExpiresAt: timestamp({ withTimezone: true }),
		scope: text(),
		createdAt: createdAt(),
		updatedAt: updatedAt()
	},
	(t) => [
		index('account_user_id_idx').on(t.userId),
		uniqueIndex('account_provider_account_idx').on(t.providerId, t.accountId)
	]
);

export const verification = pgTable(
	'verification',
	{
		id: text().primaryKey(),
		identifier: text().notNull(),
		value: text().notNull(),
		expiresAt: timestamp({ withTimezone: true }).notNull(),
		createdAt: createdAt(),
		updatedAt: updatedAt()
	},
	(t) => [index('verification_identifier_idx').on(t.identifier)]
);
