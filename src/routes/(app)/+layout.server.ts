import type { LayoutServerLoad } from './$types';
import * as db from '$lib/server/db/queries';

export const load: LayoutServerLoad = async ({ parent, locals: { member } }) => {
	const allMembers = await db
		.fetchMembers()
		.orTee((e) => console.error(e))
		.unwrapOr([]);
	const books = await db
		.fetchBooks()
		.orTee((e) => console.error(e))
		.unwrapOr([]);
	const authors = await db
		.fetchAuthors()
		.orTee((e) => console.error(e))
		.unwrapOr([]);
	const nextMeet = await db
		.fetchNextMeet()
		.orTee((e) => console.error(e))
		.unwrapOr(undefined);

	return {
		member,
		allMembers,
		books,
		authors,
		nextMeet
	};
};
