import { errAsync, okAsync } from 'neverthrow';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { DbConflictError } from '$lib/errors/db';
import { EmailInternalError } from '$lib/errors/mail';
import { createEmailTemplate } from '$lib/server/db/admin';
import { sendMemberEmail } from '$lib/server/services/member-email';
import { sendEmailToMembers } from './send-email';

vi.mock('$lib/server/db/admin', () => ({ createEmailTemplate: vi.fn() }));
vi.mock('$lib/server/services/member-email', () => ({ sendMemberEmail: vi.fn() }));

const members = ['Ola', 'Kari', 'Per'].map((firstName) => ({
	firstName,
	lastName: 'Nordmann',
	email: `${firstName.toLowerCase()}@example.com`
}));
const email = { subject: 'Nytt', body: 'Hei {fornavn}', saveAsTemplate: false, templateName: null };

describe('sendEmailToMembers', () => {
	beforeEach(() => {
		vi.mocked(sendMemberEmail).mockReset().mockReturnValue(okAsync(undefined));
		vi.mocked(createEmailTemplate).mockReset();
	});

	it('sends one email per member', async () => {
		const result = await sendEmailToMembers(email, {}, members);

		expect(sendMemberEmail).toHaveBeenCalledTimes(3);
		expect(result).toEqual({
			sent: ['Ola Nordmann', 'Kari Nordmann', 'Per Nordmann'],
			failed: [],
			savedTemplate: null
		});
	});

	it('names the members it could not send to', async () => {
		vi.mocked(sendMemberEmail).mockImplementation((recipient) =>
			recipient.firstName === 'Kari' ? errAsync(new EmailInternalError()) : okAsync(undefined)
		);

		const result = await sendEmailToMembers(email, {}, members);

		expect(result).toMatchObject({
			sent: ['Ola Nordmann', 'Per Nordmann'],
			failed: ['Kari Nordmann']
		});
	});

	it('fails when nothing could be sent', async () => {
		vi.mocked(sendMemberEmail).mockReturnValue(errAsync(new EmailInternalError()));

		const result = await sendEmailToMembers(email, {}, members);

		expect(result).toMatchObject({ status: 502 });
	});

	it('saves the template first, and sends nothing if its name is taken', async () => {
		vi.mocked(createEmailTemplate).mockReturnValue(
			errAsync(new DbConflictError('email_templates_name_unique'))
		);

		const result = await sendEmailToMembers(
			{ ...email, saveAsTemplate: true, templateName: 'Nytt' },
			{},
			members
		);

		expect(result).toMatchObject({ status: 409 });
		expect(sendMemberEmail).not.toHaveBeenCalled();
	});
});
