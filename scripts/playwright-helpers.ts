// Shared helpers for Playwright MCP visual smoke scripts (Phase 7 task
// 7.6). Phase 6 smoke tried flipping the theme with
// `document.documentElement.classList.remove('dark')` + `evaluate` —
// that mutated the DOM but `ThemeContext` didn't re-render, so the
// screenshot came out in the wrong theme. The fix is to click the
// actual toggle button, which dispatches the context update.
//
// Keep this file Playwright-typed-but-dependency-free: we don't import
// from `@playwright/test` because the MCP driver is our only consumer
// and ships its own Playwright runtime. The `Page` type is structurally
// described by the methods we rely on — good enough for the smoke
// scripts' purpose.

export interface SmokePage {
  locator(selector: string): SmokeLocator;
  evaluate<T>(fn: () => T): Promise<T>;
  waitForTimeout(ms: number): Promise<void>;
}

export interface SmokeLocator {
  click(options?: { timeout?: number }): Promise<void>;
  waitFor(options?: {
    state?: "visible" | "attached";
    timeout?: number;
  }): Promise<void>;
}

export type ThemeMode = "light" | "dark";

const TOGGLE_SELECTOR = '[data-testid="theme-toggle"]';
const DARK_PROBE = () => document.documentElement.classList.contains("dark");

/**
 * Ensure the app is in the requested theme by clicking the header
 * toggle until the `<html class>` matches. Idempotent: if the theme is
 * already correct we short-circuit. Waits briefly after the click for
 * Framer Motion's 200ms icon swap to settle so the screenshot won't
 * capture a half-rotated icon.
 */
export async function setTheme(
  page: SmokePage,
  mode: ThemeMode
): Promise<void> {
  const wantDark = mode === "dark";
  const current = await page.evaluate(DARK_PROBE);
  if (current === wantDark) return;

  const toggle = page.locator(TOGGLE_SELECTOR);
  await toggle.waitFor({ state: "visible", timeout: 5000 });
  await toggle.click({ timeout: 5000 });

  // Icon motion is 200ms; wait a tick beyond for the ThemeContext
  // effect + localStorage write to flush.
  await page.waitForTimeout(300);

  const after = await page.evaluate(DARK_PROBE);
  if (after !== wantDark) {
    throw new Error(
      `setTheme(${mode}) failed — document.documentElement.classList still ${
        after ? "includes" : "excludes"
      } "dark"`
    );
  }
}

/**
 * Flip theme twice — useful at the end of a smoke run when you want
 * the app left in its default (dark) state for the next tester.
 */
export async function resetThemeToDark(page: SmokePage): Promise<void> {
  await setTheme(page, "dark");
}
