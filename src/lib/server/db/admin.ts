/** Queries and changes for the admin pages. The site's own reads live in queries.ts. */

import { and, asc, count, eq, isNotNull, sql } from 'drizzle-orm';
import { fromPromise, type ResultAsync } from 'neverthrow';
import type {
	AdminAuthorListItem,
	AdminMeet,
	AdminMeetListItem,
	MemberOption
} from '$lib/dto/admin';
import { toDbError, type DbError } from '$lib/errors/db';
import type { MeetInput } from '$lib/server/admin/schemas';
import { createSlug } from '$lib/utils/helpers';
import { db } from './index';
import { authors, bookAuthors, books, meetBooks, meets, members } from './schema';

/** All members, by first name, for selects such as a meet's host. */
export function fetchMemberOptions(): ResultAsync<Array<MemberOption>, DbError> {
	return fromPromise(
		db
			.select({ id: members.id, firstName: members.firstName, lastName: members.lastName })
			.from(members)
			.orderBy(asc(members.firstName), asc(members.lastName)),
		toDbError
	).map((rows) => rows.map((m) => ({ id: m.id, name: `${m.firstName} ${m.lastName}` })));
}

/** Genres already used on books, for suggestions when typing one. */
export function fetchGenres(): ResultAsync<Array<string>, DbError> {
	return fromPromise(
		db
			.selectDistinct({ genre: books.genre })
			.from(books)
			.where(isNotNull(books.genre))
			.orderBy(asc(books.genre)),
		toDbError
	).map((rows) => rows.flatMap((r) => (r.genre ? [r.genre] : [])));
}

const meetBookColumns = {
	id: true,
	title: true,
	isbn: true,
	pages: true,
	firstPublished: true,
	genre: true,
	originalLanguage: true,
	description: true
} as const;

export function fetchAdminMeet(id: number): ResultAsync<AdminMeet | null, DbError> {
	return fromPromise(
		db.query.meets.findFirst({
			where: eq(meets.id, id),
			columns: {
				id: true,
				startsAt: true,
				hostId: true,
				location: true,
				address: true,
				notes: true
			},
			with: {
				meetBooks: {
					where: (mb, { eq }) => eq(mb.status, 'read'),
					orderBy: (mb, { asc }) => asc(mb.bookId),
					limit: 1,
					columns: { bookId: true },
					with: { book: { columns: meetBookColumns } }
				}
			}
		}),
		toDbError
	).map((meet) => {
		if (!meet) {
			return null;
		}
		const { meetBooks, ...rest } = meet;
		return { ...rest, book: meetBooks[0]?.book ?? null };
	});
}

/**
 * Creates (`id` null) or updates a meet and its book, in one transaction. Returns the meet's id.
 *
 * - The meet has no book yet: a book in the input is created and linked as read.
 * - The meet has a book: the input updates it. Without a book in the input it's left as is; the
 *   form requires the title, so that only happens if the browser skipped validation.
 */
export function saveMeet(
	id: number | null,
	{ meet, book }: MeetInput
): ResultAsync<number, DbError> {
	return fromPromise(
		db.transaction(async (tx) => {
			let meetId: number;
			if (id === null) {
				[{ id: meetId }] = await tx.insert(meets).values(meet).returning({ id: meets.id });
			} else {
				await tx.update(meets).set(meet).where(eq(meets.id, id));
				meetId = id;
			}

			if (!book) {
				return meetId;
			}

			// A genre that only differs in case from an existing one uses the existing spelling.
			const existingGenre = book.genre
				? await tx.query.books.findFirst({
						where: sql`lower(${books.genre}) = lower(${book.genre})`,
						columns: { genre: true }
					})
				: undefined;
			const values = {
				...book,
				genre: existingGenre?.genre ?? book.genre,
				slug: createSlug(book.title)
			};

			const current = await tx.query.meetBooks.findFirst({
				where: and(eq(meetBooks.meetId, meetId), eq(meetBooks.status, 'read')),
				orderBy: asc(meetBooks.bookId),
				columns: { bookId: true }
			});

			if (current) {
				await tx.update(books).set(values).where(eq(books.id, current.bookId));
			} else {
				const [created] = await tx.insert(books).values(values).returning({ id: books.id });
				await tx.insert(meetBooks).values({ meetId, bookId: created.id, status: 'read' });
			}

			return meetId;
		}),
		toDbError
	);
}

/** Also removes the meet's books and attendance. The books themselves stay. */
export function deleteMeet(id: number): ResultAsync<void, DbError> {
	return fromPromise(db.delete(meets).where(eq(meets.id, id)), toDbError).map(() => undefined);
}

/** All meets, newest first. */
export function fetchAdminMeets(): ResultAsync<Array<AdminMeetListItem>, DbError> {
	return fromPromise(
		db.query.meets.findMany({
			columns: { id: true, startsAt: true, location: true },
			with: {
				host: { columns: { firstName: true, lastName: true } },
				meetBooks: {
					where: (mb, { eq }) => eq(mb.status, 'read'),
					columns: { bookId: true },
					with: { book: { columns: { title: true } } }
				}
			},
			orderBy: (m, { desc }) => desc(m.startsAt)
		}),
		toDbError
	).map((rows) =>
		rows.map(({ host, meetBooks, ...meet }) => ({
			...meet,
			host: host ? `${host.firstName} ${host.lastName}` : null,
			books: meetBooks.map((mb) => mb.book.title)
		}))
	);
}

export function fetchAdminAuthors(): ResultAsync<Array<AdminAuthorListItem>, DbError> {
	return fromPromise(
		db
			.select({
				id: authors.id,
				name: authors.name,
				born: authors.born,
				died: authors.died,
				bookCount: count(bookAuthors.bookId)
			})
			.from(authors)
			.leftJoin(bookAuthors, eq(bookAuthors.authorId, authors.id))
			.groupBy(authors.id)
			.orderBy(asc(authors.name)),
		toDbError
	);
}
