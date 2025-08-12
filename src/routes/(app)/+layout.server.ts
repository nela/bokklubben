import type { LayoutServerLoad } from './$types';
import * as db from '$lib/server/db/queries';
import type { PublicMember } from '$lib/dto/dto';
import type { DbError } from '$lib/errors/db';
import { ok } from 'neverthrow';

export const load: LayoutServerLoad = async ({ locals: { member } }) => {
	const allMembers = await db.fetchMembers().orTee((e) => console.log(e)).unwrapOr([]);
	const books = await db.fetchBooks().orTee((e) => console.log(e)).unwrapOr([]);
	const authors = await db.fetchAuthors().orTee((e) => console.log(e)).unwrapOr([]);

	return {
		member,
		allMembers,
		books,
		authors
		// allMembers: await db.fetchMembers().orTee((e) => console.log(e)).unwrapOr([]),
		// books: await db.fetchBooks().orTee((e) => console.log(e)).unwrapOr([]),
		// authors: await db.fetchAuthors().orTee((e) => console.log(e)).unwrapOr([])
	};
};
