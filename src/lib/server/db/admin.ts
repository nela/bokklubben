/** Queries and changes for the admin pages. The site's own reads live in queries.ts. */

import { and, asc, count, eq, inArray, isNotNull, ne, sql } from 'drizzle-orm';
import { fromPromise, type ResultAsync } from 'neverthrow';
import type {
	AdminAuthorListItem,
	AdminEmailTemplate,
	AdminElectedBook,
	AdminMeet,
	AdminMeetListItem,
	AdminMember,
	AdminMemberListItem,
	MemberOption
} from '$lib/dto/admin';
import { toDbError, type DbError } from '$lib/errors/db';
import type {
	AuthorInput,
	EmailTemplateInput,
	MeetBookInput,
	MeetInput,
	MeetPitchInput,
	MemberInput
} from '$lib/server/admin/schemas';
import { privateImageUrl } from '$lib/server/images';
import { createSlug, hasLeft, matchSpelling } from '$lib/utils/helpers';
import { db } from './index';
import {
	authors,
	bookAuthors,
	books,
	emailTemplates,
	meetAttendance,
	meetBooks,
	meets,
	members,
	user
} from './schema';

/** All members: current ones first, by member since, then those whose membership has ended. */
export function fetchAdminMembers(): ResultAsync<Array<AdminMemberListItem>, DbError> {
	return fromPromise(
		db
			.select({
				id: members.id,
				firstName: members.firstName,
				lastName: members.lastName,
				nickname: members.nickname,
				email: members.email,
				role: members.role,
				titles: members.titles,
				memberSince: members.memberSince,
				memberUntil: members.memberUntil,
				signedUp: sql<boolean>`${members.userId} is not null`
			})
			.from(members)
			.orderBy(asc(members.memberSince), asc(members.firstName)),
		toDbError
	).map((rows) => {
		const list = rows.map((m) => ({ ...m, former: hasLeft(m.memberUntil) }));
		return [...list.filter((m) => !m.former), ...list.filter((m) => m.former)];
	});
}

export function fetchAdminMember(id: number): ResultAsync<AdminMember | null, DbError> {
	return fromPromise(
		db
			.select({
				id: members.id,
				firstName: members.firstName,
				lastName: members.lastName,
				nickname: members.nickname,
				email: members.email,
				role: members.role,
				titles: members.titles,
				memberSince: members.memberSince,
				memberUntil: members.memberUntil,
				signedUp: sql<boolean>`${members.userId} is not null`,
				imagePath: members.imagePath
			})
			.from(members)
			.where(eq(members.id, id)),
		toDbError
	).map(([member]) => {
		if (!member) {
			return null;
		}
		const { imagePath, ...rest } = member;
		return { ...rest, imageUrl: privateImageUrl(imagePath) };
	});
}

/** The member fields that are saved; `imagePath` only when the photo changes. */
export type MemberUpdate = Omit<MemberInput, 'photo' | 'removePhoto'> & {
	imagePath?: string | null;
};

/**
 * Updates a member. For a member who has signed up, a changed email also changes their login's
 * email, or password login would stop matching. Returns the photo path from before the update, so
 * a replaced photo can be deleted.
 */
export function updateMember(
	id: number,
	input: MemberUpdate
): ResultAsync<{ previousImagePath: string | null }, DbError> {
	return fromPromise(
		db.transaction(async (tx) => {
			const [current] = await tx
				.select({ userId: members.userId, email: members.email, imagePath: members.imagePath })
				.from(members)
				.where(eq(members.id, id));

			await tx.update(members).set(input).where(eq(members.id, id));

			if (current?.userId && current.email.toLowerCase() !== input.email) {
				await tx.update(user).set({ email: input.email }).where(eq(user.id, current.userId));
			}
			return { previousImagePath: current?.imagePath ?? null };
		}),
		toDbError
	);
}

/**
 * Deletes a member and their login (`user`, which takes their sessions and login methods with it,
 * so they're logged out). Their attendance goes too; meets they hosted and books they pitched stay,
 * without them. Returns the photo path, so the file can be deleted.
 */
export function deleteMember(id: number): ResultAsync<{ imagePath: string | null }, DbError> {
	return fromPromise(
		db.transaction(async (tx) => {
			const [current] = await tx
				.select({ userId: members.userId, imagePath: members.imagePath })
				.from(members)
				.where(eq(members.id, id));

			if (current?.userId) {
				await tx.delete(user).where(eq(user.id, current.userId));
			}
			await tx.delete(members).where(eq(members.id, id));

			return { imagePath: current?.imagePath ?? null };
		}),
		toDbError
	);
}

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

