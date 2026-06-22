import { Page, Locator } from '@playwright/test';
import { BasePage } from './BasePage';
import { UserCredentials } from '../context/ScenarioContext';
import { logger } from '../utils/logger';

export class RegistrationPage extends BasePage {
  readonly firstNameInput: Locator;
  readonly lastNameInput: Locator;
  readonly addressInput: Locator;
  readonly cityInput: Locator;
  readonly stateInput: Locator;
  readonly zipCodeInput: Locator;
  readonly phoneInput: Locator;
  readonly ssnInput: Locator;

  readonly usernameInput: Locator;
  readonly passwordInput: Locator;
  readonly confirmPasswordInput: Locator;

  readonly registerButton: Locator;

  readonly successMessage: Locator;
  readonly errorMessages: Locator;

  constructor(page: Page) {
    super(page);
    this.firstNameInput = page.locator('input[id="customer.firstName"]');
    this.lastNameInput = page.locator('input[id="customer.lastName"]');
    this.addressInput = page.locator('input[id="customer.address.street"]');
    this.cityInput = page.locator('input[id="customer.address.city"]');
    this.stateInput = page.locator('input[id="customer.address.state"]');
    this.zipCodeInput = page.locator('input[id="customer.address.zipCode"]');
    this.phoneInput = page.locator('input[id="customer.phoneNumber"]');
    this.ssnInput = page.locator('input[id="customer.ssn"]');
    this.usernameInput = page.locator('input[id="customer.username"]');
    this.passwordInput = page.locator('input[id="customer.password"]');
    this.confirmPasswordInput = page.locator('input[id="repeatedPassword"]');
    this.registerButton = page.locator('input[value="Register"]');
    this.successMessage = page.locator('#rightPanel h1.title, #rightPanel p');
    this.errorMessages = page.locator('.error');
  }

  async fillRegistrationForm(credentials: UserCredentials): Promise<void> {
    logger.info('Filling in registration form with generated test data');

    await this.fillField(this.firstNameInput, credentials.firstName, 'First Name');
    await this.fillField(this.lastNameInput, credentials.lastName, 'Last Name');
    await this.fillField(this.addressInput, credentials.address, 'Address');
    await this.fillField(this.cityInput, credentials.city, 'City');
    await this.fillField(this.stateInput, credentials.state, 'State');
    await this.fillField(this.zipCodeInput, credentials.zipCode, 'Zip Code');
    await this.fillField(this.phoneInput, credentials.phone, 'Phone');
    await this.fillField(this.ssnInput, credentials.ssn, 'SSN');
    await this.fillField(this.usernameInput, credentials.username, 'Username');
    await this.fillField(this.passwordInput, credentials.password, 'Password');
    await this.fillField(this.confirmPasswordInput, credentials.password, 'Confirm Password');

    logger.info('Registration form filled successfully');
  }

  async submitRegistrationForm(): Promise<void> {
    logger.info('Submitting registration form');

    await Promise.all([
      this.page.waitForLoadState('domcontentloaded', { timeout: 30000 }),
      this.clickElement(this.registerButton, 'Register button')
    ]);

    logger.info('Registration form submitted, waiting for result page');

    await this.page.waitForSelector('#rightPanel', { timeout: 20000 });
    logger.info('Result panel loaded');
  }

  async isRegistrationSuccessful(): Promise<boolean> {
    logger.info('Checking registration result');

    try {
      await this.page.waitForSelector('#rightPanel h1, #rightPanel .error', { timeout: 15000 });
    } catch {
      logger.warn('Timed out waiting for registration result — checking page content');
    }

    logger.info(`Current URL after registration: ${this.page.url()}`);

    const welcomeHeading = this.page.locator('#rightPanel h1');
    const isVisible = await this.isElementVisible(welcomeHeading, 5000);

    if (isVisible) {
      const headingText = await this.getTextContent(welcomeHeading, 'Registration result heading');
      logger.info(`Registration result heading: "${headingText}"`);

      const isSuccess =
        headingText.toLowerCase().includes('welcome') ||
        headingText.toLowerCase().includes('created') ||
        headingText.toLowerCase().includes('signed up');

      if (isSuccess) {
        logger.info('Registration SUCCESS confirmed via heading');
        return true;
      }
    }

    const pageContent = await this.page.content();
    logger.debug(`Page content snippet: ${pageContent.substring(0, 500)}`);

    const success =
      pageContent.includes('Welcome') ||
      pageContent.includes('created successfully') ||
      pageContent.includes('account was created');

    logger.info(`Registration success (content fallback): ${success}`);
    return success;
  }

  async getErrorMessages(): Promise<string[]> {
    const errors: string[] = [];
    const errorElements = await this.errorMessages.all();
    for (const el of errorElements) {
      const text = (await el.textContent())?.trim();
      if (text) errors.push(text);
    }
    if (errors.length > 0) {
      logger.warn(`Registration errors found: ${errors.join(' | ')}`);
    }
    return errors;
  }
}
