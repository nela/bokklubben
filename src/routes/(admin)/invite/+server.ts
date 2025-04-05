import Email from '$lib/components/email.svelte';
import type { UserInvitationRecord } from '$lib/server/db/model';
import { deleteInvitationById, storeInvitationRecord } from '$lib/server/db/queries';
import { sendEmail } from '$lib/server/mail/mail';
import { createHtmlString, parseNonNullable } from '$lib/utils/helpers';
import { error, json, type RequestHandler } from '@sveltejs/kit';
import { createHash } from 'crypto';
import { render } from 'svelte/server';

export interface UserInvitationDto {
	email: string;
	firstName: string;
	lastName: string;
	roles?: Array<string>;
	admin?: boolean;
	handle?: string;
}

export const POST: RequestHandler = async ({ request }: { request: Request }) => {
	const body = (await request.json()) as UserInvitationDto;

	const expiresAt = new Date(new Date().getTime() + 60 * 60 * 24 * 7 * 1000);

	const userInvitationRecord: UserInvitationRecord = parseNonNullable({
		...body,
		roles: body.roles ?? [],
		expiresAt: expiresAt.toISOString(),
		seed: createHash('sha256')
			.update(`${body.firstName}${body.lastName}${expiresAt}${Math.random() / Math.random()}`)
			.digest('hex')
	});

	const recordId = await storeInvitationRecord(userInvitationRecord);

	if (recordId.isErr()) {
		return error(500, 'Failed to store invitation. Try again later.');
	}

	const renderOutput = render(Email, { props: { seed: userInvitationRecord.seed } });
	const response = await sendEmail(body.email, 'Invitasjon til bokklubben', {
		type: 'text/html',
		value: createHtmlString(renderOutput.head, renderOutput.body)
	});

	return response.match(
		() => json({ message: 'Invitation sent successfully.' }, { status: 200 }),
		() => {
			deleteInvitationById(recordId.value);
			return error(500, 'Failed to send email. Try again later.');
		}
	);
};
