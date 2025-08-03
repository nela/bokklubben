import {
	pgTable,
	foreignKey,
	unique,
	uuid,
	varchar,
	smallint,
	pgEnum,
	timestamp
} from 'drizzle-orm/pg-core';
import { authUsers } from 'drizzle-orm/supabase';

export const appRole = pgEnum('app_role', ['admin', 'regular']);

export const members = pgTable(
	'members',
	{
		id: smallint('id')
			.primaryKey()
			.generatedAlwaysAsIdentity({ name: 'members_id_seq', startWith: 1, increment: 1 }),
		fkAuthId: uuid('fk_auth_id'),
		firstname: varchar('firstname', { length: 256 }).notNull(),
		lastname: varchar('lastname', { length: 256 }).notNull(),
		username: varchar('username', { length: 256 }),
		email: varchar('email', { length: 256 }).notNull(),
		memberSince: timestamp('member_since', { withTimezone: true }).defaultNow().notNull(),
		memberTo: timestamp('member_to', { withTimezone: true }),
		appRole: appRole('app_role').notNull().default('regular')
	},
	(t) => [
		foreignKey({
			columns: [t.fkAuthId],
			foreignColumns: [authUsers.id],
			name: 'fk_auth_id_auth_id'
		}).onDelete('cascade'),
		// unique('uq_fk_auth_id_key').on(t.fkAuthId),
		unique('uq_member_email_key').on(t.email)
	]
).enableRLS();

/* export const profileAuth = pgTable(
	'profile_auth',
	{
		fkProfileId: smallint('fk_profile_id').notNull(),
		fkAuthId: uuid('fk_auth_id').notNull()
	},
	(t) => [
		foreignKey({
			columns: [t.fkProfileId],
			foreignColumns: [profiles.id],
			name: 'fk_profile_id_profiles_id'
		}).onDelete('cascade'),
		foreignKey({
			columns: [t.fkAuthId],
			foreignColumns: [authUsers.id],
			name: 'fk_auth_id_auth_id'
		}).onDelete('cascade'),
		unique('uq_fk_profile_id_key').on(t.fkProfileId),
		unique('uq_fk_auth_id_key').on(t.fkAuthId)
	]
).enableRLS(); */

export const clubTitles = pgTable(
	'club_titles',
	{
		id: smallint('id')
			.primaryKey()
			.generatedAlwaysAsIdentity({ name: 'club_title_id_seq', startWith: 1, increment: 1 }),
		name: varchar('name', { length: 32 }).notNull()
	},
	(t) => [unique('uq_club_title_name_key').on(t.name)]
).enableRLS();

export const memberClubTitle = pgTable(
	'member_club_title',
	{
		fkMemberId: smallint('fk_member_id').notNull(),
		fkClubTitleId: smallint('fk_club_title_id').notNull()
	},
	(t) => [
		foreignKey({
			columns: [t.fkMemberId],
			foreignColumns: [members.id],
			name: 'fk_member_id_members_id'
		}).onDelete('cascade'),
		foreignKey({
			columns: [t.fkClubTitleId],
			foreignColumns: [clubTitles.id],
			name: 'fk_bk_title_id_bk_titles_it'
		}).onDelete('cascade')
	]
).enableRLS();