/** All book titles, alphabetically, for suggestions when adding a pitch. */
export function fetchBookTitles(): ResultAsync<Array<string>, DbError> {
	return fromPromise(
		db.select({ title: books.title }).from(books).orderBy(asc(books.title)),
		toDbError
	).map((rows) => rows.map((r) => r.title));
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
 * Ids of the authors with these names. A name matches an existing author by slug (so case and
 * accents don't matter); any other name becomes a new author with just the name.
 */
async function findOrCreateAuthors(tx: Tx, names: Array<string>): Promise<Array<number>> {
	const wanted = new Map(
		names.map((name) => [createSlug(name), name] as const).filter(([slug]) => slug !== '')
	);
	const slugs = [...wanted.keys()];
	if (slugs.length === 0) {
		return [];
	}

	const existing = await tx
		.select({ id: authors.id, slug: authors.slug })
		.from(authors)
		.where(inArray(authors.slug, slugs));
	const missing = slugs.filter((slug) => !existing.some((a) => a.slug === slug));
	const created =
		missing.length > 0
			? await tx
					.insert(authors)
					.values(missing.map((slug) => ({ slug, name: wanted.get(slug)! })))
					.returning({ id: authors.id, slug: authors.slug })
			: [];

	return [...existing, ...created].map((a) => a.id);
}

/** Replaces a book's authors; see `findOrCreateAuthors`. */
async function setBookAuthors(tx: Tx, bookId: number, names: Array<string>) {
	const authorIds = await findOrCreateAuthors(tx, names);
	await tx.delete(bookAuthors).where(eq(bookAuthors.bookId, bookId));
	if (authorIds.length > 0) {
		await tx.insert(bookAuthors).values(authorIds.map((authorId) => ({ bookId, authorId })));
	}
}

/** The id of the book with this title (matched by slug), or of a new book with just the title. */
async function findOrCreateBook(tx: Tx, title: string): Promise<number | null> {
	const slug = createSlug(title);
	if (!slug) {
		return null;
	}
	const existing = await tx.query.books.findFirst({
		where: eq(books.slug, slug),
		columns: { id: true }
	});
	if (existing) {
		return existing.id;
	}
	const [created] = await tx.insert(books).values({ title, slug }).returning({ id: books.id });
	return created.id;
}

/**
 * Replaces a meet's pitched and elected books. A pitch's book and author are found by name or
 * created with just the name; an author is added to the book, never removed from it. The meet's
 * read book can't also be pitched at it, so such a row is skipped.
 */
async function setPitches(tx: Tx, meetId: number, pitches: Array<MeetPitchInput>) {
	const read = await tx
		.select({ bookId: meetBooks.bookId })
		.from(meetBooks)
		.where(and(eq(meetBooks.meetId, meetId), eq(meetBooks.status, 'read')));
	const readIds = new Set(read.map((r) => r.bookId));

	await tx.delete(meetBooks).where(and(eq(meetBooks.meetId, meetId), ne(meetBooks.status, 'read')));

	// One row per book; if the same book is listed twice, "elected" wins.
	const rows = new Map<number, typeof meetBooks.$inferInsert>();
	for (const pitch of pitches) {
		const bookId = await findOrCreateBook(tx, pitch.title);
		if (bookId === null || readIds.has(bookId)) {
			continue;
		}
		if (pitch.author) {
			const [authorId] = await findOrCreateAuthors(tx, [pitch.author]);
			if (authorId) {
				await tx.insert(bookAuthors).values({ bookId, authorId }).onConflictDoNothing();
			}
		}
		if (!rows.has(bookId) || pitch.status === 'elected') {
			rows.set(bookId, { meetId, bookId, status: pitch.status, pitchedBy: pitch.pitchedBy });
		}
	}

	if (rows.size > 0) {
		await tx.insert(meetBooks).values([...rows.values()]);
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
				notes: true,
				highlights: true
			},
			with: {
				attendance: { columns: { memberId: true } },
				meetBooks: {
					orderBy: (mb, { asc }) => asc(mb.bookId),
					columns: { bookId: true, status: true, pitchedBy: true },
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
		const { meetBooks, attendance, ...rest } = meet;
		const attendeeIds = attendance.map((a) => a.memberId);
		const pitches = meetBooks.flatMap(({ status, pitchedBy, book }) =>
			status === 'read'
				? []
				: [
						{
							title: book.title,
							author: book.bookAuthors[0]?.author.name ?? null,
							pitchedBy,
							status
						}
					]
		);

		const found = meetBooks.find((mb) => mb.status === 'read')?.book;
		if (!found) {
			return { ...rest, attendeeIds, pitches, book: null };
		}
		const { bookAuthors, ...book } = found;
		return {
			...rest,
			attendeeIds,
			pitches,
			book: { ...book, authors: bookAuthors.map((ba) => ba.author.name) }
		};
	});
}

/**
 * Creates (`id` null) or updates a meet, in one transaction. Returns the meet's id.
 *
 * - Attendance is replaced by the input's.
 * - The meet has no book yet: a book in the input is created and linked as read.
 * - The meet has a book: the input updates it. Without a book in the input it's left as is; the
 *   form requires the title, so that only happens if the browser skipped validation.
 * - The book's authors are replaced by the input's; see `setBookAuthors`.
 * - Pitched and elected books are replaced by the input's; see `setPitches`.
 */
export function saveMeet(
	id: number | null,
	{ meet, attendees, pitches, book }: MeetInput
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

			await tx.delete(meetAttendance).where(eq(meetAttendance.meetId, meetId));
			if (attendees.length > 0) {
				await tx.insert(meetAttendance).values(attendees.map((memberId) => ({ meetId, memberId })));
			}

			if (book) {
				await saveReadBook(tx, meetId, book);
			}
			await setPitches(tx, meetId, pitches);

			return meetId;
		}),
		toDbError
	);
}

