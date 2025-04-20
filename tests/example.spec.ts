import { test, expect } from '@playwright/test';

test('has title', async ({ page }) => {
  // Replace with the actual URL or path to your app's homepage
  // await page.goto('http://localhost:5000'); // Example: Local Vite dev server
  await page.goto('/'); // Assumes baseURL is configured in playwright.config.ts

  // Expect a title "to contain" a substring.
  // Replace 'Your App Title' with the expected title or part of it
  await expect(page).toHaveTitle(/Bookmarko/);
});

test('example test that always passes', async ({ page }) => {
  expect(true).toBe(true);
}); 