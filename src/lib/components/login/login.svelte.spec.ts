import { render } from '@testing-library/svelte';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import Login from './login.svelte';
import type { Auth } from 'firebase/auth';

describe('Login.svelte', () => {
	it('should render login-component', () => {
		render(Login);
		// expect(screen.queryByDisplayValue).toBeInTheDocument();
	});

	describe('email and password login', () => {
		[
			{
				email: 'n',
				password: '123456',
				disabled: true
			},
			{
				email: 'n@n',
				password: '123456',
				disabled: true
			},
			{
				email: 'n@n.n',
				password: '123456',
				disabled: true
			},
			{
				email: 'n@n.no',
				password: '12345',
				disabled: true
			},
			{
				email: 'n@n.no',
				password: '123456',
				disabled: false
			}
		].forEach(({ email, password, disabled }) => {
			it(`sets disabled to ${disabled} when email: ${email}, password: ${password}`, async () => {
				const { getByTestId } = render(Login);
				const user = userEvent.setup();
				const button = getByTestId('email-pass-btn');
				expect(button).toBeDisabled();

				const emailInput = getByTestId('email-input');
				const passwordInput = getByTestId('password-input');

				await user.type(emailInput, email);
				await user.type(passwordInput, password);

				if (disabled) {
					expect(button).toBeDisabled();
				} else {
					expect(button).toBeEnabled();
				}
			});
		});

		it('should call signInHandler.emailAndPassword on click', async () => {
			const user = userEvent.setup();

			const mockPerformAuth = vi.fn();
			const mockSignOut = vi.fn();

			const { getByTestId, getByPlaceholderText } = render(Login, {
				props: {
					performAuth: mockPerformAuth,
					auth: {
						signOut: mockSignOut()
					} as unknown as Auth
				}
			});
			const button = getByTestId('email-pass-btn');
			const emailInput = getByPlaceholderText('Email');
			const passwordInput = getByPlaceholderText('Password');

			const expectedEmail = 'n@n.no';
			const expectedPass = '123456';

			await user.type(emailInput, expectedEmail);
			await user.type(passwordInput, expectedPass);

			expect(button).toBeEnabled();
			await user.click(button);

			expect(mockPerformAuth).toHaveBeenCalledOnce();
		});
	});
});
