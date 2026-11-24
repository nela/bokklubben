import { describe, expect, it } from 'vitest';
import { z } from 'zod';
import { field, parseForm } from './form';

const schema = z.object({
	name: field.text(),
	bio: field.optionalText(),
	pages: field.optionalInt(),
	born: field.optionalDate(),
	awards: field.commaList(),
	titles: field.array(z.string()),
	invite: field.checkbox()
});

const formData = (entries: Array<[string, string | File]>) => {
	const data = new FormData();
	entries.forEach(([key, value]) => data.append(key, value));
	return data;
};

describe('parseForm', () => {
	it('turns form strings into typed values', () => {
		const result = parseForm(
			formData([
				['name', ' Frank Herbert '],
				['bio', ''],
				['pages', '412'],
				['born', '1920-10-08'],
				['awards', 'Hugo Award, Nebula Award,'],
				['titles', 'CTO'],
				['invite', 'on']
			]),
			schema
		);

		expect(result._unsafeUnwrap().data).toEqual({
			name: 'Frank Herbert',
			bio: null,
			pages: 412,
			born: new Date('1920-10-08'),
			awards: ['Hugo Award', 'Nebula Award'],
			titles: ['CTO'],
			invite: true
		});
	});

	it('makes a repeated name an array and missing checkboxes empty', () => {
		const result = parseForm(
			formData([
				['name', 'X'],
				['titles', 'CTO'],
				['titles', 'WHIP']
			]),
			schema
		);

		const { data } = result._unsafeUnwrap();
		expect(data.titles).toEqual(['CTO', 'WHIP']);
		expect(data.invite).toBe(false);
		expect(data.awards).toEqual([]);
	});

	it('fails with field errors and keeps the typed values, without files', async () => {
		const result = parseForm(
			formData([
				['name', ''],
				['pages', 'many'],
				['photo', new File(['x'], 'x.jpg')]
			]),
			z.object({ ...schema.shape, photo: field.optionalFile() })
		);

		const failure = result._unsafeUnwrapErr();
		expect(failure.status).toBe(400);
		expect(failure.data.values).toEqual({ name: '', pages: 'many' });
		expect(Object.keys(failure.data.errors)).toEqual(expect.arrayContaining(['name', 'pages']));
	});
});
