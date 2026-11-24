import { error } from '@sveltejs/kit';
import { fetchAdminAuthors } from '$lib/server/db/admin';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
	const authors = await fetchAdminAuthors();
	if (authors.isErr()) {
		console.error(authors.error);
		error(500, 'Kunne ikke laste forfattere.');
	}

	return { authors: authors.value };
};
