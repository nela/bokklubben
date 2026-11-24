/** Queries and changes for the admin pages. The site's own reads live in queries.ts. */

import { asc, count, eq } from 'drizzle-orm';
import { fromPromise, type ResultAsync } from 'neverthrow';
import type { AdminAuthorListItem, AdminMeetListItem } from '$lib/dto/admin';
import { toDbError, type DbError } from '$lib/errors/db';
import { db } from './index';
import { authors, bookAuthors } from './schema';

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
