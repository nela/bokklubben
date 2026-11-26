import { describe, expect, it } from 'vitest';
import { groupAwards, hasLeft, matchSpelling, parseAwards } from './helpers';

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

describe('parseAwards', () => {
	it('splits off the year and sorts oldest first, prizes without a year last', () => {
		expect(parseAwards(['B (1990)', 'Uten år', 'A (1959)', 'C 2021'])).toEqual([
			{ name: 'A', year: '1959' },
			{ name: 'B', year: '1990' },
			{ name: 'Uten år', year: null },
			{ name: 'C 2021', year: null }
		]);
	});
});

describe('groupAwards', () => {
	it('shows a prize won more than once on one line with all its years', () => {
		expect(groupAwards(['Hugo Award (1990)', 'Nebula (1985)', 'Hugo Award (1985)'])).toEqual([
			'Nebula (1985)',
			'Hugo Award (1985, 1990)'
		]);
	});

	it('keeps prizes without a year as they are', () => {
		expect(groupAwards(['Nobelprisen', 'Nobelprisen'])).toEqual(['Nobelprisen']);
	});
});
