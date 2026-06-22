import { Given, When, Then } from '@cucumber/cucumber';
import { expect } from '@playwright/test';
import { getPage } from '../hooks/hooks';
import { HomePage } from '../pages/HomePage';
import { RegistrationPage } from '../pages/RegistrationPage';
import { ScenarioContext, UserCredentials } from '../context/ScenarioContext';
import { DataGenerator } from '../utils/DataGenerator';
import { logger } from '../utils/logger';

Given('I navigate to the ParaBank home page', async function () {
  logger.info('Step: I navigate to the ParaBank home page');
  const page = getPage();
  const homePage = new HomePage(page);
  await homePage.goto();
  logger.info('Home page loaded successfully');
});

When('I click on the {string} link', async function (linkText: string) {
  logger.info(`Step: I click on the "${linkText}" link`);
  const page = getPage();
  const homePage = new HomePage(page);

  if (linkText === 'Register') {
    await homePage.clickRegisterLink();
    await page.waitForSelector('input[id="customer.firstName"]', { timeout: 15000 });
    logger.info('Navigated to registration page');
  } else {
    throw new Error(`Unknown link: "${linkText}"`);
  }
});

When('I fill in the registration form with valid random user data', async function () {
  logger.info('Step: I fill in the registration form with valid random user data');
  const page = getPage();
  const registrationPage = new RegistrationPage(page);

  const credentials: UserCredentials = DataGenerator.generateUserCredentials();
  ScenarioContext.getInstance().set<UserCredentials>('registeredUser', credentials);
  logger.info(`Credentials stored in ScenarioContext. Username: ${credentials.username}`);

  await registrationPage.fillRegistrationForm(credentials);

  await this.attach(
    `Registered User:\nName: ${credentials.firstName} ${credentials.lastName}\nUsername: ${credentials.username}`,
    'text/plain'
  );
});

When('I submit the registration form', async function () {
  logger.info('Step: I submit the registration form');
  const page = getPage();
  const registrationPage = new RegistrationPage(page);
  await registrationPage.submitRegistrationForm();
});

Then('I should see a successful registration confirmation message', async function () {
  logger.info('Step: I should see a successful registration confirmation message');
  const page = getPage();
  const registrationPage = new RegistrationPage(page);

  const screenshot = await page.screenshot({ fullPage: true });
  await this.attach(screenshot, 'image/png');

  const isSuccessful = await registrationPage.isRegistrationSuccessful();

  if (!isSuccessful) {
    const errors = await registrationPage.getErrorMessages();
    const content = await page.content();
    logger.error(`Page URL: ${page.url()}`);
    logger.error(`Page content: ${content.substring(0, 1000)}`);
    const errorMsg = errors.length > 0 ? errors.join('; ') : 'No success message found';
    throw new Error(`Registration was not successful: ${errorMsg}`);
  }

  logger.info('Registration confirmed successful');
});

Then('the new user should be registered with the generated credentials', async function () {
  logger.info('Step: Verifying generated credentials are stored in ScenarioContext');
  const context = ScenarioContext.getInstance();

  expect(context.has('registeredUser')).toBe(true);
  const credentials = context.get<UserCredentials>('registeredUser');

  expect(credentials.username).toBeTruthy();
  expect(credentials.password).toBeTruthy();

  logger.info(`Verified credentials for "${credentials.username}" are ready`);
});
