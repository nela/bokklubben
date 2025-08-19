import { POSTGRES_URL } from '$env/static/private';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { authors, bookAuthor, bookMeet, books, clubTitles, meets, memberClubTitle, members } from './schema';
import { err, fromPromise, ok, ResultAsync, safeTry } from 'neverthrow';
import { DbEntityNotFoundError, DbInternalError, DbTooManyRowsError, type DbError } from '$lib/errors/db';
import { unwrapSingleQueryResult } from './utils';
import { count, eq, inArray } from 'drizzle-orm';
import { ClubTitle, type Author, type Book, type Meet, type Member, type PublicMember } from '$lib/dto/dto';
import type { MemberDbDto } from './model';
import { authUsers } from 'drizzle-orm/supabase';

const client = postgres(POSTGRES_URL, { prepare: false });
const db = drizzle(client);

export function mapMember(member: MemberDbDto, titles: Array<ClubTitle>): Member {
	const { id, fkAuthId, memberTo, memberSince, ...dto } = member;
	return {
		...dto,
		memberSince: new Date(memberSince),
		memberTo: memberTo ? new Date(memberTo) : null,
		titles: titles
	};
}

export function verifyUserAllowed(
	email: string
): ResultAsync<{ action?: 'signin' | 'signup' }, DbError> {
	return safeTry(async function* () {
		const authExists = yield* fromPromise(
			db.select({ count: count() }).from(authUsers).where(eq(authUsers.email, email)),
			(e) => new DbInternalError({ cause: e })
		).andThen((res) => unwrapSingleQueryResult(res, 'count', 'Count'));

		if (authExists.count > 1) {
			return err(new DbTooManyRowsError(email, 'Supabase auth users'));
		}

		if (authExists.count === 1) {
			return ok({ action: 'signin' });
		}

		const memberExists = yield* fromPromise(
			db.select({ count: count() }).from(members).where(eq(members.email, email)),
			(e) => new DbInternalError({ cause: e })
		).andThen((res) => unwrapSingleQueryResult(res, 'Count', 'Number of Authenticated Users'));

		if (memberExists.count > 1) {
			return err(new DbTooManyRowsError(email, 'Members'));
		}

		if (memberExists.count === 1) {
			return ok({ action: 'signup' });
		}

		return ok({});
	});
}

function createMember(newMember: Member): ResultAsync<void, DbError> {
	const { titles, memberTo, memberSince, ...rest } = newMember;

	return safeTry(async function* () {
		const memberResult = yield* fromPromise(
			db
				.insert(members)
				.values({
					memberTo: null,
					memberSince: memberSince,
					...rest
				})
				.returning({ id: members.id }),
			(e) => new DbInternalError({ cause: e })
		);

		const memberId = yield* unwrapSingleQueryResult(memberResult, '', 'Member.ID');

		const clubTitleIds = yield* fromPromise(
			db.select({ id: clubTitles.id }).from(clubTitles).where(inArray(clubTitles.name, titles)),
			(e) => new DbInternalError({ cause: e })
		);

		if (titles.length > 0) {
			const memberTitleRel = clubTitleIds.map((t) => ({
				fkMemberId: memberId.id,
				fkClubTitleId: t.id
			}));

			fromPromise(
				db.insert(memberClubTitle).values(memberTitleRel),
				(e) => new DbInternalError({ cause: e })
			);
		}

		return ok();
	});
}

function fetchSingleMember(
	key: keyof MemberDbDto,
	value: string
): ResultAsync<MemberDbDto | undefined, DbError> {
	return safeTry(async function* () {
		const memberResult = yield* fromPromise(
			db.select().from(members).where(eq(members[key], value)),
			(e) => new DbInternalError({ cause: e })
		);

		if (memberResult.length < 1) {
			return ok(undefined);
		}

		const member = yield* unwrapSingleQueryResult(memberResult, value, 'Member');

		return ok(member);
	});
}

function fetchClubTitles(memberId: number): ResultAsync<Array<ClubTitle>, DbError> {
	const titles = Object.keys(ClubTitle);
	return fromPromise(
		db
			.select({ clubTitle: clubTitles.name })
			.from(clubTitles)
			.leftJoin(memberClubTitle, eq(clubTitles.id, memberClubTitle.fkClubTitleId))
			.where(eq(memberClubTitle.fkMemberId, memberId)),
		(e) => new DbInternalError({ cause: e })
	).map((result) =>
		result
			.filter((title) => {
				const exists = titles.includes(title.clubTitle);
				if (!exists) {
					console.log('Received invalid ClubTitle key ${ct} during mapping to enum ClubTitle');
				}
				return exists;
			})
			.map((title) => ClubTitle[title.clubTitle as keyof typeof ClubTitle])
	);
}

export function fetchMemberByUuid(uuid: string) {
	return safeTry(async function* () {
		const member = yield* fetchSingleMember('fkAuthId', uuid);

		if (member === undefined) {
			return err(new DbInternalError({ cause: `No Member with UUID: ${uuid} found.` }));
		}

		const titles = yield* fetchClubTitles(member.id);

		return ok(mapMember(member, titles));
	});
}

