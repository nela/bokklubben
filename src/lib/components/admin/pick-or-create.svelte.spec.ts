import { render, screen } from '@testing-library/svelte';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import PickOrCreate from './pick-or-create.svelte';

const hiddenValues = (container: HTMLElement) =>
	[...container.querySelectorAll<HTMLInputElement>('input[type="hidden"]')].map((i) => i.value);

describe('PickOrCreate', () => {
	const props = {
		id: 'authors',
		name: 'bookAuthors',
		options: ['Neil Gaiman', 'Terry Pratchett'],
		selectLabel: 'Velg forfatter…',
		createLabel: 'Legg til ny forfatter',
		oncreate: () => {}
	};

	it('adds an author picked in the dropdown, and leaves it out of the dropdown', async () => {
		const user = userEvent.setup();
		const { container } = render(PickOrCreate, props);

		await user.selectOptions(screen.getByRole('combobox'), 'Neil Gaiman');

		expect(hiddenValues(container)).toEqual(['Neil Gaiman']);
		expect(screen.queryByRole('option', { name: 'Neil Gaiman' })).not.toBeInTheDocument();
	});

	it('removes an author with ×', async () => {
		const user = userEvent.setup();
		const { container } = render(PickOrCreate, { ...props, chosen: ['Neil Gaiman'] });

		await user.click(screen.getByRole('button', { name: 'Fjern Neil Gaiman' }));

		expect(hiddenValues(container)).toEqual([]);
	});

	it('asks for a new author with the button', async () => {
		const user = userEvent.setup();
		const oncreate = vi.fn();
		render(PickOrCreate, { ...props, oncreate });

		await user.click(screen.getByRole('button', { name: 'Legg til ny forfatter' }));

		expect(oncreate).toHaveBeenCalledOnce();
	});
});
