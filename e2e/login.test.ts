import { test, expect } from '@playwright/test';

test.describe('User redirection', () => {
	test('redirects user to login page when unauthenticated', async ({ page }) => {
		await page.goto('http://localhost:5173/');
		await expect(page).toHaveURL('http://localhost:5173/login');
	});

	test('returns user to login page after failed login', async ({ page }) => {
		await page.goto('http://localhost:5173/login');
		const button = page.getByTestId('email-pass-btn');
		expect(button).toBeDisabled();

		const email = page.getByTestId('email-input');
		await email.fill('invalid@email.com');

		const password = page.getByTestId('password-input');
		password.fill('invalid123');
		await button.click();

		await expect(page).toHaveURL('http://localhost:5173/login');
	});

	test('redirects user to home page on successful login', async ({ page, context }) => {
		await page.goto('http://localhost:5173/login');
		const button = page.getByText('Log in with Email and Password');
		expect(button).toBeDisabled();

		const email = page.getByTestId('email-input');
		await email.fill('n@n.no');

		const password = page.getByTestId('password-input');
		password.fill('123456');
		await button.click();

		await Promise.all([
			page.waitForResponse(/http:\/\/localhost:9099\/.+signInWithPassword.+/),
			page.waitForResponse('/login'),
			page.waitForURL('http://localhost:5173/')
		]);

		const sessionCookie = (await context.cookies()).find((c) => c.name === 'session');
		expect(sessionCookie).toBeTruthy();

		await expect(page).toHaveURL('http://localhost:5173/');
	});
});
