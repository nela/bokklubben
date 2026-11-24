/** Queries and changes for the admin pages. The site's own reads live in queries.ts. */

import { and, asc, count, eq, inArray, isNotNull, sql } from 'drizzle-orm';
import { fromPromise, type ResultAsync } from 'neverthrow';
import type {
	AdminAuthorListItem,
	AdminMeet,
	AdminMeetListItem,
	MemberOption
} from '$lib/dto/admin';
import { toDbError, type DbError } from '$lib/errors/db';
import type { AuthorInput, MeetInput } from '$lib/server/admin/schemas';
import { createSlug, matchSpelling } from '$lib/utils/helpers';
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

/** Every genre used on a book, alphabetically. Works in and outside a transaction. */
const selectGenres = (q: Pick<typeof db, 'selectDistinct'>) =>
	q
		.selectDistinct({ genre: sql<string>`unnest(${books.genres})`.as('genre') })
		.from(books)
		.orderBy(sql`genre`)
		.then((rows) => rows.map((r) => r.genre));

/** Genres already used on books, for suggestions when typing one. */
export function fetchGenres(): ResultAsync<Array<string>, DbError> {
	return fromPromise(selectGenres(db), toDbError);
}

/** Every original language used on a book, alphabetically. Works in and outside a transaction. */
const selectLanguages = (q: Pick<typeof db, 'selectDistinct'>) =>
	q
		.selectDistinct({ language: books.originalLanguage })
		.from(books)
		.where(isNotNull(books.originalLanguage))
		.orderBy(asc(books.originalLanguage))
		.then((rows) => rows.flatMap((r) => (r.language ? [r.language] : [])));

/** Original languages already used on books, for suggestions when typing one. */
export function fetchLanguages(): ResultAsync<Array<string>, DbError> {
	return fromPromise(selectLanguages(db), toDbError);
}

/** All author names, alphabetically, for suggestions when adding a book's authors. */
export function fetchAuthorNames(): ResultAsync<Array<string>, DbError> {
	return fromPromise(
		db.select({ name: authors.name }).from(authors).orderBy(asc(authors.name)),
		toDbError
	).map((rows) => rows.map((r) => r.name));
}

/** Creates an author; the slug (used in URLs) comes from the name. Returns the saved name. */
export function createAuthor(input: AuthorInput): ResultAsync<{ name: string }, DbError> {
	return fromPromise(
		db
			.insert(authors)
			.values({ ...input, slug: createSlug(input.name) })
			.returning({ name: authors.name }),
		toDbError
	).map(([author]) => author);
}

type Tx = Parameters<Parameters<typeof db.transaction>[0]>[0];

/**
 * Sets a book's authors by name. A name matches an existing author by slug (so case and accents
 * don't matter); any other name becomes a new author with just the name.
 */
async function setBookAuthors(tx: Tx, bookId: number, names: Array<string>) {
	const wanted = new Map(
		names.map((name) => [createSlug(name), name] as const).filter(([slug]) => slug !== '')
	);
	const slugs = [...wanted.keys()];

	const existing =
		slugs.length > 0
			? await tx
					.select({ id: authors.id, slug: authors.slug })
					.from(authors)
					.where(inArray(authors.slug, slugs))
			: [];
	const missing = slugs.filter((slug) => !existing.some((a) => a.slug === slug));
	const created =
		missing.length > 0
			? await tx
					.insert(authors)
					.values(missing.map((slug) => ({ slug, name: wanted.get(slug)! })))
					.returning({ id: authors.id, slug: authors.slug })
			: [];

	await tx.delete(bookAuthors).where(eq(bookAuthors.bookId, bookId));
	const authorIds = [...existing, ...created].map((a) => a.id);
	if (authorIds.length > 0) {
		await tx.insert(bookAuthors).values(authorIds.map((authorId) => ({ bookId, authorId })));
	}
}

const meetBookColumns = {
	id: true,
	title: true,
	isbn: true,
	pages: true,
	firstPublished: true,
	genres: true,
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
					with: {
						book: {
							columns: meetBookColumns,
							with: { bookAuthors: { with: { author: { columns: { name: true } } } } }
						}
					}
				}
			}
		}),
		toDbError
	).map((meet) => {
		if (!meet) {
			return null;
		}
		const { meetBooks, ...rest } = meet;
		const found = meetBooks[0]?.book;
		if (!found) {
			return { ...rest, book: null };
		}
		const { bookAuthors, ...book } = found;
		return { ...rest, book: { ...book, authors: bookAuthors.map((ba) => ba.author.name) } };
	});
}

/**
 * Creates (`id` null) or updates a meet and its book, in one transaction. Returns the meet's id.
 *
 * - The meet has no book yet: a book in the input is created and linked as read.
 * - The meet has a book: the input updates it. Without a book in the input it's left as is; the
 *   form requires the title, so that only happens if the browser skipped validation.
 * - The book's authors are replaced by the input's; see `setBookAuthors`.
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

			const { authors: authorNames, ...fields } = book;
			const values = {
				...fields,
				genres: matchSpelling(fields.genres, await selectGenres(tx)),
				originalLanguage: fields.originalLanguage
					? matchSpelling([fields.originalLanguage], await selectLanguages(tx))[0]
					: null,
				slug: createSlug(fields.title)
			};

			const current = await tx.query.meetBooks.findFirst({
				where: and(eq(meetBooks.meetId, meetId), eq(meetBooks.status, 'read')),
				orderBy: asc(meetBooks.bookId),
				columns: { bookId: true }
			});

			let bookId: number;
			if (current) {
				bookId = current.bookId;
				await tx.update(books).set(values).where(eq(books.id, bookId));
			} else {
				[{ id: bookId }] = await tx.insert(books).values(values).returning({ id: books.id });
				await tx.insert(meetBooks).values({ meetId, bookId, status: 'read' });
			}

			await setBookAuthors(tx, bookId, authorNames);
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
