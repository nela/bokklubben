import { error } from '@sveltejs/kit';
import { fetchAdminClubTitles } from '$lib/server/db/admin';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
	const titles = await fetchAdminClubTitles();
	if (titles.isErr()) {
		console.error(titles.error);
		error(500, 'Kunne ikke laste titlene.');
	}

	return { titles: titles.value };
};
