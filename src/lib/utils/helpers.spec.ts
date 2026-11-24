import { describe, expect, it } from 'vitest';
import { matchSpelling } from './helpers';

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
