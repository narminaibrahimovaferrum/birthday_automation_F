import { Employee } from '../types/employee';
import { CONFIG } from '../config/config';

export class BirthdayMatcher {
  /**
   * Returns current day and month in Baku timezone (Asia/Baku) or given date
   */
  public static getTargetDate(customDate?: Date): { day: number; month: number; dateStr: string } {
    const date = customDate || new Date();

    // Format date in target timezone
    const formatter = new Intl.DateTimeFormat('en-GB', {
      timeZone: CONFIG.timezone,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });

    const parts = formatter.formatToParts(date);
    const day = parseInt(parts.find((p) => p.type === 'day')?.value || '1', 10);
    const month = parseInt(parts.find((p) => p.type === 'month')?.value || '1', 10);
    const year = parts.find((p) => p.type === 'year')?.value || '2026';

    const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

    return { day, month, dateStr };
  }

  /**
   * Filters employees whose birthday matches the given day and month (ignoring birth year)
   */
  public static findBirthdays(
    employees: Employee[],
    target?: { day: number; month: number }
  ): Employee[] {
    const targetDate = target || this.getTargetDate();

    return employees.filter(
      (emp) => emp.birthDay === targetDate.day && emp.birthMonth === targetDate.month
    );
  }
}
