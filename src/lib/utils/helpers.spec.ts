import { describe, expect, it } from 'vitest';
import { hasLeft, matchSpelling } from './helpers';

describe('matchSpelling', () => {
	it('uses the existing spelling and keeps new values as typed', () => {
		expect(matchSpelling(['science fiction', 'Klima'], ['Roman', 'Science Fiction'])).toEqual([
			'Science Fiction',
			'Klima'
		]);
	});

	it('drops duplicates that only differ in case', () => {
		expect(matchSpelling(['Roman', 'roman', 'ROMAN'], [])).toEqual(['Roman']);
	});
});

describe('hasLeft', () => {
	const until = new Date('2026-06-30');

	it('is still a member on the last day, and has left the day after', () => {
		expect(hasLeft(until, '2026-06-30')).toBe(false);
		expect(hasLeft(until, '2026-07-01')).toBe(true);
	});

	it('is a member when there is no end date', () => {
		expect(hasLeft(null, '2099-01-01')).toBe(false);
	});
});
