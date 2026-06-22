import { Before, After, BeforeAll, AfterAll, Status } from '@cucumber/cucumber';
import { Browser, BrowserContext, Page, chromium } from '@playwright/test';
import { ScenarioContext } from '../context/ScenarioContext';
import { logger } from '../utils/logger';
import * as dotenv from 'dotenv';

dotenv.config();

let browser: Browser;
let context: BrowserContext;
let page: Page;

export function getPage(): Page {
  return page;
}

BeforeAll(async function () {
  logger.info('==================== TEST SUITE STARTING ====================');
  logger.info('Launching Chromium browser');

  const headless = (process.env.HEADLESS ?? "false").toLowerCase() === "true";
  logger.info(`Headless mode: ${headless}`);

  browser = await chromium.launch({
    headless,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  logger.info('Browser launched successfully');
});

Before(async function (scenario) {
  logger.info(`\n--- Starting Scenario: ${scenario.pickle.name} ---`);

  context = await browser.newContext({
    viewport: { width: 1280, height: 720 },
    ignoreHTTPSErrors: true
  });

  page = await context.newPage();

  page.setDefaultNavigationTimeout(60000);
  page.setDefaultTimeout(30000);

  logger.info(`Browser context and page created for: ${scenario.pickle.name}`);
});

After(async function (scenario) {
  const scenarioName = scenario.pickle.name;

  if (scenario.result?.status === Status.FAILED) {
    logger.error(`Scenario FAILED: ${scenarioName}`);
    try {
      const screenshot = await page.screenshot({ fullPage: true });
      await this.attach(screenshot, 'image/png');
      logger.info('Failure screenshot captured and attached to report');
    } catch (e) {
      logger.warn('Could not capture failure screenshot');
    }
  } else {
    logger.info(`Scenario PASSED: ${scenarioName}`);
  } 

  await page.close();
  
  logger.info(`Browser context closed for: ${scenarioName}`);
});

AfterAll(async function () {
  ScenarioContext.getInstance().clear();
  logger.debug('ScenarioContext cleared');
  await context.close();
  logger.info('Closing browser');
  await browser.close();
  logger.info('==================== TEST SUITE COMPLETED ====================');
});

export { page };
