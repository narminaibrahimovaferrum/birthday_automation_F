import fs from 'fs';
import path from 'path';
import { CONFIG } from '../config/config';
import { DailySummary } from '../types/employee';

class Logger {
  private logPath: string;

  constructor() {
    this.logPath = CONFIG.paths.logFile;
    this.ensureDir(path.dirname(this.logPath));
  }

  private ensureDir(dir: string) {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  }

  /**
   * Sanitizes sensitive information like bot tokens, chat IDs, or personal names from logs
   */
  private sanitize(message: string): string {
    let sanitized = message;
    if (CONFIG.telegram.botToken) {
      sanitized = sanitized.replace(new RegExp(CONFIG.telegram.botToken, 'g'), '***BOT_TOKEN***');
    }
    if (CONFIG.telegram.chatId) {
      sanitized = sanitized.replace(new RegExp(CONFIG.telegram.chatId, 'g'), '***CHAT_ID***');
    }
    return sanitized;
  }

  private write(level: string, message: string) {
    const timestamp = new Date().toISOString();
    const cleanMessage = this.sanitize(message);
    const line = `[${timestamp}] [${level}] ${cleanMessage}\n`;

    try {
      this.ensureDir(path.dirname(this.logPath));
      fs.appendFileSync(this.logPath, line, 'utf-8');
    } catch (err) {
      console.error('Failed writing to log file:', err);
    }

    if (level === 'ERROR') {
      console.error(`[${level}] ${cleanMessage}`);
    } else if (level === 'WARN') {
      console.warn(`[${level}] ${cleanMessage}`);
    } else {
      console.log(`[${level}] ${cleanMessage}`);
    }
  }

  public info(message: string) {
    this.write('INFO', message);
  }

  public warn(message: string) {
    this.write('WARN', message);
  }

  public error(message: string, error?: any) {
    let errorDetail = '';
    if (error instanceof Error) {
      errorDetail = ` - ${error.message}`;
    } else if (error) {
      errorDetail = ` - ${String(error)}`;
    }
    this.write('ERROR', `${message}${errorDetail}`);
  }

  public printDailySummary(summary: DailySummary) {
    const border = '='.repeat(48);
    const summaryText = [
      '',
      border,
      ` DAILY BIRTHDAY AUTOMATION SUMMARY (${summary.date})`,
      border,
      ` Birthday employees found:     ${summary.totalFound}`,
      ` Successfully sent:           ${summary.sentSuccess}`,
      ` Skipped (Already sent):      ${summary.skippedDuplicate}`,
      ` Asset / Validation Errors:   ${summary.validationErrors}`,
      ` Telegram Sending Errors:     ${summary.sendErrors}`,
      border,
      '',
    ].join('\n');

    console.log(summaryText);
    this.write('SUMMARY', `Daily Summary for ${summary.date}: Found=${summary.totalFound}, Sent=${summary.sentSuccess}, Skipped=${summary.skippedDuplicate}, ValErrors=${summary.validationErrors}, SendErrors=${summary.sendErrors}`);
  }
}

export const logger = new Logger();
