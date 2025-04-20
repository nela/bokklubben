import { afterAll, beforeEach, describe, expect, it, vi } from 'vitest';
import { sendEmail, type EmailContent } from './mail';
import { EmailInternalError } from '$lib/errors/mail';

describe('Mail', () => {
	const fetchSpy = vi.spyOn(global, 'fetch');

	vi.stubEnv('VITE_SENDGRID_API_KEY_WEB', 'mocked-sendgrid-apikey');
	vi.stubEnv('VITE_SENDGRID_URL', 'https://sendgridurl.com');
	vi.stubEnv('VITE_NO_REPLY_MAIL', 'noreply@noreply.no');

	beforeEach(() => {
		vi.clearAllMocks();
		vi.resetModules();
	});

	afterAll(() => {
		vi.unstubAllEnvs();
	});

	it('should return false when unable to send', async () => {
		fetchSpy.mockRejectedValueOnce(new Error('oh no!'));

		const res = await sendEmail('to', 'subject', { type: 'text/plain', value: 'invalid' });

		expect(fetchSpy).toHaveBeenCalledOnce();
		expect(res._unsafeUnwrapErr()).toBeInstanceOf(EmailInternalError);
	});

	[
		{
			label: 'recepients is a string',
			to: 'n@n.no'
		},
		{
			label: 'recepients is an array',
			to: ['n@n.no', 'm@m.mo']
		}
	].forEach(({ label, to }, i) => {
		it(`should call fetch with correct args when ${label}`, async () => {
			fetchSpy.mockResolvedValueOnce(new Response('ok', { status: 200 }));

			const { sendEmail } = await import('./mail');

			const content = { type: 'text/html', value: '<strong>Hello</strong>' } as EmailContent;
			const subject = 'subject';

			const expectedBody = (() => {
				const personalizations =
					i === 1
						? [{ to: [{ email: 'n@n.no' }] }, { to: [{ email: 'm@m.mo' }] }]
						: [{ to: [{ email: 'n@n.no' }] }];

				return {
					from: {
						email: 'noreply@noreply.no'
					},
					subject: subject,
					content: [content],
					personalizations: personalizations
				};
			})();

			const expectedPayload = {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					Authorization: 'Bearer mocked-sendgrid-apikey'
				},
				body: JSON.stringify(expectedBody)
			};

			const res = await sendEmail(to, 'subject', content);

			expect(fetchSpy).toHaveBeenCalledOnce();
			expect(fetchSpy).toHaveBeenCalledWith('https://sendgridurl.com', expectedPayload);
			expect(res.isOk()).toEqual(true);
			expect(res._unsafeUnwrap().status).toEqual(200);
		});
	});
});
