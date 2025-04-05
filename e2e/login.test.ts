import { test, expect } from '@playwright/test';

test.describe('Auth and Login', () => {
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
			const button = page.getByTestId('email-pass-btn');
			expect(button).toBeDisabled();

			const email = page.getByTestId('email-input');
			await email.fill('n@n.no');

			const password = page.getByTestId('password-input');
			password.fill('123456');
			await button.click();

			await Promise.all([
				// page.waitForRequest(/http:\/\/localhost:8080\/.+/),
				page.waitForResponse(/http:\/\/localhost:9099\/.+signInWithPassword.+/),
				page.waitForResponse('/login'),
				page.waitForURL('http://localhost:5173/')
			]);

			const sessionCookie = (await context.cookies()).find((c) => c.name === 'session');
			expect(sessionCookie).toBeTruthy();

			await expect(page).toHaveURL('http://localhost:5173/');
		});

		test.skip('rejects login from unregistered users', async ({ page }) => {
			await page.goto('http://localhost:5173/login');
			const popupPromise = page.waitForEvent('popup');
			await page.getByTestId('google-auth-btn').click();

			const popup = await popupPromise;
			console.log(popup.title());
		});
	});

	test.describe('Admin access', () => {
		test('regular users cannot access admin routes', async ({ page }) => {
			await page.goto('http://localhost:5173/login');
			await page.getByTestId('password-input').fill('123456');
			await page.getByTestId('email-input').fill('pleb@n.no');
			await page.getByTestId('email-pass-btn').click();
			await page.waitForURL('http://localhost:5173');

			await page.goto('http://localhost:5173/invite');

			await expect(page).toHaveURL('http://localhost:5173/');
		});

		test('admin users can access admin routes', async ({ page }) => {
			await page.goto('/login');
			await page.getByTestId('password-input').fill('123456');
			await page.getByTestId('email-input').fill('n@n.no');
			await page.getByTestId('email-pass-btn').click();
			await page.waitForURL('/');

			await page.goto('/invite');

			await expect(page).toHaveURL('/invite');
		});
	});
});
