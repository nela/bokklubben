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

describe('field.osloDateTime', () => {
	const meetSchema = z.object({ startsAt: field.osloDateTime() });
	const parseStartsAt = (value: string) =>
		parseForm(formData([['startsAt', value]]), meetSchema).map(({ data }) => data.startsAt);

	it('reads the time as Oslo time, winter and summer', () => {
		expect(parseStartsAt('2026-12-03T19:00')._unsafeUnwrap()).toEqual(
			new Date('2026-12-03T18:00:00Z')
		);
		expect(parseStartsAt('2026-06-10T19:00')._unsafeUnwrap()).toEqual(
			new Date('2026-06-10T17:00:00Z')
		);
	});

	it('rejects an empty or invalid value', () => {
		expect(parseStartsAt('').isErr()).toBe(true);
		expect(parseStartsAt('2026-13-40T19:00').isErr()).toBe(true);
	});
});

describe('field.optionalImage', () => {
	const imageSchema = z.object({ photo: field.optionalImage() });
	const parsePhoto = (photo?: File) =>
		parseForm(formData(photo ? [['photo', photo]] : []), imageSchema);

	it('accepts a raster image and an empty input', () => {
		const jpg = new File(['x'], 'a.jpg', { type: 'image/jpeg' });
		expect(parsePhoto(jpg)._unsafeUnwrap().data.photo).toBe(jpg);
		expect(parsePhoto(new File([], ''))._unsafeUnwrap().data.photo).toBeUndefined();
	});

	it('rejects SVG and files over 4 MB', () => {
		const svg = new File(['<svg/>'], 'a.svg', { type: 'image/svg+xml' });
		const huge = new File([new Uint8Array(4 * 1024 * 1024 + 1)], 'a.png', { type: 'image/png' });

		expect(parsePhoto(svg).isErr()).toBe(true);
		expect(parsePhoto(huge).isErr()).toBe(true);
	});
});
