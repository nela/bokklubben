import { render, screen } from '@testing-library/svelte';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from "vitest";
import Login from './Login.svelte'

describe('Login.svelte', () => {

	it('should render login-component', () => {
    render(Login);
    expect(screen.getByTestId('login-component')).toBeInTheDocument();
	});

  describe('email and password Login form', () => {
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
        const { getByTestId, getByPlaceholderText } = render(Login);
        const user = userEvent.setup();
        const button = getByTestId('email-pass-btn');
        expect(button).toBeDisabled();

        const emailInput = getByPlaceholderText('Email');
        const passwordInput = getByPlaceholderText('Password');

        await user.type(emailInput, email);
        await user.type(passwordInput, password);

        disabled ? expect(button).toBeDisabled() : expect(button).toBeEnabled();
      });
    });

    it('should call signInHandler.emailAndPassword on click', async () => {
      const user = userEvent.setup();
      const mockSignInWithEmailAndPassword = vi.fn();

      const { getByTestId, getByPlaceholderText } = render(Login, {
        props: {
          handler: {
            emailAndPassword: () => mockSignInWithEmailAndPassword
          }
        }
      });
      const button = getByTestId('email-pass-btn');
      const emailInput = getByPlaceholderText('Email');
      const passwordInput = getByPlaceholderText('Password');

      // Must handle Not Implemented rHTMLFormElement.prototype.requestSubmit  error
      getByTestId('email-pass-form').addEventListener('submit', (e) => e.preventDefault());

      const expectedEmail = 'n@n.no';
      const expectedPass = '123456';

      await user.type(emailInput, expectedEmail);
      await user.type(passwordInput, expectedPass);

      expect(button).toBeEnabled();
      await user.click(button);

      expect(mockSignInWithEmailAndPassword).toHaveBeenCalledOnce();
      // expect(mockLoginWithEmailAndPassword).toHaveBeenCalledWith(expectedEmail, expectedPass);
    });
  });
});
