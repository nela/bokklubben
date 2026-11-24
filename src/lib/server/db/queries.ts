import { asc, desc, eq, gte, sql } from 'drizzle-orm';
import { fromPromise, ResultAsync } from 'neverthrow';
import { toDbError, type DbError } from '$lib/errors/db';
import type { Author, Book, Meet, Member, PublicMember } from '$lib/dto/dto';
import { privateImageUrl, publicImageUrl } from '$lib/server/images';
import { db } from './index';
import { meets, members } from './schema';

const authorRef = { columns: { slug: true, name: true } } as const;

/** Swaps the stored image path for the URL the browser loads. */
const withImage =
	(toUrl: (path: string | null) => string | null) =>
	<T extends { imagePath: string | null }>({ imagePath, ...rest }: T) => ({
		...rest,
		imageUrl: toUrl(imagePath)
	});

const withMemberImage = withImage(privateImageUrl);
const withPublicImage = withImage(publicImageUrl);

export function fetchMemberByUserId(userId: string): ResultAsync<Member | null, DbError> {
	return fromPromise(
		db.query.members.findFirst({
			where: (m, { eq }) => eq(m.userId, userId),
			columns: {
				id: true,
				email: true,
				role: true,
				firstName: true,
				lastName: true,
				nickname: true,
				memberSince: true,
				memberUntil: true,
				titles: true,
				imagePath: true
			}
		}),
		toDbError
	).map((member) => (member ? withMemberImage(member) : null));
}

export function fetchMembers(): ResultAsync<Array<PublicMember>, DbError> {
	return fromPromise(
		db.query.members.findMany({
			columns: {
				firstName: true,
				lastName: true,
				nickname: true,
				memberSince: true,
				memberUntil: true,
				titles: true,
				imagePath: true
			},
			orderBy: [asc(members.memberSince), asc(members.firstName)]
		}),
		toDbError
	).map((rows) => rows.map(withMemberImage));
}

export function fetchMemberEmails(): ResultAsync<Array<string>, DbError> {
	return fromPromise(db.select({ email: members.email }).from(members), toDbError).map((rows) =>
		rows.map((r) => r.email)
	);
}

/** Books that have been, or are about to be, discussed at a meet. Newest first. */
export function fetchBooks(): ResultAsync<Array<Book>, DbError> {
	return fromPromise(
		db.query.books.findMany({
			columns: { createdAt: false, updatedAt: false, id: false },
			with: {
				bookAuthors: { with: { author: authorRef } },
				meetBooks: {
					where: (mb, { eq }) => eq(mb.status, 'read'),
					with: { meet: { columns: { startsAt: true } } }
				}
			}
		}),
		toDbError
	).map((rows) =>
		rows
			.filter((b) => b.meetBooks.length > 0)
			.map(({ bookAuthors, meetBooks, ...book }) => ({
				...withPublicImage(book),
				authors: bookAuthors.map((ba) => ba.author),
				readAt: new Date(Math.min(...meetBooks.map((mb) => mb.meet.startsAt.getTime())))
			}))
			.sort((a, b) => b.readAt.getTime() - a.readAt.getTime())
	);
}

/** Authors of books the club has read, with only those books. */
export function fetchAuthors(): ResultAsync<Array<Author>, DbError> {
	return fromPromise(
		db.query.authors.findMany({
			columns: { id: false, createdAt: false, updatedAt: false },
			with: {
				bookAuthors: {
					with: {
						book: {
							columns: { slug: true, title: true, imagePath: true, awards: true, genre: true },
							with: {
								meetBooks: {
									where: (mb, { eq }) => eq(mb.status, 'read'),
									columns: { meetId: true }
								}
							}
						}
					}
				}
			},
			orderBy: (a, { asc }) => asc(a.name)
		}),
		toDbError
	).map((rows) =>
		rows
			.map(({ bookAuthors, ...author }) => ({
				...withPublicImage(author),
				books: bookAuthors
					.map((ba) => ba.book)
					.filter((b) => b.meetBooks.length > 0)
					.map(({ meetBooks: _, ...book }) => withPublicImage(book))
			}))
			.filter((a) => a.books.length > 0)
	);
}

/**
 * The upcoming meet (still "upcoming" until 12 hours after it starts),
 * falling back to the most recent one.
 */
export function fetchNextMeet(): ResultAsync<Meet | null, DbError> {
	const findMeet = (upcoming: boolean) =>
		db.query.meets.findFirst({
			where: upcoming ? gte(meets.startsAt, sql`now() - interval '12 hours'`) : undefined,
			orderBy: upcoming ? asc(meets.startsAt) : desc(meets.startsAt),
			columns: {
				startsAt: true,
				location: true,
				address: true,
				notes: true,
				highlights: true
			},
			with: {
				host: { columns: { firstName: true, lastName: true } },
				meetBooks: {
					where: (mb, { eq }) => eq(mb.status, 'read'),
					with: {
						book: {
							columns: { slug: true, title: true },
							with: { bookAuthors: { with: { author: authorRef } } }
						}
					}
				}
			}
		});

	return fromPromise(
		findMeet(true).then((meet) => meet ?? findMeet(false)),
		toDbError
	).map((meet) => {
		if (!meet) {
			return null;
		}

		const { meetBooks, ...rest } = meet;
		return {
			...rest,
			books: meetBooks.map(({ book: { bookAuthors, ...book } }) => ({
				...book,
				authors: bookAuthors.map((ba) => ba.author)
			}))
		};
	});
}

/** Used at sign-in to decide between signing in and first-time sign-up. */
export function fetchMemberByEmail(
	email: string
): ResultAsync<{ firstName: string; lastName: string; userId: string | null } | null, DbError> {
	return fromPromise(
		db.query.members.findFirst({
			where: eq(sql`lower(${members.email})`, email.toLowerCase()),
			columns: { firstName: true, lastName: true, userId: true }
		}),
		toDbError
	).map((member) => member ?? null);
}
