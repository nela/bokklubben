import { render, screen } from '@testing-library/svelte';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import TagInput from './tag-input.svelte';

const hiddenValues = (container: HTMLElement) =>
	[...container.querySelectorAll<HTMLInputElement>('input[type="hidden"]')].map((i) => i.value);

describe('TagInput', () => {
	const props = {
		id: 'authors',
		name: 'bookAuthors',
		values: [],
		suggestions: ['Neil Gaiman', 'Terry Pratchett'],
		createLabel: 'Ny forfatter'
	};

	it('adds a suggestion picked from the list', async () => {
		const user = userEvent.setup();
		const { container } = render(TagInput, props);

		await user.type(screen.getByRole('combobox'), 'neil');
		await user.click(screen.getByRole('option', { name: 'Neil Gaiman' }));

		expect(hiddenValues(container)).toEqual(['Neil Gaiman']);
	});

	it('offers to create a name that is not in the list, and marks it as new', async () => {
		const user = userEvent.setup();
		const { container } = render(TagInput, props);

		await user.type(screen.getByRole('combobox'), 'Ursula K. Le Guin');
		await user.click(screen.getByRole('option', { name: /Ny forfatter: «Ursula K. Le Guin»/ }));

		expect(hiddenValues(container)).toEqual(['Ursula K. Le Guin']);
		expect(screen.getByText('(ny)')).toBeInTheDocument();
	});

	it('does not offer to create a name that exists, whatever the case', async () => {
		const user = userEvent.setup();
		render(TagInput, props);

		await user.type(screen.getByRole('combobox'), 'neil gaiman');

		expect(screen.queryByRole('option', { name: /Ny forfatter/ })).not.toBeInTheDocument();
	});

	it('adds a new name with Enter', async () => {
		const user = userEvent.setup();
		const { container } = render(TagInput, props);

		await user.type(screen.getByRole('combobox'), 'Ursula K. Le Guin{Enter}');

		expect(hiddenValues(container)).toEqual(['Ursula K. Le Guin']);
	});

	it('does not add half-typed text when the field loses focus', async () => {
		const user = userEvent.setup();
		const { container } = render(TagInput, props);

		await user.type(screen.getByRole('combobox'), 'Ursu');
		await user.tab();

		expect(hiddenValues(container)).toEqual([]);
	});
});
