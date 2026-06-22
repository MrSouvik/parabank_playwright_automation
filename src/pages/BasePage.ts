import { Page, Locator } from '@playwright/test';
import { logger } from '../utils/logger';

export abstract class BasePage {
  protected readonly page: Page;
  protected readonly baseUrl: string = process.env.APP_URL!;

  constructor(page: Page) {
    this.page = page;
  }

  async navigateTo(path: string = ''): Promise<void> {
    const url = `${this.baseUrl}${path}`;
    logger.info(`Navigating to: ${url}`);
    await this.page.goto(url, { waitUntil: 'domcontentloaded', timeout: 60000 });
    logger.info(`Page loaded: ${await this.page.title()}`);
  }

  async clickElement(locator: Locator, description: string): Promise<void> {
    logger.debug(`Clicking: ${description}`);
    await locator.waitFor({ state: 'visible', timeout: 15000 });
    await locator.click();
    logger.debug(`Clicked: ${description}`);
  }

  async fillField(locator: Locator, value: string, fieldName: string): Promise<void> {
    logger.debug(`Filling field "${fieldName}" with value: ${fieldName.toLowerCase().includes('password') ? '***' : value}`);
    await locator.waitFor({ state: 'visible', timeout: 15000 });
    await locator.clear();
    await locator.fill(value);
  }

  async getTextContent(locator: Locator, description: string): Promise<string> {
    await locator.waitFor({ state: 'visible', timeout: 15000 });
    const text = (await locator.textContent())?.trim() ?? '';
    logger.debug(`Text content of "${description}": ${text}`);
    return text;
  }

  async isElementVisible(locator: Locator, timeout: number = 5000): Promise<boolean> {
    try {
      await locator.waitFor({ state: 'visible', timeout });
      return true;
    } catch {
      return false;
    }
  }

  async hardWait(milliseconds: number): Promise<void> {
    logger.debug(`Hard wait: ${milliseconds}ms`);
    await this.page.waitForTimeout(milliseconds);
  }

  async takeScreenshot(name: string): Promise<Buffer> {
    logger.info(`Taking screenshot: ${name}`);
    return await this.page.screenshot({ fullPage: true });
  }
}
