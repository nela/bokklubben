import { error, redirect } from '@sveltejs/kit';
import { AdminRoutes } from '$lib/routes';
import { dbFailure, formFailure, parseForm, parseRecordId } from '$lib/server/admin/form';
import { memberSchema } from '$lib/server/admin/schemas';
import { fetchAdminMember, updateMember } from '$lib/server/db/admin';
import { hasLeft } from '$lib/utils/helpers';
import type { Actions, PageServerLoad } from './$types';

const emailTaken = { email: ['Eposten er allerede i bruk.'] };

export const load: PageServerLoad = async ({ params }) => {
	const id = parseRecordId(params.id);
	if (id === null) {
		error(404, 'Nye medlemmer kommer snart.');
	}

	const member = await fetchAdminMember(id);
	if (member.isErr()) {
		console.error(member.error);
		error(500, 'Kunne ikke laste medlemmet.');
	}
	if (!member.value) {
		error(404, 'Fant ikke medlemmet.');
	}

	return { member: member.value };
};

export const actions: Actions = {
	/** `/admin/members/<id>`: updates the existing member. */
	update: async ({ params, request, locals }) => {
		const id = parseRecordId(params.id);
		if (id === null) {
			error(400, 'Medlemmet er ikke lagret.');
		}

		const form = parseForm(await request.formData(), memberSchema);
		if (form.isErr()) {
			return form.error;
		}
		const { data, values } = form.value;

		// Don't let an admin lock themselves out.
		if (locals.member?.id === id) {
			if (data.role !== 'admin') {
				return formFailure(values, { role: ['Du kan ikke fjerne din egen admin-rolle.'] });
			}
			if (hasLeft(data.memberUntil)) {
				return formFailure(values, { memberUntil: ['Du kan ikke avslutte ditt eget medlemskap.'] });
			}
		}

		const saved = await updateMember(id, data);
		if (saved.isErr()) {
			return dbFailure(values, saved.error, {
				members_email_lower_idx: emailTaken,
				user_email_unique: emailTaken
			});
		}

		redirect(303, AdminRoutes.MEMBERS);
	}
};
