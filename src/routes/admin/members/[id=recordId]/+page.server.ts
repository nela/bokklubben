import { error, redirect } from '@sveltejs/kit';
import { ResultAsync } from 'neverthrow';
import { AdminRoutes } from '$lib/routes';
import { dbFailure, formFailure, parseForm, parseRecordId } from '$lib/server/admin/form';
import { memberSchema, sendEmailSchema } from '$lib/server/admin/schemas';
import { sendEmailToMembers } from '$lib/server/admin/send-email';
import {
	deleteMember,
	fetchAdminMember,
	fetchEmailTemplates,
	updateMember
} from '$lib/server/db/admin';
import { deleteImage, uploadImage } from '$lib/server/images';
import { createSlug, hasLeft } from '$lib/utils/helpers';
import type { Actions, PageServerLoad } from './$types';

const emailTaken = { email: ['Eposten er allerede i bruk.'] };

export const load: PageServerLoad = async ({ params }) => {
	const id = parseRecordId(params.id);
	if (id === null) {
		error(404, 'Nye medlemmer kommer snart.');
	}

	const result = await ResultAsync.combine([fetchAdminMember(id), fetchEmailTemplates()]);
	if (result.isErr()) {
		console.error(result.error);
		error(500, 'Kunne ikke laste medlemmet.');
	}

	const [member, emailTemplates] = result.value;
	if (!member) {
		error(404, 'Fant ikke medlemmet.');
	}

	return { member, emailTemplates };
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

	/**
	 * From the "Send e-post" panel: sends the written email to this member; see
	 * `sendEmailToMembers`.
	 */
	sendEmail: async ({ params, request }) => {
		const id = parseRecordId(params.id);
		if (id === null) {
			error(400, 'Medlemmet er ikke lagret.');
		}

		const form = parseForm(await request.formData(), sendEmailSchema);
		if (form.isErr()) {
			return form.error;
		}
		const { data, values } = form.value;

		const member = await fetchAdminMember(id);
		if (member.isErr()) {
			console.error(member.error);
			return formFailure(values, { form: ['Kunne ikke sende e-posten.'] }, 500);
		}
		if (!member.value) {
			error(404, 'Fant ikke medlemmet.');
		}

		return sendEmailToMembers(data, values, [member.value]);
	}
};
