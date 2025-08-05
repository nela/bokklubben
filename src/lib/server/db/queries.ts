import { POSTGRES_URL } from '$env/static/private';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { clubTitles, memberClubTitle, members } from './schema';
import { err, fromPromise, ok, ResultAsync, safeTry } from 'neverthrow';
import { DbInternalError, DbTooManyRowsError, type DbError } from '$lib/errors/db';
import { unwrapSingleQueryResult } from './utils';
import { count, eq, inArray } from 'drizzle-orm';
import { ClubTitle, type Member, type PublicMember } from '$lib/dto/dto';
import type { MemberDbDto } from './model';
import { authUsers } from 'drizzle-orm/supabase';

const client = postgres(POSTGRES_URL, { prepare: false });
const db = drizzle(client);

export function mapMember(profile: MemberDbDto, titles: Array<ClubTitle>): Member {
	const { id, fkAuthId, ...dto } = profile;
	return {
		...dto,
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
	const { titles, ...rest } = newMember;

	return safeTry(async function* () {
		const memberResult = yield* fromPromise(
			db.insert(members).values(rest).returning({ id: members.id }),
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
				const { memberId, clubTitle, ...first } = m[0];
				return {
					...first,
					titles: m
						.map((e) => (e.clubTitle ? (e.clubTitle as ClubTitle) : null))
						.filter((ct) => ct !== null)
				};
			})
			.toArray()
	);
}
