import {
	pgTable,
	foreignKey,
	unique,
	uuid,
	varchar,
	smallint,
	pgEnum,
	timestamp,
	text
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

export const clubTitles = pgTable(
	'club_titles',
	{
		id: smallint('id')
			.primaryKey()
			.generatedAlwaysAsIdentity({ name: 'club_titles_id_seq', startWith: 1, increment: 1 }),
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

export const meets = pgTable('meets', {
	id: smallint('id')
		.primaryKey()
		.generatedAlwaysAsIdentity({ name: 'books_id_seq', startWith: 1, increment: 1 }),
	date: timestamp('date', { withTimezone: true }).notNull(),
	place: varchar('place', { length: 256 }),
	address: varchar('address', { length: 256 }),
	notes: text('notes'),
	summary: text('summary'),
	highlights: text('highlights')
});

export const meetAttendance = pgTable(
	'meet_attendance',
	{
		fkMeetId: smallint('fk_meet_id').notNull(),
		fkMemberId: smallint('fk_member_id').notNull()
	},
	(t) => [
		foreignKey({
			columns: [t.fkMemberId],
			foreignColumns: [members.id],
			name: 'fk_member_id_members_id'
		}),
		foreignKey({
			columns: [t.fkMeetId],
			foreignColumns: [meets.id],
			name: 'fk_meet_id_meets_id'
		})
	]
);

export const books = pgTable('books', {
	id: smallint('id')
		.primaryKey()
		.generatedAlwaysAsIdentity({ name: 'books_id_seq', startWith: 1, increment: 1 }),
	author: varchar('author', { length: 256 }).notNull(),
	title: varchar('title', { length: 256 }).notNull(),
	firstPublished: smallint('first_published').notNull(),
	pages: smallint('pages').notNull(),
	isbn: varchar('isbn', { length: 16 }).notNull(),
	originalLanguage: varchar('original_language', { length: 16 }),
	description: text('description')
});

export const bookStatus = pgEnum('book_status', ['elected', 'pitched']);

export const bookState = pgTable(
	'book_status',
	{
		status: bookStatus('book_status').notNull(),
		fkBookId: smallint('fk_book_id').notNull(),
		fkMeetId: smallint('fk_meet_id')
	},
	(t) => [
		foreignKey({
			columns: [t.fkBookId],
			foreignColumns: [books.id],
			name: 'fk_book_id_books_id'
		}),
		foreignKey({
			columns: [t.fkMeetId],
			foreignColumns: [meets.id],
			name: 'fk_meet_id_meets_id'
		})
	]
);
