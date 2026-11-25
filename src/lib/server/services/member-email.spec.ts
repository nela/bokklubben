import { okAsync } from 'neverthrow';
import { describe, expect, it, vi } from 'vitest';
import { sendEmail } from './mail';
import { fillPlaceholders, sendMemberEmail, toParagraphs } from './member-email';

vi.mock('./mail', async (original) => ({
	...(await original<typeof import('./mail')>()),
	sendEmail: vi.fn(() => okAsync(undefined))
}));

const ola = { firstName: 'Ola', lastName: 'Nordmann', email: 'ola@example.com' };

describe('fillPlaceholders', () => {
	it('fills in the recipient, and leaves unknown placeholders alone', () => {
		expect(fillPlaceholders('Hei {fornavn} {etternavn} ({epost}), {ukjent}', ola)).toBe(
			'Hei Ola Nordmann (ola@example.com), {ukjent}'
		);
	});
});

describe('toParagraphs', () => {
	it('splits on blank lines and keeps single line breaks', () => {
		expect(toParagraphs('Hei Ola,\n\nLinje en\nLinje to\n\n\n\nHilsen\nBokklubben\n')).toEqual([
			['Hei Ola,'],
			['Linje en', 'Linje to'],
			['Hilsen', 'Bokklubben']
		]);
	});

	it('handles Windows line endings', () => {
		expect(toParagraphs('A\r\n\r\nB')).toEqual([['A'], ['B']]);
	});
});

describe('sendMemberEmail', () => {
	it('builds the email: logo and name, the filled-in text as safe text, and the button', async () => {
		await sendMemberEmail(ola, { subject: 'Hei {fornavn}', body: 'Hei {fornavn}\n\n<b>fet</b>' });

		const [to, subject, content] = vi.mocked(sendEmail).mock.calls[0];
		expect(to).toBe('ola@example.com');
		expect(subject).toBe('Hei Ola');
		expect(content.value).toContain('https://bokklubben.eu/web-app-manifest-192x192.png');
		expect(content.value).toContain('Bokklubben</span>');
		expect(content.value).toContain('Hei Ola');
		expect(content.value).toContain('&lt;b>fet&lt;/b>');
		expect(content.value).toContain('Gå til Bokklubben');
	});
});
