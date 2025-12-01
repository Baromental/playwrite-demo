import { test, expect } from '@playwright/test';
import EmailService from '../src/services/email.service';

test.describe('Email Service', () => {
  const testEmail = process.env.TEST_EMAIL || 'test@example.com';
  
  test.beforeAll(() => {
    expect(process.env.GMAIL_EMAIL).toBeDefined();
    expect(process.env.GMAIL_PASSWORD).toBeDefined();
    expect(process.env.GMAIL_2FA_CODE).toBeDefined();
  });

  test('should send email successfully', async () => {
    const emailOptions = {
      to: testEmail,
      subject: 'Playwright Email Service Test',
      message: 'This is a test email sent by Playwright test suite.',
      attachmentPath: process.env.TEST_ATTACHMENT_PATH
    };

    const result = await test.step('Send email using EmailService', async () => {
      return await EmailService.sendGoogleEmail(emailOptions);
    });

    expect(result.success).toBe(true);
    expect(result.error).toBeUndefined();
  });
});