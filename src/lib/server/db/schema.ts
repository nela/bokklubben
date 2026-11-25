import { relations, sql } from 'drizzle-orm';
import {
	date,
	index,
	integer,
	numeric,
	pgEnum,
	pgTable,
	primaryKey,
	smallint,
	text,
	timestamp,
	uniqueIndex
} from 'drizzle-orm/pg-core';
import { user } from './auth-schema';

export * from './auth-schema';

const timestamps = {
	createdAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
	updatedAt: timestamp({ withTimezone: true })
		.notNull()
		.defaultNow()
		.$onUpdate(() => new Date())
};

export const appRole = pgEnum('app_role', ['admin', 'regular']);

/**
 * A book's relation to a meet:
 * - pitched: proposed at this meet
 * - elected: proposed and voted in at this meet
 * - read:    discussed at this meet (upcoming if the meet is in the future)
 */
export const meetBookStatus = pgEnum('meet_book_status', ['pitched', 'elected', 'read']);

export const members = pgTable(
	'members',
	{
		id: integer().primaryKey().generatedAlwaysAsIdentity(),
		/** Set when the member signs up; null for invited members who haven't yet. */
		userId: text()
			.unique('members_user_id_unique')
			.references(() => user.id, { onDelete: 'set null' }),
		firstName: text().notNull(),
		lastName: text().notNull(),
		nickname: text(),
		email: text().notNull(),
		role: appRole().notNull().default('regular'),
		memberSince: date({ mode: 'date' }).notNull().defaultNow(),
		memberUntil: date({ mode: 'date' }),
		/** Path in the private Blob store, or an absolute URL. See $lib/server/images. */
		imagePath: text(),
		...timestamps
	},
	(t) => [uniqueIndex('members_email_lower_idx').on(sql`lower(${t.email})`)]
);

/** Club titles, e.g. «Byråkraten». Added, renamed and removed in the admin. */
export const clubTitles = pgTable('club_titles', {
	id: integer().primaryKey().generatedAlwaysAsIdentity(),
	name: text().notNull().unique(),
	/** For the title's page, /members/titles/<slug>. */
	slug: text().notNull().unique(),
	...timestamps
});

/** Which members hold which titles. */
export const memberTitles = pgTable(
	'member_titles',
	{
		memberId: integer()
			.notNull()
			.references(() => members.id, { onDelete: 'cascade' }),
		titleId: integer()
			.notNull()
			.references(() => clubTitles.id, { onDelete: 'cascade' })
	},
	(t) => [
		primaryKey({ columns: [t.memberId, t.titleId] }),
		index('member_titles_title_id_idx').on(t.titleId)
	]
);

export const authors = pgTable('authors', {
	id: integer().primaryKey().generatedAlwaysAsIdentity(),
	slug: text().notNull().unique(),
	name: text().notNull(),
	bio: text(),
	born: date({ mode: 'date' }),
	died: date({ mode: 'date' }),
	awards: text().array().notNull().default(sql`'{}'`),
	/** Path in the public Blob store, or an absolute URL. See $lib/server/images. */
	imagePath: text(),
	...timestamps
});

export const books = pgTable('books', {
	id: integer().primaryKey().generatedAlwaysAsIdentity(),
	slug: text().notNull().unique(),
	title: text().notNull(),
	isbn: text().unique(),
	description: text(),
	firstPublished: smallint(),
	pages: smallint(),
	originalLanguage: text(),
	/** Free text, so new genres need no migration. The admin suggests the ones already in use. */
	genres: text().array().notNull().default(sql`'{}'`),
	/** Goodreads rating, entered manually. */
	rating: numeric({ precision: 3, scale: 2, mode: 'number' }),
	awards: text().array().notNull().default(sql`'{}'`),
	/** Path in the public Blob store, or an absolute URL. See $lib/server/images. */
	imagePath: text(),
	...timestamps
});

export const bookAuthors = pgTable(
	'book_authors',
	{
		bookId: integer()
			.notNull()
			.references(() => books.id, { onDelete: 'cascade' }),
		authorId: integer()
			.notNull()
			.references(() => authors.id, { onDelete: 'cascade' })
	},
	(t) => [
		primaryKey({ columns: [t.bookId, t.authorId] }),
		index('book_authors_author_id_idx').on(t.authorId)
	]
);

