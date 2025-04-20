import { test, expect } from '@playwright/test';

test.describe('Auth and Signin', () => {
	const userAgent =
		'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/69.0.3497.100 Safari/537.36';

	test.use({ userAgent });

	test.describe('User redirection', () => {
		test('redirects user to signin page when unauthenticated', async ({ page }) => {
			await page.goto('/');
			await expect(page).toHaveURL('/signin');
		});

		test('redirects user from signup to signin page when no seed', async ({ page }) => {
			await page.goto('/signup');
			await expect(page).toHaveURL('/signin');
		});

		test('returns user to signin page after failed signin', async ({ page }) => {
			await page.goto('/signin');
			const button = page.getByTestId('email-pass-btn');
			// expect(button).toBeDisabled();

			const email = page.getByTestId('email-input');
			await email.fill('invalid@email.com');

			const password = page.getByTestId('password-input');
			password.fill('invalid123');
			await button.click();

			await expect(page).toHaveURL('/signin');
		});

		test.only('redirects user to home page on successful signin', async ({ page, context }) => {
			await page.goto('/signin');
			const button = page.getByTestId('email-pass-btn');
			// expect(button).toBeDisabled();

			const email = page.getByTestId('email-input');
			await email.fill('n@n.no');

			const password = page.getByTestId('password-input');
			await password.fill('123456');
			await button.click();
			await page.waitForURL('/');

			const sessionCookie = (await context.cookies()).find((c) => c.name === 'session');
			expect(sessionCookie).toBeTruthy();

			await expect(page).toHaveURL('/');
		});

		test.skip('rejects signin from unregistered users', async ({ page }) => {
			await page.goto('/signin');
			const popupPromise = page.waitForEvent('popup');
			await page.getByTestId('google-auth-btn').click();

			const popup = await popupPromise;
			console.log(popup.title());
		});
	});

	test.describe('Admin access', () => {
		test('regular users cannot access admin routes', async ({ page }) => {
			await page.goto('/signin');
			await page.getByTestId('password-input').fill('123456');
			await page.getByTestId('email-input').fill('pleb@n.no');
			await page.getByTestId('email-pass-btn').click();
			await page.waitForURL('http://localhost:5173');

			await page.goto('/invite');

			await expect(page).toHaveURL('/');
		});

		test('admin users can access admin routes', async ({ page }) => {
			await page.goto('/signin');
			await page.getByTestId('password-input').fill('123456');
			await page.getByTestId('email-input').fill('n@n.no');
			await page.getByTestId('email-pass-btn').click();
			await page.waitForURL('/');

			await page.goto('/invite');

			await expect(page).toHaveURL('/invite');
		});
	});
});
