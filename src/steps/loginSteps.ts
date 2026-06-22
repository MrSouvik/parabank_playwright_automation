import { When, Then } from '@cucumber/cucumber';
import { expect } from '@playwright/test';
import { getPage } from '../hooks/hooks';
import { HomePage } from '../pages/HomePage';
import { AccountOverviewPage } from '../pages/AccountOverviewPage';
import { ScenarioContext, UserCredentials } from '../context/ScenarioContext';
import { logger } from '../utils/logger';

When('I log in with the registered user credentials', async function () {
  logger.info('Step: I log in with the registered user credentials');

  const credentials = ScenarioContext.getInstance().get<UserCredentials>('registeredUser');
  logger.info(`Retrieved credentials from ScenarioContext for username: "${credentials.username}"`);

  const page = getPage();
  const homePage = new HomePage(page);

  await homePage.goto();

  await homePage.usernameInput.waitFor({ state: 'visible', timeout: 15000 });

  await Promise.all([
    page.waitForLoadState('domcontentloaded', { timeout: 30000 }),
    homePage.login(credentials.username, credentials.password)
  ]);

  logger.info(`Login submitted for user: ${credentials.username}`);

  await page.waitForSelector('#leftPanel, .error', { timeout: 20000 });
  logger.info(`Current URL after login: ${page.url()}`);
});

Then('I should be logged in successfully', async function () {
  logger.info('Step: I should be logged in successfully');
  const page = getPage();
  const accountOverviewPage = new AccountOverviewPage(page);

  const isLoggedIn = await accountOverviewPage.isLoggedIn();

  const screenshot = await page.screenshot({ fullPage: true });
  await this.attach(screenshot, 'image/png');

  if (!isLoggedIn) {
    const content = await page.content();
    logger.error(`Login failed. Page URL: ${page.url()}`);
    logger.error(`Page content snippet: ${content.substring(0, 800)}`);
    throw new Error('Login was not successful: user does not appear to be logged in');
  }

  logger.info('Login verified successfully — user is logged in');
});

Then('I should see the account overview page', async function () {
  logger.info('Step: I should see the account overview page');
  const page = getPage();
  const accountOverviewPage = new AccountOverviewPage(page);

  await accountOverviewPage.navigateToOverview();

  logger.info(`Current URL: ${page.url()}`);

  const rightPanelVisible = await accountOverviewPage.isElementVisible(
    accountOverviewPage.rightPanel,
    10000
  );

  expect(rightPanelVisible).toBe(true);
  logger.info('Account overview page confirmed visible');
});

Then('I should log the account balance displayed on the page', async function () {
  logger.info('Step: I should log the account balance displayed on the page');
  const page = getPage();
  const accountOverviewPage = new AccountOverviewPage(page);

  await accountOverviewPage.logAccountInformation();

  const totalBalance = await accountOverviewPage.getTotalBalance();

  await this.attach(
    `Account Balance Information:\nTotal Balance: ${totalBalance}\nURL: ${page.url()}`,
    'text/plain'
  );

  const finalScreenshot = await page.screenshot({ fullPage: true });
  await this.attach(finalScreenshot, 'image/png');

  logger.info(` Final balance logged: ${totalBalance}`);
  console.log(`\n${'='.repeat(60)}`);
  console.log(`  ACCOUNT BALANCE DISPLAYED ON PAGE: ${totalBalance}`);
  console.log(`${'='.repeat(60)}\n`);
});


