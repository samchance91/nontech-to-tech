import { expect, test } from "@playwright/test";

test.describe("phase 0 · smoke", () => {
  test("learner home renders without horizontal scroll", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByText("Swift AI Academy").first()).toBeVisible();
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth);
    expect(overflow).toBe(false);
  });

  test("works at 360 px", async ({ page }) => {
    await page.setViewportSize({ width: 360, height: 740 });
    await page.goto("/");
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth);
    expect(overflow).toBe(false);
  });

  test("admin and verify routes exist", async ({ page }) => {
    expect((await page.goto("/admin"))?.status()).toBe(200);
    expect((await page.goto("/verify/SAA-2026-ABCDEFGH"))?.status()).toBe(200);
  });

  test("any sign-up URL returns 404 (public sign-up is off)", async ({ page }) => {
    for (const path of ["/signup", "/sign-up", "/register", "/auth/signup"]) {
      expect((await page.goto(path))?.status(), path).toBe(404);
    }
  });
});
