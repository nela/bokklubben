
import { test, expect } from '@playwright/test';

test.describe('User redirection', () => {

  test('redirects user to login page when unauthenticated', async ({ page }) => {

    await page.goto('http://localhost:5173/');

    await expect(page).toHaveURL('http://localhost:5173/login');
  });
});

