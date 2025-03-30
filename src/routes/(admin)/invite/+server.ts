import { storeInvitation } from '$lib/server/db/queries';
import { sendEmail } from '$lib/server/mail/mail';
import { error, json, type RequestHandler } from '@sveltejs/kit';
import { createHash } from 'crypto';
import type { Http2ServerResponse } from 'http2';

interface UserInvitationDto {
	email: string;
	firstName: string;
	lastName: string;
	role?: Array<string>;
	admin?: boolean;
	handle?: string;
}

export const POST: RequestHandler = async ({ request }: { request: Request }) => {
	const body = (await request.json()) as UserInvitationDto;

	// create expires in
	// store token or link
	// send link by email

	const expiresAt = new Date(new Date().getTime() + 60 * 60 * 24 * 7 * 1000);

  const userInvitationRecord: UserInvitationRecord = {
    ...body,
    expiresAt: expiresAt.toISOString(),
    seed: createHash('sha256')
      .update(`${body.firstName}${body.lastName}${expiresAt}${Math.random() / Math.random()}`)
      .digest('hex')
  };

  const recordId = await storeInvitation(userInvitationRecord)

  if (recordId.isErr()) {
    return error(500, 'Failed to store invitation.');
  }

	const response = await sendEmail(body.email, 'Invitasjon til bokklubben', {
		type: 'text/html',
		value: '<strong> strong bla</strong>'
	});

  return response.match(
    () => json({ success: true }, { status: 200 }),
    () => error(500, 'Failed to send email. Try again later.')
  )
}
