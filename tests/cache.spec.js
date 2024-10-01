const { test, expect } = require("@playwright/test");

test("homepage loads and contains expected elements", async ({ page }) => {
  // Navigate to the homepage
  await page.goto("http://localhost:3000");

  // Check if the page title is correct
  await expect(page).toHaveTitle("Your Page Title");

  // Check if the main heading is present
  const heading = page.locator("h1");
  await expect(heading).toHaveText("Welcome to My Website");

  // Check if the navigation menu is present and has the expected items
  const navItems = page.locator("nav ul li");
  await expect(navItems).toHaveCount(3);
  await expect(navItems.nth(0)).toHaveText("Home");
  await expect(navItems.nth(1)).toHaveText("About");
  await expect(navItems.nth(2)).toHaveText("Contact");

  // Check if the main sections are present
  await expect(page.locator("#home")).toBeVisible();
  await expect(page.locator("#about")).toBeVisible();
  await expect(page.locator("#contact")).toBeVisible();

  // Check if the footer is present
  const footer = page.locator("footer");
  await expect(footer).toBeVisible();
  await expect(footer).toContainText("2023 Your Name or Company");
});
