/** Queries and changes for the admin pages. The site's own reads live in queries.ts. */

import { asc, count, eq } from 'drizzle-orm';
import { fromPromise, type ResultAsync } from 'neverthrow';
import type {
	AdminAuthorListItem,
	AdminMeet,
	AdminMeetListItem,
	MemberOption
} from '$lib/dto/admin';
import { toDbError, type DbError } from '$lib/errors/db';
import type { MeetInput } from '$lib/server/admin/schemas';
import { db } from './index';
import { authors, bookAuthors, meets, members } from './schema';

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
			}
		}),
		toDbError
	).map((meet) => meet ?? null);
}

/** Returns the new meet's id. */
export function createMeet(input: MeetInput): ResultAsync<number, DbError> {
	return fromPromise(db.insert(meets).values(input).returning({ id: meets.id }), toDbError).map(
		([row]) => row.id
	);
}

export function updateMeet(id: number, input: MeetInput): ResultAsync<number, DbError> {
	return fromPromise(db.update(meets).set(input).where(eq(meets.id, id)), toDbError).map(() => id);
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
