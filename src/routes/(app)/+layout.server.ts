import type { LayoutServerLoad } from './$types';
import { error } from '@sveltejs/kit';
import { ResultAsync } from 'neverthrow';
import * as db from '$lib/server/db/queries';

export const load: LayoutServerLoad = async ({ locals: { member } }) => {
	const result = await ResultAsync.combine([
		db.fetchMembers(),
		db.fetchBooks(),
		db.fetchAuthors(),
		db.fetchNextMeet()
	]);

	if (result.isErr()) {
		console.error(result.error);
		error(500, 'Kunne ikke laste data.');
	}

	const [allMembers, books, authors, nextMeet] = result.value;
	return { member, allMembers, books, authors, nextMeet };
};
