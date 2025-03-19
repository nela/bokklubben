import { test, expect } from '@playwright/test';

test.describe('User redirection', () => {
	test('redirects user to login page when unauthenticated', async ({ page }) => {
		await page.goto('http://localhost:5173/');
		await expect(page).toHaveURL('http://localhost:5173/login');
	});

	test('returns user to login page after failed login', async ({ page }) => {
		await page.goto('http://localhost:5173/login');
		const button = page.getByText('Log in with Email and Password');
		expect(button).toBeDisabled();

		const email = page.getByPlaceholder('Email');
		await email.fill('invalid@email.com');

		const password = page.getByPlaceholder('Password');
		password.fill('invalid123');
		await button.click();

		await expect(page).toHaveURL('http://localhost:5173/login');
	});

	test('redirects user to home page on successful login', async ({ page }) => {
		await page.goto('http://localhost:5173/login');
		const button = page.getByText('Log in with Email and Password');
		expect(button).toBeDisabled();

		const email = page.getByPlaceholder('Email');
		await email.fill('n@n.no');

		const password = page.getByPlaceholder('Password');
		password.fill('123456');
		await button.click();

		await expect(async () => {
			expect(page.url()).toEqual('http://localhost:5173/');
		}).toPass();
	});
});
