import { error, redirect } from '@sveltejs/kit';
import { AdminRoutes } from '$lib/routes';
import { dbFailure, formFailure, parseForm, parseRecordId } from '$lib/server/admin/form';
import { memberSchema } from '$lib/server/admin/schemas';
import { deleteMember, fetchAdminMember, updateMember } from '$lib/server/db/admin';
import { deleteImage, uploadImage } from '$lib/server/images';
import { sendInvite } from '$lib/server/services/invite';
import { createSlug, hasLeft } from '$lib/utils/helpers';
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

		const { photo, removePhoto, ...fields } = data;

		// Upload a new photo first, so its path can be saved with the rest.
		let imagePath: string | null | undefined = removePhoto ? null : undefined;
		if (photo) {
			const slug = createSlug(`${fields.firstName} ${fields.lastName}`) || `member-${id}`;
			const uploaded = await uploadImage('private', `profiles/${slug}`, photo);
			if (uploaded.isErr()) {
				console.error(uploaded.error);
				return formFailure(values, { photo: ['Kunne ikke laste opp bildet.'] }, 500);
			}
			imagePath = uploaded.value;
		}

		const saved = await updateMember(id, { ...fields, imagePath });
		if (saved.isErr()) {
			if (imagePath) {
				await deleteImage('private', imagePath).orTee((e) => console.error(e));
			}
			return dbFailure(values, saved.error, {
				members_email_lower_idx: emailTaken,
				user_email_unique: emailTaken
			});
		}

		// The old photo is only removed once the new path is saved.
		const { previousImagePath } = saved.value;
		if (imagePath !== undefined && previousImagePath && previousImagePath !== imagePath) {
			await deleteImage('private', previousImagePath).orTee((e) => console.error(e));
		}

		redirect(303, AdminRoutes.MEMBERS);
	},

	delete: async ({ params, locals }) => {
		const id = parseRecordId(params.id);
		if (id === null) {
			error(400, 'Medlemmet er ikke lagret.');
		}
		if (locals.member?.id === id) {
			return formFailure({}, { form: ['Du kan ikke slette deg selv.'] });
		}

		const deleted = await deleteMember(id);
		if (deleted.isErr()) {
			console.error(deleted.error);
			return formFailure({}, { form: ['Kunne ikke slette medlemmet.'] }, 500);
		}
		await deleteImage('private', deleted.value.imagePath).orTee((e) => console.error(e));

		redirect(303, AdminRoutes.MEMBERS);
	},

	/** Emails the invitation again, to a member who hasn't signed up yet. */
	invite: async ({ params }) => {
		const id = parseRecordId(params.id);
		if (id === null) {
			error(400, 'Medlemmet er ikke lagret.');
		}

		const member = await fetchAdminMember(id);
		if (member.isErr()) {
			console.error(member.error);
			return formFailure({}, { form: ['Kunne ikke sende invitasjonen.'] }, 500);
		}
		if (!member.value) {
			error(404, 'Fant ikke medlemmet.');
		}
		if (member.value.signedUp) {
			return formFailure({}, { form: ['Medlemmet har allerede registrert seg.'] });
		}

		const sent = await sendInvite(member.value.email);
		if (sent.isErr()) {
			console.error(sent.error);
			return formFailure({}, { form: ['Kunne ikke sende invitasjonen.'] }, 502);
		}

		return { invitedEmail: member.value.email };
	}
};
