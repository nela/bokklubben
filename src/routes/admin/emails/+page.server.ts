import { error } from '@sveltejs/kit';
import { fetchEmailTemplates } from '$lib/server/db/admin';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
	const templates = await fetchEmailTemplates();
	if (templates.isErr()) {
		console.error(templates.error);
		error(500, 'Kunne ikke laste e-postmalene.');
	}

	return { templates: templates.value };
};
