import {
	pgTable,
	foreignKey,
	unique,
	uuid,
	varchar,
	smallint,
	pgEnum,
	timestamp,
	text,
	numeric,
    date
} from 'drizzle-orm/pg-core';
import { authUsers } from 'drizzle-orm/supabase';
import { customTypeNumeric } from './types';

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
		memberSince: date('member_since').defaultNow().notNull(),
		memberTo: date('member_to'),
		appRole: appRole('app_role').notNull().default('regular'),
		imageUrl: varchar('image_url', { length: 2048 }).notNull()
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
		.generatedAlwaysAsIdentity({ name: 'meets_id_seq', startWith: 1, increment: 1 }),
	datetime: timestamp('datetime', { withTimezone: true }).notNull(),
	location: varchar('location', { length: 256 }),
	address: varchar('address', { length: 256 }),
	notes: text('notes'),
	summary: text('summary'),
	highlights: text('highlights')
}).enableRLS();

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
).enableRLS();

export const authors = pgTable('authors', {
	id: smallint('id')
		.primaryKey()
		.generatedAlwaysAsIdentity({ name: 'authors_id_seq', startWith: 1, increment: 1 }),
	name: varchar('name', { length: 256 }).notNull(),
	description: text('description').notNull(),
	imageUrl: varchar('image_url', { length: 256 }).notNull()
}).enableRLS();

export const books = pgTable('books', {
	id: smallint('id')
		.primaryKey()
		.generatedAlwaysAsIdentity({ name: 'books_id_seq', startWith: 1, increment: 1 }),
	title: varchar('title', { length: 256 }).notNull(),
	firstPublished: smallint('first_published').notNull(),
	pages: smallint('pages').notNull(),
	awards: varchar('awards', { length: 512 }),
	originalLanguage: varchar('original_language', { length: 16 }).notNull(),
	description: text('description').notNull(),
	genre: varchar('genre', { length: 64 }).notNull(),
	read: date('read').notNull(),
	imageUrl: varchar('image_url', { length: 2048 }).notNull(),
	goodreadsRating: customTypeNumeric('goodreads_rating', { precision: 4, scale: 2 }).notNull()
}).enableRLS();

export const bookAuthor = pgTable(
	'book_author',
	{
		fkBookId: smallint('fk_book_id').notNull(),
		fkAuthorId: smallint('fk_author_id').notNull()
	},
	(t) =>
		[
			foreignKey({
				columns: [t.fkBookId],
				foreignColumns: [books.id],
				name: 'fk_book_id_books_id'
			}).onDelete('cascade'),
			foreignKey({
				columns: [t.fkAuthorId],
				foreignColumns: [authors.id],
				name: 'fk_author_id_authors_id'
			}).onDelete('cascade')
		]
).enableRLS();

export const bookStatus = pgEnum('book_status', ['elected', 'pitched']);

export const bookMeet = pgTable(
	'book_meet',
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
		}).onDelete('cascade'),
		foreignKey({
			columns: [t.fkMeetId],
			foreignColumns: [meets.id],
			name: 'fk_meet_id_meets_id'
		}).onDelete('cascade')
	]
).enableRLS();
