import { error } from '@sveltejs/kit';
import { fetchAdminBooks } from '$lib/server/db/admin';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
	const books = await fetchAdminBooks();
	if (books.isErr()) {
		console.error(books.error);
		error(500, 'Kunne ikke laste bøkene.');
	}

	return { books: books.value };
};
