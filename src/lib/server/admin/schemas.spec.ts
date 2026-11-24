import { describe, expect, it } from 'vitest';
import { parseForm } from './form';
import { meetSchema } from './schemas';

const formData = (entries: Record<string, string>) => {
	const data = new FormData();
	Object.entries(entries).forEach(([key, value]) => data.append(key, value));
	return data;
};

const meet = { startsAt: '2026-12-03T19:00', hostId: '', location: '', address: '', notes: '' };

describe('meetSchema', () => {
	it('has no book when the title is empty', () => {
		const result = parseForm(formData({ ...meet, bookTitle: '' }), meetSchema);
		expect(result._unsafeUnwrap().data.book).toBeNull();
	});

	it('splits the form into meet and book, and cleans the ISBN', () => {
		const result = parseForm(
			formData({ ...meet, bookTitle: 'Dune', bookIsbn: '978-0-441-17271-9', bookPages: '412' }),
			meetSchema
		);

		const { data } = result._unsafeUnwrap();
		expect(data.meet.startsAt).toEqual(new Date('2026-12-03T18:00:00Z'));
		expect(data.book).toMatchObject({ title: 'Dune', isbn: '9780441172719', pages: 412 });
	});

	it('asks for a title when other book fields are filled in', () => {
		const result = parseForm(formData({ ...meet, bookPages: '412' }), meetSchema);
		expect(result._unsafeUnwrapErr().data.errors.bookTitle).toBeDefined();
	});

	it('takes genres as repeated fields', () => {
		const data = formData({ ...meet, bookTitle: 'Dune' });
		data.append('bookGenres', 'Science Fiction');
		data.append('bookGenres', 'Klassiker');

		const { book } = parseForm(data, meetSchema)._unsafeUnwrap().data;
		expect(book?.genres).toEqual(['Science Fiction', 'Klassiker']);
	});

	it('takes authors as repeated fields, and asks for a title when only they are filled in', () => {
		const withTitle = formData({ ...meet, bookTitle: 'Good Omens' });
		withTitle.append('bookAuthors', 'Terry Pratchett');
		withTitle.append('bookAuthors', 'Neil Gaiman');
		expect(parseForm(withTitle, meetSchema)._unsafeUnwrap().data.book?.authors).toEqual([
			'Terry Pratchett',
			'Neil Gaiman'
		]);

		const withoutTitle = formData(meet);
		withoutTitle.append('bookAuthors', 'Neil Gaiman');
		expect(
			parseForm(withoutTitle, meetSchema)._unsafeUnwrapErr().data.errors.bookTitle
		).toBeDefined();
	});

	it('has no book when only the title is empty and no genres are chosen', () => {
		const result = parseForm(formData({ ...meet, bookTitle: '' }), meetSchema);
		expect(result._unsafeUnwrap().data.book).toBeNull();
	});

	it('takes attendees as member ids, without duplicates, and none when unchecked', () => {
		const data = formData({ ...meet, highlights: 'God stemning' });
		['3', '5', '3'].forEach((id) => data.append('attendees', id));

		const parsed = parseForm(data, meetSchema)._unsafeUnwrap().data;
		expect(parsed.attendees).toEqual([3, 5]);
		expect(parsed.meet.highlights).toBe('God stemning');

		expect(parseForm(formData(meet), meetSchema)._unsafeUnwrap().data.attendees).toEqual([]);
	});

	it('rejects an invalid ISBN', () => {
		const result = parseForm(formData({ ...meet, bookTitle: 'Dune', bookIsbn: '123' }), meetSchema);
		expect(result._unsafeUnwrapErr().data.errors.bookIsbn).toBeDefined();
	});
});
