import { describe, expect, it } from 'vitest';
import { fillPlaceholders, toParagraphs } from './member-email';

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
