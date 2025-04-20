import Email from '$lib/components/email.svelte';
import type { UserAdminInvitationDto } from '$lib/dto/dto';
import { EmailInternalError } from '$lib/errors/mail';
import type { UserInvitationRecord } from '$lib/server/db/model';
import { deleteRecordByRef, storeInvitationRecord } from '$lib/server/db/queries';
import { createHtmlString, sendEmail } from '$lib/server/services/mail';
import { parseNonNullable } from '$lib/utils/helpers';
import { error, json, type RequestHandler } from '@sveltejs/kit';
import { createHash } from 'crypto';
import { errAsync } from 'neverthrow';
import { render } from 'svelte/server';

export const POST: RequestHandler = async ({ request }: { request: Request }) => {
	const body = (await request.json()) as UserAdminInvitationDto;

	const expiresAt = new Date(new Date().getTime() + 60 * 60 * 24 * 7 * 1000);

	const userInvitationRecord: UserInvitationRecord = parseNonNullable({
		...body,
		roles: body.roles ?? [],
		expiresAt: expiresAt.toISOString(),
		seed: createHash('sha256')
			.update(`${body.firstName}${body.lastName}${expiresAt}${Math.random() / Math.random()}`)
			.digest('hex')
	});

	return storeInvitationRecord(userInvitationRecord)
		.andThen((record) => {
			const renderOutput = render(Email, { props: { seed: userInvitationRecord.seed } });
			return sendEmail(body.email, 'Invitasjon til bokklubben', {
				type: 'text/html',
				value: createHtmlString(renderOutput.head, renderOutput.body)
			}).orElse((e) => {
				deleteRecordByRef(record);
				return errAsync(e);
			});
		})
		.match(
			() => json({ message: 'Invitation sent successfully.' }, { status: 200 }),
			(e) =>
				error(
					500,
					e instanceof EmailInternalError
						? 'Failed to send email. Try again later.'
						: 'Unable to store invitaiton record'
				)
		);
};
