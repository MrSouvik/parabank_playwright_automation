import { Page, Locator } from '@playwright/test';
import { BasePage } from './BasePage';
import { logger } from '../utils/logger';

export class AccountOverviewPage extends BasePage {
  readonly welcomeMessage: Locator;
  readonly accountsTable: Locator;
  readonly totalBalance: Locator;
  readonly accountRows: Locator;
  readonly rightPanel: Locator;
  readonly logoutLink: Locator;

  constructor(page: Page) {
    super(page);
    this.welcomeMessage = page.locator('#leftPanel .smallText, #namePanel .smallText');
    this.accountsTable = page.locator('#accountTable, table.account');
    this.totalBalance = page.locator('#accountTable tbody tr:last-child');
    this.accountRows = page.locator('#accountTable tbody tr, table tbody tr');
    this.rightPanel = page.locator('#rightPanel');
    this.logoutLink = page.locator('a[href*="logout"]');
  }

  async isLoggedIn(): Promise<boolean> {
    logger.info('Verifying login state');
    const logoutVisible = await this.isElementVisible(this.logoutLink, 10000);
    if (logoutVisible) {
      logger.info('Logout link found — user is logged in');
      return true;
    }
    const pageContent = await this.page.content();
    const loggedIn = pageContent.includes('Log Out') || pageContent.includes('logout');
    logger.info(`Login state (content check): ${loggedIn}`);
    return loggedIn;
  }

  async navigateToOverview(): Promise<void> {
    logger.info('Navigating to account overview');
    await this.navigateTo('/overview.htm');
    await this.page.waitForSelector('#rightPanel', { timeout: 20000 });
  }

  async getAccountBalances(): Promise<Map<string, string>> {
    const balances = new Map<string, string>();
    try {
      await this.accountsTable.waitFor({ state: 'visible', timeout: 10000 });
      const rows = await this.accountRows.all();
      for (const row of rows) {
        const cells = await row.locator('td').all();
        if (cells.length >= 2) {
          const accountId = (await cells[0].textContent())?.trim() ?? '';
          const balance = (await cells[1].textContent())?.trim() ?? '';
          if (accountId && balance) {
            balances.set(accountId, balance);
            logger.info(`Account ${accountId}: Balance = ${balance}`);
          }
        }
      }
    } catch {
      logger.warn('Could not read account table — may be a fresh account without accounts');
    }
    return balances;
  }

  async getTotalBalance(): Promise<string> {
    try {
      await this.totalBalance.waitFor({ state: 'visible', timeout: 8000 });
      const total = ((await this.totalBalance.textContent())?.replace("Total", "")?.trim() ?? 'N/A');
      logger.info(`Total balance on page: ${total}`);
      return total;
    } catch {
      const content = await this.page.content();
      const match = content.match(/\$[\d,]+\.\d{2}/);
      if (match) {
        logger.info(`Balance found in page content: ${match[0]}`);
        return match[0];
      }
      logger.warn('No balance found — fresh registration with no linked accounts');
      return 'N/A (No accounts found)';
    }
  }

  async logAccountInformation(): Promise<void> {
    logger.info('==================== ACCOUNT INFORMATION ====================');
    logger.info(`Page URL: ${this.page.url()}`);
    logger.info(`Page Title: ${await this.page.title()}`);

    const balances = await this.getAccountBalances();

    if (balances.size > 0) {
      logger.info('Account Balances:');
      balances.forEach((balance, accountId) => {
        logger.info(`  Account ID: ${accountId} | Balance: ${balance}`);
        console.log(`  [BALANCE] Account ID: ${accountId} | Balance: ${balance}`);
      });
    } else {
      logger.info('No accounts found in the overview table');
    }

    const totalBalance = await this.getTotalBalance();
    logger.info(`Total Balance Displayed: ${totalBalance}`);
    console.log(`[BALANCE] Total Balance Displayed on Page: ${totalBalance}`);
    logger.info('=============================================================');
  }
}
