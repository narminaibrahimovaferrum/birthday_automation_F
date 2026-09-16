import fs from 'fs';
import path from 'path';
import { CONFIG } from '../config/config';
import { Employee } from '../types/employee';
import { logger } from '../logging/logger';

export class TelegramService {
  /**
   * Sends rendered birthday poster to the configured Telegram channel/group
   */
  public static async sendBirthdayPost(
    employee: Employee,
    imagePath: string,
    isDryRun: boolean = false
  ): Promise<{ success: boolean; error?: string }> {
    if (isDryRun) {
      logger.info(
        `[DRY RUN] Simulating Telegram post for employee ID "${employee.id}" (Image: ${path.basename(imagePath)})`
      );
      return { success: true };
    }

    const { botToken, chatId } = CONFIG.telegram;

    if (!botToken || !chatId) {
      const errorMsg = 'Telegram credentials missing. Please set TELEGRAM_BOT_TOKEN and TELEGRAM_CHAT_ID in .env';
      logger.error(errorMsg);
      return { success: false, error: errorMsg };
    }

    try {
      if (!fs.existsSync(imagePath)) {
        throw new Error(`Image file to send not found: ${imagePath}`);
      }

      const fileBuffer = fs.readFileSync(imagePath);
      const blob = new Blob([fileBuffer], { type: 'image/png' });

      const formData = new FormData();
      formData.append('chat_id', chatId);
      formData.append('photo', blob, path.basename(imagePath));

      const url = `https://api.telegram.org/bot${botToken}/sendPhoto`;
      const response = await fetch(url, {
        method: 'POST',
        body: formData,
      });

      const data = await response.json() as any;

      if (!response.ok || !data.ok) {
        const desc = data?.description || response.statusText;
        throw new Error(`Telegram API Error (${response.status}): ${desc}`);
      }

      logger.info(`Telegram message successfully delivered for ID: ${employee.id}`);
      return { success: true };
    } catch (err: any) {
      logger.error(`Failed to send Telegram message for employee ID "${employee.id}"`, err);
      return { success: false, error: err.message };
    }
  }

  private static escapeHtml(text: string): string {
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
  }
}
