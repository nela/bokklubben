import { beforeEach, describe, expect, it, vi } from 'vitest';
import { EmailInternalError } from '$lib/errors/mail';
import { sendEmail } from './mail';

vi.mock('$env/static/private', () => ({
	SMTP2GO_URL: 'https://smtp2go.test/v3/email/send',
	SMTP2GO_API_KEY: 'test-key',
	SOURCE_EMAIL: 'noreply@bokklubben.test'
}));

describe('sendEmail', () => {
	const fetchSpy = vi.spyOn(global, 'fetch');

	beforeEach(() => {
		fetchSpy.mockReset();
	});

	const sentBody = () => JSON.parse(fetchSpy.mock.calls[0][1]?.body as string);

	it('posts to SMTP2GO with the API key, and accepts a 2xx answer', async () => {
		fetchSpy.mockResolvedValueOnce(new Response('{}', { status: 200 }));

		const res = await sendEmail('ola@example.com', 'Hei', {
			type: 'text/html',
			value: '<p>Hei</p>'
		});

		expect(res.isOk()).toBe(true);
		expect(fetchSpy).toHaveBeenCalledWith(
			'https://smtp2go.test/v3/email/send',
			expect.objectContaining({
				method: 'POST',
				headers: expect.objectContaining({ 'X-Smtp2go-Api-Key': 'test-key' })
			})
		);
		expect(sentBody()).toEqual({
			sender: 'noreply@bokklubben.test',
			to: ['ola@example.com'],
			subject: 'Hei',
			html_body: '<p>Hei</p>'
		});
	});

	it('sends to every recipient, and plain text as text_body', async () => {
		fetchSpy.mockResolvedValueOnce(new Response('{}', { status: 200 }));

		await sendEmail(['a@example.com', 'b@example.com'], 'Hei', {
			type: 'text/plain',
			value: 'Hei'
		});

		expect(sentBody()).toMatchObject({ to: ['a@example.com', 'b@example.com'], text_body: 'Hei' });
	});

	it('fails when SMTP2GO refuses the email', async () => {
		fetchSpy.mockResolvedValueOnce(new Response('{}', { status: 400 }));

		const res = await sendEmail('ola@example.com', 'Hei', { type: 'text/plain', value: 'Hei' });

		expect(res._unsafeUnwrapErr()).toBeInstanceOf(EmailInternalError);
	});

	it('fails when the request fails', async () => {
		fetchSpy.mockRejectedValueOnce(new Error('offline'));

		const res = await sendEmail('ola@example.com', 'Hei', { type: 'text/plain', value: 'Hei' });

		expect(res._unsafeUnwrapErr()).toBeInstanceOf(EmailInternalError);
	});
});
