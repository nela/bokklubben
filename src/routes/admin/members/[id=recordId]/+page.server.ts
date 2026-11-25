import { error, redirect } from '@sveltejs/kit';
import { okAsync, ResultAsync } from 'neverthrow';
import { AdminRoutes } from '$lib/routes';
import { dbFailure, formFailure, parseForm, parseRecordId } from '$lib/server/admin/form';
import { memberSchema, sendEmailSchema, type MemberInput } from '$lib/server/admin/schemas';
import { sendEmailToMembers } from '$lib/server/admin/send-email';
import {
	createMember,
	deleteMember,
	fetchAdminMember,
	fetchClubTitleOptions,
	fetchEmailTemplates,
	updateMember
} from '$lib/server/db/admin';
import { deleteImage, uploadImage } from '$lib/server/images';
import { createSlug, hasLeft } from '$lib/utils/helpers';
import type { Actions, PageServerLoad } from './$types';

const emailTaken = {
	members_email_lower_idx: { email: ['Eposten er allerede i bruk.'] },
	user_email_unique: { email: ['Eposten er allerede i bruk.'] }
};

/** The photo fields apart from the fields saved on the member. */
const splitPhoto = ({ photo, removePhoto, ...fields }: MemberInput) => ({
	photo,
	removePhoto,
	fields
});

/** Uploads a new profile photo to `profiles/<fornavn-etternavn>-<random>`; returns its path. */
function uploadPhoto(photo: File, name: { firstName: string; lastName: string }) {
	const slug = createSlug(`${name.firstName} ${name.lastName}`) || 'medlem';
	return uploadImage('private', `profiles/${slug}`, photo).orTee((e) => console.error(e));
}

export const load: PageServerLoad = async ({ params }) => {
	const id = parseRecordId(params.id);

	const result = await ResultAsync.combine([
		id === null ? okAsync(null) : fetchAdminMember(id),
		fetchEmailTemplates(),
		fetchClubTitleOptions()
	]);
	if (result.isErr()) {
		console.error(result.error);
		error(500, 'Kunne ikke laste medlemmet.');
	}

	const [member, emailTemplates, titleOptions] = result.value;
	if (id !== null && !member) {
		error(404, 'Fant ikke medlemmet.');
	}

	return { member, emailTemplates, titleOptions };
};

export const actions: Actions = {
	/**
	 * `/admin/members/new`. Then goes to the new member's page with "Send e-post" open, so the
	 * invitation can be checked and sent.
	 */
	create: async ({ params, request }) => {
		if (parseRecordId(params.id) !== null) {
			error(400, 'Medlemmet finnes allerede.');
		}

		const form = parseForm(await request.formData(), memberSchema);
		if (form.isErr()) {
			return form.error;
		}
		const { data, values } = form.value;
		const { photo, fields } = splitPhoto(data);

		let imagePath: string | null = null;
		if (photo) {
			const uploaded = await uploadPhoto(photo, fields);
			if (uploaded.isErr()) {
				return formFailure(values, { photo: ['Kunne ikke laste opp bildet.'] }, 500);
			}
			imagePath = uploaded.value;
		}

		const created = await createMember({ ...fields, imagePath });
		if (created.isErr()) {
			if (imagePath) {
				await deleteImage('private', imagePath).orTee((e) => console.error(e));
			}
			return dbFailure(values, created.error, emailTaken);
		}

		redirect(303, `${AdminRoutes.MEMBERS}/${created.value}?send-email`);
	},

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

		const { photo, removePhoto, fields } = splitPhoto(data);

		// Upload a new photo first, so its path can be saved with the rest.
		let imagePath: string | null | undefined = removePhoto ? null : undefined;
		if (photo) {
			const uploaded = await uploadPhoto(photo, fields);
			if (uploaded.isErr()) {
				return formFailure(values, { photo: ['Kunne ikke laste opp bildet.'] }, 500);
			}
			imagePath = uploaded.value;
		}

		const saved = await updateMember(id, { ...fields, imagePath });
		if (saved.isErr()) {
			if (imagePath) {
				await deleteImage('private', imagePath).orTee((e) => console.error(e));
			}
			return dbFailure(values, saved.error, emailTaken);
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
