import path from 'path';
import { CONFIG } from './config/config';
import { EmployeeReader } from './excel/employeeReader';
import { BirthdayMatcher } from './birthday/birthdayMatcher';
import { AssetResolver } from './assets/assetResolver';
import { AssetValidator } from './validation/assetValidator';
import { ImageRenderer } from './image/imageRenderer';
import { DuplicateChecker } from './duplicate/duplicateChecker';
import { TelegramService } from './telegram/telegramService';
import { DailyScheduler } from './scheduler/scheduler';
import { logger } from './logging/logger';
import { DailySummary, Employee } from './types/employee';

interface ProcessOptions {
  isDryRun?: boolean;
  targetDate?: { day: number; month: number; dateStr: string };
  outputDir?: string;
}

export async function processBirthdays(options: ProcessOptions = {}): Promise<DailySummary> {
  const isDryRun = options.isDryRun ?? false;
  const targetDate = options.targetDate ?? BirthdayMatcher.getTargetDate();
  const outputDir = options.outputDir ?? CONFIG.paths.generated;

  logger.info(`Starting birthday processing for date: ${targetDate.dateStr} (DryRun: ${isDryRun})`);

  const summary: DailySummary = {
    date: targetDate.dateStr,
    totalFound: 0,
    sentSuccess: 0,
    skippedDuplicate: 0,
    validationErrors: 0,
    sendErrors: 0,
  };

  // 1. Read Excel
  let allEmployees: Employee[] = [];
  try {
    allEmployees = EmployeeReader.readEmployees(CONFIG.paths.excelFile);
    logger.info(`Successfully loaded ${allEmployees.length} total employee records from Excel.`);
  } catch (err: any) {
    logger.error('Failed reading employees from Excel', err);
    return summary;
  }

  // 2. Birthday Matcher (DD + MM comparison, year is ignored)
  const birthdayEmployees = BirthdayMatcher.findBirthdays(allEmployees, targetDate);
  summary.totalFound = birthdayEmployees.length;

  if (birthdayEmployees.length === 0) {
    logger.info(`No employee birthdays found for ${targetDate.dateStr}.`);
    logger.printDailySummary(summary);
    return summary;
  }

  logger.info(`Found ${birthdayEmployees.length} employee(s) celebrating birthdays today!`);

  // 3. Process each birthday employee
  for (const employee of birthdayEmployees) {
    logger.info(`Processing employee: [${employee.companyId}] ${employee.name} (${employee.birthDateRaw})`);

    // Validation Layer (Template + Photo)
    const validation = await AssetValidator.validate(employee);
    if (!validation.valid) {
      summary.validationErrors++;
      // Problematic employee does NOT stop others!
      continue;
    }

    // Duplicate Check
    if (DuplicateChecker.isAlreadySent(targetDate.dateStr, employee)) {
      logger.info(`Skipping duplicate: Birthday post already sent today for ID [${employee.id}]`);
      summary.skippedDuplicate++;
      continue;
    }

    // Image Renderer
    const renderResult = await ImageRenderer.render(
      employee,
      validation.templatePath,
      validation.photoPath,
      outputDir
    );

    if (!renderResult.success || !renderResult.outputPath) {
      summary.validationErrors++;
      continue;
    }

    // Telegram Sender
    const sendResult = await TelegramService.sendBirthdayPost(
      employee,
      renderResult.outputPath,
      isDryRun
    );

    if (sendResult.success) {
      summary.sentSuccess++;
      if (!isDryRun) {
        DuplicateChecker.markAsSent(targetDate.dateStr, employee);
      }
    } else {
      summary.sendErrors++;
    }
  }

  // 4. Log and print Daily Summary
  logger.printDailySummary(summary);
  return summary;
}

/**
 * Handles preview mode for a specific employee by name
 */
export async function runPreview(searchName: string): Promise<void> {
  logger.info(`Running Preview Mode for employee name: "${searchName}"...`);

  let allEmployees: Employee[] = [];
  try {
    allEmployees = EmployeeReader.readEmployees(CONFIG.paths.excelFile);
  } catch (err: any) {
    logger.error('Failed reading Excel for preview', err);
    return;
  }

  const target = allEmployees.find((emp) =>
    emp.name.toLowerCase().includes(searchName.trim().toLowerCase())
  );

  if (!target) {
    logger.error(`No employee matching "${searchName}" found in Excel.`);
    console.log(`Available employees in Excel: ${allEmployees.map((e) => e.name).join(', ')}`);
    return;
  }

  logger.info(`Found employee: "${target.name}" (${target.companyName})`);

  const validation = await AssetValidator.validate(target);
  if (!validation.valid) {
    logger.error(`Validation failed for preview: ${validation.reason}`);
    return;
  }

  const renderResult = await ImageRenderer.render(
    target,
    validation.templatePath,
    validation.photoPath,
    CONFIG.paths.preview
  );

  if (renderResult.success) {
    console.log(`\n🎉 Preview created successfully!`);
    console.log(`Output file: ${renderResult.outputPath}\n`);
  } else {
    logger.error(`Preview rendering failed: ${renderResult.error}`);
  }
}

// Entry Point CLI Routing
async function main() {
  const args = process.argv.slice(2);

  if (args.includes('--preview')) {
    const previewIdx = args.indexOf('--preview');
    const nameArg = args[previewIdx + 1];
    if (!nameArg) {
      console.error('Please specify an employee name: npm run preview -- "Ali Aliyev"');
      process.exit(1);
    }
    await runPreview(nameArg);
    return;
  }

  if (args.includes('--dry-run')) {
    await processBirthdays({ isDryRun: true });
    return;
  }

  if (args.includes('--now')) {
    await processBirthdays({ isDryRun: false });
    return;
  }

  if (args.includes('--schedule') || args.length === 0) {
    DailyScheduler.start(async () => {
      await processBirthdays({ isDryRun: false });
    });
    return;
  }

  console.log(`Unknown arguments. Available options:
    --preview "Employee Name"  : Generates preview image to output/preview/
    --dry-run                  : Runs full simulation without sending to Telegram
    --now                      : Runs full workflow immediately and sends to Telegram
    --schedule                 : Starts daily 09:00 scheduler
  `);
}

if (require.main === module) {
  main().catch((err) => {
    logger.error('Fatal application error in main', err);
    process.exit(1);
  });
}
