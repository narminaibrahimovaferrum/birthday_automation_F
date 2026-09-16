import fs from 'fs';
import path from 'path';
import { Employee, SentState } from '../types/employee';
import { CONFIG } from '../config/config';
import { logger } from '../logging/logger';

export class DuplicateChecker {
  private static filePath = CONFIG.paths.stateFile;

  private static ensureStateFile(): void {
    const dir = path.dirname(this.filePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    if (!fs.existsSync(this.filePath)) {
      fs.writeFileSync(this.filePath, JSON.stringify({}, null, 2), 'utf-8');
    }
  }

  private static loadState(): SentState {
    this.ensureStateFile();
    try {
      const content = fs.readFileSync(this.filePath, 'utf-8');
      return JSON.parse(content || '{}');
    } catch (err: any) {
      logger.error(`Failed to read state file at ${this.filePath}`, err);
      return {};
    }
  }

  private static saveState(state: SentState): void {
    this.ensureStateFile();
    try {
      fs.writeFileSync(this.filePath, JSON.stringify(state, null, 2), 'utf-8');
    } catch (err: any) {
      logger.error(`Failed to save state file at ${this.filePath}`, err);
    }
  }

  public static generateKey(dateStr: string, employee: Employee): string {
    return `${dateStr}_${employee.companyId}_${employee.id}`;
  }

  /**
   * Checks if a birthday greeting has already been sent today for this employee
   */
  public static isAlreadySent(dateStr: string, employee: Employee): boolean {
    const state = this.loadState();
    const key = this.generateKey(dateStr, employee);
    return !!state[key] && state[key].status === 'sent';
  }

  /**
   * Records that a birthday greeting was successfully sent
   */
  public static markAsSent(dateStr: string, employee: Employee): void {
    const state = this.loadState();
    const key = this.generateKey(dateStr, employee);

    state[key] = {
      status: 'sent',
      sentAt: new Date().toISOString(),
      employeeHash: employee.id,
      companyId: employee.companyId,
    };

    this.saveState(state);
    logger.info(`State updated: Post recorded as sent for [${key}]`);
  }
}