export function fetchMembers(): ResultAsync<Array<PublicMember>, DbError> {
	return fromPromise(
		db
			.select({
				memberId: members.id,
				firstname: members.firstname,
				lastname: members.lastname,
				username: members.username,
				memberSince: members.memberSince,
				memberTo: members.memberTo,
				imageUrl: members.imageUrl,
				clubTitle: clubTitles.name
			})
			.from(members)
			.leftJoin(memberClubTitle, eq(memberClubTitle.fkMemberId, members.id))
			.leftJoin(clubTitles, eq(clubTitles.id, memberClubTitle.fkClubTitleId)),
		(e) => new DbInternalError({ cause: e })
	).map((res) =>
		Map.groupBy(res, ({ memberId }) => memberId)
			.values()
			.map((m) => {
				const { memberId, clubTitle, memberSince, memberTo, ...first } = m[0];
				return {
					...first,
					memberSince: new Date(memberSince),
					memberTo: memberTo ? new Date(memberTo) : null,
					titles: m
						.map((e) => (e.clubTitle ? (e.clubTitle as ClubTitle) : null))
						.filter((ct) => ct !== null)
				};
			})
			.toArray()
	);
}

export function fetchAuthors(): ResultAsync<Array<Author>, DbError> {
	return fromPromise(
		db
			.select({
				authorId: authors.id,
				authorName: authors.name,
				authorBorn: authors.born,
				authorDied: authors.died,
				authorDescription: authors.description,
				authorImageUrl: authors.imageUrl,
				authorAwards: authors.awards,
				bookTitle: books.title,
				bookImageUrl: books.imageUrl,
				bookAwards: books.awards,
				bookGenre: books.genre
			})
			.from(authors)
			.leftJoin(bookAuthor, eq(bookAuthor.fkAuthorId, authors.id))
			.leftJoin(books, eq(books.id, bookAuthor.fkBookId)),
		(e) => new DbInternalError({ cause: e })
	).map((res) =>
		Map.groupBy(res, ({ authorId }) => authorId)
			.values()
			.map((byAuthor) => {
				const author = byAuthor[0];

				return {
					name: author.authorName,
					description: author.authorDescription,
					born: new Date(author.authorBorn),
					died: author.authorDied ? new Date(author.authorDied) : null,
					awards: author.authorAwards,
					imageUrl: author.authorImageUrl,
					books: byAuthor
					.filter((b) => b.bookTitle && b.bookImageUrl && b.bookGenre)
					.map((b) => ({
						title: b.bookTitle!,
						imageUrl: b.bookImageUrl!,
						awards: b.bookAwards,
						genre: b.bookGenre!
					}))
				};
			})
			.toArray()
	);
}

export function fetchBooks(): ResultAsync<Array<Book>, DbError> {
	return fromPromise(
		db
			.select({
				bookId: books.id,
				title: books.title,
				firstPublished: books.firstPublished,
				pages: books.pages,
				awards: books.awards,
				originalLanguage: books.originalLanguage,
				genre: books.genre,
				read: books.read,
				goodreadsRating: books.goodreadsRating,
				description: books.description,
				imageUrl: books.imageUrl,
				author: authors.name
			})
			.from(books)
			.leftJoin(bookAuthor, eq(bookAuthor.fkBookId, books.id))
			.leftJoin(authors, eq(authors.id, bookAuthor.fkAuthorId)),
		(e) => new DbInternalError({ cause: e })
	).map((res) =>
		Map.groupBy(res, ({ bookId }) => bookId)
			.values()
			.map((bookResults) => {
				const { bookId, read, author, ...first } = bookResults[0];
				return {
					...first,
					read: new Date(read),
					authors: bookResults.map((b) => b.author).filter((a) => a !== null)
				};
			})
			.toArray()
	);
}

export function fetchNextMeet(): ResultAsync<Meet, DbError> {
	return safeTry(async function* () {
		const results = yield* fromPromise(
			db.select()
				.from(meets)
				.leftJoin(bookMeet, eq(bookMeet.fkMeetId, meets.id))
				.leftJoin(books, eq(books.id, bookMeet.fkBookId))
				.leftJoin(members, eq(members.id, meets.fkMemberId))
				.leftJoin(bookAuthor, eq(bookAuthor.fkBookId, books.id))
				.leftJoin(authors, eq(authors.id, bookAuthor.fkAuthorId))
				.where(eq(bookMeet.status, 'read'))
				.orderBy(meets.datetime)
				.limit(1),
			(e) => new DbInternalError({ cause: e })
		);

		for (const r of results) {
			if (r.books === null) {
				return err(new DbEntityNotFoundError('', 'books'))
			}

			if (r.authors === null) {
				return err(new DbEntityNotFoundError('', 'authours'))
			}
		}

		const bookIds: Array<number> = [...new Set(results.map((r) => r.books!.id))];

		if (bookIds.length > 1) {
			return err(new DbTooManyRowsError(bookIds.join(', '), 'Books in meets'))
		};

		const first = results.length > 1 ? [results[0]] : results;
		const firstUnwrapped = yield* unwrapSingleQueryResult(first, '', 'Books/Meets');

		return ok({
			datetime: firstUnwrapped.meets.datetime,
			location: firstUnwrapped.meets.location,
			host: firstUnwrapped.members ? {
				firstname: firstUnwrapped.members.firstname,
				lastname: firstUnwrapped.members.lastname,
			} : null,
			address: firstUnwrapped.meets.address,
			notes: firstUnwrapped.meets.notes,
			highlights: firstUnwrapped.meets.highlights,
			book: {
				title: firstUnwrapped.books!.title,
				authors: results.map((r) => r.authors!.name)
			}
		});
	})
}

export function fetchMemberEmails() {
	return fromPromise(
		db.select({ email: members.email }).from(members),
		(e) => new DbInternalError({ cause :e })
	).map((res) => res.map((m) => m.email));
}
