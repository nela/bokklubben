import { redirect } from '@sveltejs/kit';
import type { LayoutServerLoad } from '../(app)/$types';

/* export const load: LayoutServerLoad = async ({ locals: { profile } }) => {
	if (!profile) {
		throw redirect(303, '/auth');
	}

	if (profile.appRole !== 'admin') {
		throw redirect(303, '/');
	}

	return;
}; */