export const meets = pgTable(
	'meets',
	{
		id: integer().primaryKey().generatedAlwaysAsIdentity(),
		startsAt: timestamp({ withTimezone: true }).notNull(),
		hostId: integer().references(() => members.id, { onDelete: 'set null' }),
		location: text(),
		address: text(),
		notes: text(),
		highlights: text(),
		...timestamps
	},
	(t) => [index('meets_starts_at_idx').on(t.startsAt)]
);

export const meetBooks = pgTable(
	'meet_books',
	{
		meetId: integer()
			.notNull()
			.references(() => meets.id, { onDelete: 'cascade' }),
		bookId: integer()
			.notNull()
			.references(() => books.id, { onDelete: 'cascade' }),
		status: meetBookStatus().notNull(),
		/** Who brought the book up (pitched/elected rows). */
		pitchedBy: integer().references(() => members.id, { onDelete: 'set null' })
	},
	(t) => [
		primaryKey({ columns: [t.meetId, t.bookId] }),
		index('meet_books_book_id_idx').on(t.bookId),
		index('meet_books_pitched_by_idx').on(t.pitchedBy)
	]
);

export const meetAttendance = pgTable(
	'meet_attendance',
	{
		meetId: integer()
			.notNull()
			.references(() => meets.id, { onDelete: 'cascade' }),
		memberId: integer()
			.notNull()
			.references(() => members.id, { onDelete: 'cascade' })
	},
	(t) => [
		primaryKey({ columns: [t.meetId, t.memberId] }),
		index('meet_attendance_member_id_idx').on(t.memberId)
	]
);

/**
 * Email templates written in the admin, e.g. an invitation. They live here rather than in the
 * code, which is public.
 */
export const emailTemplates = pgTable('email_templates', {
	id: integer().primaryKey().generatedAlwaysAsIdentity(),
	name: text().notNull().unique(),
	subject: text().notNull(),
	body: text().notNull(),
	updatedAt: timestamp({ withTimezone: true })
		.notNull()
		.defaultNow()
		.$onUpdate(() => new Date())
});

export const membersRelations = relations(members, ({ one, many }) => ({
	user: one(user, { fields: [members.userId], references: [user.id] }),
	memberTitles: many(memberTitles),
	hostedMeets: many(meets),
	pitches: many(meetBooks),
	attendance: many(meetAttendance)
}));

export const authorsRelations = relations(authors, ({ many }) => ({
	bookAuthors: many(bookAuthors)
}));

export const booksRelations = relations(books, ({ many }) => ({
	bookAuthors: many(bookAuthors),
	meetBooks: many(meetBooks)
}));

export const bookAuthorsRelations = relations(bookAuthors, ({ one }) => ({
	book: one(books, { fields: [bookAuthors.bookId], references: [books.id] }),
	author: one(authors, { fields: [bookAuthors.authorId], references: [authors.id] })
}));

export const meetsRelations = relations(meets, ({ one, many }) => ({
	host: one(members, { fields: [meets.hostId], references: [members.id] }),
	meetBooks: many(meetBooks),
	attendance: many(meetAttendance)
}));

export const meetBooksRelations = relations(meetBooks, ({ one }) => ({
	meet: one(meets, { fields: [meetBooks.meetId], references: [meets.id] }),
	book: one(books, { fields: [meetBooks.bookId], references: [books.id] }),
	pitcher: one(members, { fields: [meetBooks.pitchedBy], references: [members.id] })
}));

export const meetAttendanceRelations = relations(meetAttendance, ({ one }) => ({
	meet: one(meets, { fields: [meetAttendance.meetId], references: [meets.id] }),
	member: one(members, { fields: [meetAttendance.memberId], references: [members.id] })
}));

export const clubTitlesRelations = relations(clubTitles, ({ many }) => ({
	memberTitles: many(memberTitles)
}));

export const memberTitlesRelations = relations(memberTitles, ({ one }) => ({
	member: one(members, { fields: [memberTitles.memberId], references: [members.id] }),
	title: one(clubTitles, { fields: [memberTitles.titleId], references: [clubTitles.id] })
}));
