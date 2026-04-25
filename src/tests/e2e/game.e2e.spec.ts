import { test, expect } from '@playwright/test';

test.describe('Future Factorius', () => {
  test('game loads and shows canvas', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('#game-canvas')).toBeVisible();
    await expect(page.locator('#top-bar')).toBeVisible();
    await expect(page.locator('#bottom-nav')).toBeVisible();
  });

  test('shows resource bar and cash display', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('#cash-display');
    await expect(page.locator('#cash-value')).toBeVisible();
  });

  test('can open build menu', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('#build-panel')).toBeVisible();
    await expect(page.locator('#harvester-buttons')).toBeVisible();
  });

  test('can open research screen', async ({ page }) => {
    await page.goto('/');
    await page.click('#btn-research');
    await expect(page.locator('#research-screen')).not.toHaveClass(/hidden/);
    await expect(page.locator('#research-tree')).toBeVisible();
  });

  test('can open trade screen', async ({ page }) => {
    await page.goto('/');
    await page.click('#btn-trade');
    await expect(page.locator('#trade-screen')).not.toHaveClass(/hidden/);
  });

  test('can open routes screen', async ({ page }) => {
    await page.goto('/');
    await page.click('#btn-routes');
    await expect(page.locator('#routes-screen')).not.toHaveClass(/hidden/);
  });

  test('can open game menu and see save options', async ({ page }) => {
    await page.goto('/');
    await page.click('#btn-menu');
    await expect(page.locator('#save-screen')).not.toHaveClass(/hidden/);
    await expect(page.locator('#btn-new-game')).toBeVisible();
    await expect(page.locator('#btn-save-game')).toBeVisible();
  });

  test('speed controls work', async ({ page }) => {
    await page.goto('/');
    await page.click('#btn-speed-2');
    await expect(page.locator('#btn-speed-2')).toHaveClass(/active/);
  });

  test('close screen button works', async ({ page }) => {
    await page.goto('/');
    await page.click('#btn-research');
    await page.click('#research-screen .screen-close');
    await expect(page.locator('#research-screen')).toHaveClass(/hidden/);
  });
});
