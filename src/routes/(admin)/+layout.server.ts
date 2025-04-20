import { redirect } from '@sveltejs/kit';
import type { LayoutServerLoad } from '../(app)/$types';

export const load: LayoutServerLoad = async ({ locals: { user } }) => {
	if (!user) {
		throw redirect(303, '/signin');
	}

	if (!user.admin) {
		throw redirect(303, '/');
	}

	return;
};
