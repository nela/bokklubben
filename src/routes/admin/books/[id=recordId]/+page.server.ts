import { error, redirect } from '@sveltejs/kit';
import { ResultAsync } from 'neverthrow';
import { AdminRoutes } from '$lib/routes';
import { createAuthorFromForm } from '$lib/server/admin/create-author';
import { dbFailure, formFailure, parseForm, parseRecordId } from '$lib/server/admin/form';
import { bookSchema } from '$lib/server/admin/schemas';
import {
	deleteBook,
	fetchAdminBook,
	fetchAuthorNames,
	fetchGenres,
	fetchLanguages,
	updateBook
} from '$lib/server/db/admin';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params }) => {
	const id = parseRecordId(params.id);
	if (id === null) {
		error(404, 'Nye bøker legges til på møtene.');
	}

	const result = await ResultAsync.combine([
		fetchAdminBook(id),
		fetchGenres(),
		fetchLanguages(),
		fetchAuthorNames()
	]);
	if (result.isErr()) {
		console.error(result.error);
		error(500, 'Kunne ikke laste boken.');
	}

	const [book, genres, languages, authorNames] = result.value;
	if (!book) {
		error(404, 'Fant ikke boken.');
	}

	return { book, genres, languages, authorNames };
};

export const actions: Actions = {
	update: async ({ params, request }) => {
		const id = parseRecordId(params.id);
		if (id === null) {
			error(400, 'Boken er ikke lagret.');
		}

		const form = parseForm(await request.formData(), bookSchema);
		if (form.isErr()) {
			return form.error;
		}

		const { data, values } = form.value;
		const saved = await updateBook(id, data);
		if (saved.isErr()) {
			return dbFailure(values, saved.error, {
				books_slug_unique: { bookTitle: ['Det finnes allerede en bok med denne tittelen.'] },
				books_isbn_unique: { bookIsbn: ['Det finnes allerede en bok med dette ISBN-nummeret.'] }
			});
		}

		redirect(303, AdminRoutes.BOOKS);
	},

	/** From the "Ny forfatter" panel; see `createAuthorFromForm`. */
	createAuthor: ({ request }) => createAuthorFromForm(request),

	delete: async ({ params }) => {
		const id = parseRecordId(params.id);
		if (id === null) {
			error(400, 'Boken er ikke lagret.');
		}

		const deleted = await deleteBook(id);
		if (deleted.isErr()) {
			console.error(deleted.error);
			return formFailure({}, { form: ['Kunne ikke slette boken.'] }, 500);
		}

		redirect(303, AdminRoutes.BOOKS);
	}
};
