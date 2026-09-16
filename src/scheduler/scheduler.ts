import cron from 'node-cron';
import { CONFIG } from '../config/config';
import { logger } from '../logging/logger';

export class DailyScheduler {
  /**
   * Starts the daily cron scheduler for running birthday automation
   */
  public static start(jobCallback: () => Promise<void>): void {
    const expression = CONFIG.cronSchedule;
    const timezone = CONFIG.timezone;

    logger.info(`Initializing Birthday Automation Daily Scheduler...`);
    logger.info(`Schedule: "${expression}" | Timezone: ${timezone}`);

    if (!cron.validate(expression)) {
      logger.error(`Invalid cron expression: "${expression}"`);
      return;
    }

    cron.schedule(
      expression,
      async () => {
        logger.info(`[Scheduler Triggered] Executing daily birthday workflow at ${new Date().toISOString()}`);
        try {
          await jobCallback();
        } catch (err: any) {
          logger.error('Unhandled error in scheduled birthday workflow', err);
        }
      },
      {
        timezone,
      }
    );

    logger.info(`Daily scheduler is active and waiting for next trigger (09:00 Baku Time).`);
  }
}
