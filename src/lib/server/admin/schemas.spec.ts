import { describe, expect, it } from 'vitest';
import { parseForm } from './form';
import { meetSchema, memberSchema, sendEmailSchema } from './schemas';

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

	describe('pitches', () => {
		const withPitches = (rows: Array<[string, string, string, string]>) => {
			const data = formData(meet);
			for (const [title, author, pitchedBy, status] of rows) {
				data.append('pitchTitles', title);
				data.append('pitchAuthors', author);
				data.append('pitchedBy', pitchedBy);
				data.append('pitchStatuses', status);
			}
			return parseForm(data, meetSchema);
		};

		it('pairs the rows up and leaves out empty ones', () => {
			const result = withPitches([
				['Sapiens', 'Yuval Noah Harari', '3', 'pitched'],
				['', '', '', 'pitched'],
				['Dune', '', '', 'elected']
			]);

			expect(result._unsafeUnwrap().data.pitches).toEqual([
				{ title: 'Sapiens', author: 'Yuval Noah Harari', pitchedBy: 3, status: 'pitched' },
				{ title: 'Dune', author: null, pitchedBy: null, status: 'elected' }
			]);
		});

		it('asks for a title when a row has an author or pitcher', () => {
			const result = withPitches([['', 'Yuval Noah Harari', '', 'pitched']]);
			expect(result._unsafeUnwrapErr().data.errors.pitches).toEqual([
				'Hver pitch trenger en tittel'
			]);
		});

		it('allows only one elected book', () => {
			const result = withPitches([
				['Sapiens', '', '', 'elected'],
				['Dune', '', '', 'elected']
			]);
			expect(result._unsafeUnwrapErr().data.errors.pitches).toEqual(['Bare én bok kan være valgt']);
		});

		it('has no pitches when creating a meet', () => {
			expect(parseForm(formData(meet), meetSchema)._unsafeUnwrap().data.pitches).toEqual([]);
		});
	});

	it('keeps the id of an existing book chosen for the meet, and none for a new book', () => {
		const chosen = parseForm(formData({ ...meet, bookId: '12', bookTitle: 'Sapiens' }), meetSchema);
		expect(chosen._unsafeUnwrap().data.book?.id).toBe(12);

		const created = parseForm(formData({ ...meet, bookTitle: 'Dune' }), meetSchema);
		expect(created._unsafeUnwrap().data.book?.id).toBeNull();
	});

	it('rejects an invalid ISBN', () => {
		const result = parseForm(formData({ ...meet, bookTitle: 'Dune', bookIsbn: '123' }), meetSchema);
		expect(result._unsafeUnwrapErr().data.errors.bookIsbn).toBeDefined();
	});
});

describe('memberSchema', () => {
	const member = {
		firstName: 'Ola',
		lastName: 'Nordmann',
		nickname: '',
		email: ' Ola.Nordmann@Example.com ',
		role: 'regular',
		memberSince: '2020-01-01',
		memberUntil: ''
	};

	it('lowercases the email and takes titles as keys', () => {
		const data = formData(member);
		data.append('titles', 'CTO');
		data.append('titles', 'BUREAUCRAT');

		expect(parseForm(data, memberSchema)._unsafeUnwrap().data).toMatchObject({
			email: 'ola.nordmann@example.com',
			nickname: null,
			titles: ['CTO', 'BUREAUCRAT'],
			memberUntil: null
		});
	});

	it('rejects an unknown title, role or bad email', () => {
		const data = formData({ ...member, role: 'owner', email: 'not-an-email' });
		data.append('titles', 'King');

		const { errors } = parseForm(data, memberSchema)._unsafeUnwrapErr().data;
		expect(Object.keys(errors)).toEqual(expect.arrayContaining(['role', 'email', 'titles']));
	});

	it('takes a new photo, or a request to remove the current one', () => {
		const photo = new File(['x'], 'ola.jpg', { type: 'image/jpeg' });
		const withPhoto = formData(member);
		withPhoto.append('photo', photo);
		expect(parseForm(withPhoto, memberSchema)._unsafeUnwrap().data).toMatchObject({
			photo,
			removePhoto: false
		});

		const remove = parseForm(formData({ ...member, removePhoto: 'on' }), memberSchema);
		const { data } = remove._unsafeUnwrap();
		expect(data.photo).toBeUndefined();
		expect(data.removePhoto).toBe(true);
	});

	it('rejects an end date before the start date', () => {
		const result = parseForm(formData({ ...member, memberUntil: '2019-12-31' }), memberSchema);
		expect(result._unsafeUnwrapErr().data.errors.memberUntil).toBeDefined();
	});
});

describe('sendEmailSchema', () => {
	const email = { subject: 'Hei {fornavn}', body: 'Velkommen!' };

	it('sends without saving a template by default', () => {
		const result = parseForm(formData(email), sendEmailSchema);
		expect(result._unsafeUnwrap().data).toMatchObject({
			saveAsTemplate: false,
			templateName: null
		});
	});

	it('needs a name to save the email as a template', () => {
		const result = parseForm(formData({ ...email, saveAsTemplate: 'on' }), sendEmailSchema);
		expect(result._unsafeUnwrapErr().data.errors.templateName).toEqual(['Gi malen et navn']);
	});
});
