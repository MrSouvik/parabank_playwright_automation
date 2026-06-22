import { Page, Locator } from '@playwright/test';
import { BasePage } from './BasePage';
import { logger } from '../utils/logger';

export class HomePage extends BasePage {
  readonly registerLink: Locator;
  
  readonly usernameInput: Locator;
  readonly passwordInput: Locator;
  readonly loginButton: Locator;
  
  readonly errorMessage: Locator;

  constructor(page: Page) {
    super(page);
    this.registerLink = page.locator('a[href*="register.htm"]');
    this.usernameInput = page.locator('input[name="username"]');
    this.passwordInput = page.locator('input[name="password"]');
    this.loginButton = page.locator('input[value="Log In"]');
    this.errorMessage = page.locator('.error');
  }

  async goto(): Promise<void> {
    logger.info('Navigating to ParaBank home page');
    await this.navigateTo(process.env.HOME_PAGE!);
  }

  async clickRegisterLink(): Promise<void> {
    logger.info('Clicking Register link');
    await this.clickElement(this.registerLink, 'Register link');
  }

  async login(username: string, password: string): Promise<void> {
    logger.info(`Logging in with username: ${username}`);
    await this.fillField(this.usernameInput, username, 'Username');
    await this.fillField(this.passwordInput, password, 'Password');
    await this.clickElement(this.loginButton, 'Log In button');
    logger.info('Login form submitted');
  }
}