/**
 * Saves the meet's read book:
 * - the meet already has one: it's updated;
 * - an existing book was chosen (`id`, e.g. the elected one): it's updated and linked as read;
 * - otherwise a new book is created and linked as read.
 */
async function saveReadBook(tx: Tx, meetId: number, book: MeetBookInput) {
	const { id: chosenId, authors: authorNames, ...fields } = book;
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
		if (chosenId !== null) {
			bookId = chosenId;
			await tx.update(books).set(values).where(eq(books.id, bookId));
		} else {
			[{ id: bookId }] = await tx.insert(books).values(values).returning({ id: books.id });
		}
		await tx
			.insert(meetBooks)
			.values({ meetId, bookId, status: 'read' })
			.onConflictDoUpdate({
				target: [meetBooks.meetId, meetBooks.bookId],
				set: { status: 'read' }
			});
	}

	await setBookAuthors(tx, bookId, authorNames);
}

/**
 * Books elected at a meet but not read at any meet yet, newest election first. Usually just the
 * one chosen for the next meet.
 */
export function fetchElectedBooks(): ResultAsync<Array<AdminElectedBook>, DbError> {
	return fromPromise(
		db.query.meetBooks.findMany({
			where: eq(meetBooks.status, 'elected'),
			columns: { bookId: true },
			with: {
				meet: { columns: { startsAt: true } },
				book: {
					columns: meetBookColumns,
					with: {
						bookAuthors: { with: { author: { columns: { name: true } } } },
						meetBooks: {
							where: (mb, { eq }) => eq(mb.status, 'read'),
							columns: { meetId: true }
						}
					}
				}
			}
		}),
		toDbError
	).map((rows) => {
		const latest = new Map<number, AdminElectedBook>();
		for (const { meet, book } of rows) {
			const { bookAuthors, meetBooks: readAt, ...fields } = book;
			const known = latest.get(book.id);
			if (readAt.length > 0 || (known && known.electedAt >= meet.startsAt)) {
				continue;
			}
			latest.set(book.id, {
				...fields,
				authors: bookAuthors.map((ba) => ba.author.name),
				electedAt: meet.startsAt
			});
		}
		return [...latest.values()].sort((a, b) => b.electedAt.getTime() - a.electedAt.getTime());
	});
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

const emailTemplateColumns = {
	id: emailTemplates.id,
	name: emailTemplates.name,
	subject: emailTemplates.subject,
	body: emailTemplates.body,
	updatedAt: emailTemplates.updatedAt
};

/** All email templates, by name. */
export function fetchEmailTemplates(): ResultAsync<Array<AdminEmailTemplate>, DbError> {
	return fromPromise(
		db.select(emailTemplateColumns).from(emailTemplates).orderBy(asc(emailTemplates.name)),
		toDbError
	);
}

export function fetchEmailTemplate(id: number): ResultAsync<AdminEmailTemplate | null, DbError> {
	return fromPromise(
		db.select(emailTemplateColumns).from(emailTemplates).where(eq(emailTemplates.id, id)),
		toDbError
	).map(([template]) => template ?? null);
}

/** Returns the new template's id. */
export function createEmailTemplate(input: EmailTemplateInput): ResultAsync<number, DbError> {
	return fromPromise(
		db.insert(emailTemplates).values(input).returning({ id: emailTemplates.id }),
		toDbError
	).map(([row]) => row.id);
}

export function updateEmailTemplate(
	id: number,
	input: EmailTemplateInput
): ResultAsync<number, DbError> {
	return fromPromise(
		db.update(emailTemplates).set(input).where(eq(emailTemplates.id, id)),
		toDbError
	).map(() => id);
}

export function deleteEmailTemplate(id: number): ResultAsync<void, DbError> {
	return fromPromise(db.delete(emailTemplates).where(eq(emailTemplates.id, id)), toDbError).map(
		() => undefined
	);
}
