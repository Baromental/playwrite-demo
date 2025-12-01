import dotenv from 'dotenv';
import speakeasy from 'speakeasy';
import { EmailOptions, EmailResult } from 'interfaces';
import { chromium, Browser, BrowserContext, Page } from 'playwright';

dotenv.config();

class EmailService {
  private gmailCode: string;
  private gmailEmail: string;
  private gmailPassword: string;

  constructor() {
    if (!process.env.GMAIL_EMAIL || !process.env.GMAIL_PASSWORD || !process.env.GMAIL_2FA_CODE) {
      throw new Error('Missing required environment variables: GMAIL_EMAIL, GMAIL_PASSWORD, or GMAIL_2FA_CODE');
    }
  
    this.gmailEmail = process.env.GMAIL_EMAIL;
    this.gmailCode = process.env.GMAIL_2FA_CODE;
    this.gmailPassword = process.env.GMAIL_PASSWORD;
  }

  get2FACode(secret: string): string {
    return speakeasy.totp({
      secret,
      encoding: "base32"
    });
  }

  sendGoogleEmail = async ({ 
    to, 
    subject, 
    message, 
    attachmentPath 
  }: EmailOptions): Promise<EmailResult> => {
    const browser: Browser = await chromium.launch({
    headless: true, 
    channel: 'chromium',
    args: [
      '--disable-blink-features=AutomationControlled',
      '--disable-dev-shm-usage',
      '--no-sandbox'
    ]
  });

    try {
      const context: BrowserContext = await browser.newContext(
        {
          userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
          viewport: { width: 1280, height: 720 },
          locale: 'en-US',
          timezoneId: 'America/New_York'
        }
      );

      const page: Page = await context.newPage();

      await page.addInitScript(() => {
        Object.defineProperty(navigator, 'webdriver', {
          get: () => undefined
        });
      });

      await page.goto('https://mail.google.com');

      await page.fill('input[type="email"]', this.gmailEmail);
      await page.click('#identifierNext');
        
      await page.waitForSelector('input[type="password"]', { state: 'visible' });
      await page.fill('input[type="password"]', this.gmailPassword);
      await page.click('#passwordNext');

      const tryAnother = page.getByRole('button', { name: /try another way/i });
      if (await tryAnother.isVisible().catch(() => false)) {
        await tryAnother.click();
      }

      const backupButton = page.getByRole('button', { name: /backup codes/i });
      if (await backupButton.isVisible().catch(() => false)) {
        await backupButton.click();
      }

      const selectorBackupCodesInput = '#totpPin';
      const code2FA = this.get2FACode(this.gmailCode);

      await page.fill(selectorBackupCodesInput, code2FA);
      await page.click('#totpNext > div > button > div.VfPpkd-RLmnJb');
    
      await page.waitForSelector('.T-I.T-I-KE.L3', { timeout: 10000 });
      await page.click('.T-I.T-I-KE.L3');

      const emailInput = page.locator('input[aria-label="To recipients"]');
      await emailInput.fill(to);

      const subjectInput = page.locator('input[name="subjectbox"]');
      await subjectInput.fill(subject);

      const body = page.locator('div[aria-label="Message Body"]');
      await body.click();
      await body.fill(message);

      if (attachmentPath) {
        const fileChooserPromise = page.waitForEvent('filechooser');
        await page.click('.a1.aaA.aMZ');
        const fileChooser = await fileChooserPromise;
        await fileChooser.setFiles(attachmentPath);
        await page.waitForTimeout(10000);
      }

      const sendButton = page.getByRole('button', { name: /^send/i });
      await sendButton.click();
      await page.waitForSelector('.bAq', { state: 'visible', timeout: 30000 });

      return { 
        success: true, 
        message: 'Email sent successfully' 
      };
    } catch (error: any) {
      throw new Error(`Failed to send email: ${error.message}`);
    } finally {
      await browser.close();
    }
  };
}

export default new EmailService();
