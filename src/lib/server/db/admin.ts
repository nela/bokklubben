/** Queries and changes for the admin pages. The site's own reads live in queries.ts. */

import { asc, count, eq } from 'drizzle-orm';
import { fromPromise, type ResultAsync } from 'neverthrow';
import type { AdminAuthorListItem } from '$lib/dto/admin';
import { toDbError, type DbError } from '$lib/errors/db';
import { db } from './index';
import { authors, bookAuthors } from './schema';

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
