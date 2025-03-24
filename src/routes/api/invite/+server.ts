import type { CustomRole } from '$lib/roles';
import { db, firebaseAdmin } from '$lib/server/firebase.admin';
import { sendEmail } from '$lib/server/mail/mail';
import { json, type RequestHandler } from '@sveltejs/kit';
import { createHash } from 'crypto';
import type { Http2ServerResponse } from 'http2';

interface InviteUserDto {
	email: string;
	firstName: string;
	lastName: string;
	role?: CustomRole;
	admin?: boolean;
	handle?: string;
}

interface Test {
	asdf: ResponseInit;
}

export const POST: RequestHandler = async ({ request }: { request: Request }) => {
	const body = (await request.json()) as InviteUserDto;

	// create expires in
	// store token or link
	// send link by email

	const expiresAt = new Date(new Date().getTime() + 60 * 60 * 24 * 7 * 1000);
	const seed = Math.random() / Math.random();
	const postfix = createHash('sha256')
		.update(`${body.firstName}${body.lastName}${expiresAt}${seed}`)
		.digest('hex');

	const response = await sendEmail(body.email, 'Invitasjon til bokklubben', {
		type: 'text/plain',
		value: 'bla'
	});

	if (!response?.ok) {
		return json(
			{
				success: false,
				message: 'Unable to send invitation'
			},
			{
				status: response?.status,
        statusText: response?.statusText,
				headers: { ['ContentType']: 'application/json ' }
			}
		);
	}

	// store prefix or link or whatever;

	return json(
		{
			success: true,
			message: 'Invitation sent successfully.'
		},
		{
			status: 200,
			headers: { ['ContentType']: 'application/json ' }
		}
	);
};
