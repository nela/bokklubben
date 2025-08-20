import { createSlug } from '$lib/utils/helpers';
import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { Routes } from '$lib/routes';

export const load: PageServerLoad = ({ locals: { member }, params }) => {
	if (!member || createSlug(`${member.firstname} ${member.lastname}`) !== params.member) {
		throw redirect(303, Routes.MEMBERS);
	}
};
