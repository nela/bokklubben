import { render, screen } from '@testing-library/svelte';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import PitchRows from './pitch-rows.svelte';

/** What the rows would submit, field by field. */
const submitted = (container: HTMLElement) => {
	const form = document.createElement('form');
	form.append(...container.childNodes);
	const data = new FormData(form);
	return {
		titles: data.getAll('pitchTitles'),
		authors: data.getAll('pitchAuthors'),
		pitchedBy: data.getAll('pitchedBy'),
		statuses: data.getAll('pitchStatuses')
	};
};

describe('PitchRows', () => {
	const props = {
		pitches: [{ title: 'Sapiens', author: null, pitchedBy: 1, status: 'pitched' as const }],
		members: [
			{ id: 1, name: 'Ola Nordmann' },
			{ id: 2, name: 'Kari Nordmann' }
		],
		bookTitles: ['Sapiens'],
		authorNames: []
	};

	it('adds a row, and submits every row in order', async () => {
		const user = userEvent.setup();
		const { container } = render(PitchRows, props);

		await user.click(screen.getByRole('button', { name: 'Legg til pitch' }));
		const titles = screen.getAllByPlaceholderText('Tittel');
		await user.type(titles[1], 'Dune');
		await user.selectOptions(screen.getAllByLabelText('Pitchet av')[1], 'Kari Nordmann');

		expect(submitted(container)).toEqual({
			titles: ['Sapiens', 'Dune'],
			authors: ['', ''],
			pitchedBy: ['1', '2'],
			statuses: ['pitched', 'pitched']
		});
	});

	it('marks one row as elected at a time', async () => {
		const user = userEvent.setup();
		const { container } = render(PitchRows, {
			...props,
			pitches: [
				...props.pitches,
				{ title: 'Dune', author: null, pitchedBy: null, status: 'pitched' }
			]
		});

		const [first, second] = screen.getAllByRole('checkbox');
		await user.click(first);
		await user.click(second);

		expect(submitted(container).statuses).toEqual(['pitched', 'elected']);
	});

	it('removes a row', async () => {
		const user = userEvent.setup();
		const { container } = render(PitchRows, props);

		await user.click(screen.getByRole('button', { name: 'Fjern pitch 1' }));

		expect(submitted(container).titles).toEqual([]);
	});
});
