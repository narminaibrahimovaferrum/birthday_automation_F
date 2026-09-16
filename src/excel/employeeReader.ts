import * as xlsx from 'xlsx';
import fs from 'fs';
import crypto from 'crypto';
import { Employee, CompanyId } from '../types/employee';
import { CompanyResolver } from '../company/companyResolver';
import { logger } from '../logging/logger';

export class EmployeeReader {
  /**
   * Reads employees from an Excel file across all recognized company sheets
   */
  public static readEmployees(filePath: string): Employee[] {
    if (!fs.existsSync(filePath)) {
      throw new Error(`Excel file not found at path: ${filePath}`);
    }

    const workbook = xlsx.readFile(filePath, { cellDates: true });
    const employees: Employee[] = [];

    for (const sheetName of workbook.SheetNames) {
      const company = CompanyResolver.resolveFromSheet(sheetName);
      if (!company) {
        logger.warn(`Skipping unrecognized sheet: "${sheetName}"`);
        continue;
      }

      const worksheet = workbook.Sheets[sheetName];
      const rows: any[] = xlsx.utils.sheet_to_json(worksheet, { defval: '', raw: false });

      for (let i = 0; i < rows.length; i++) {
        const row = rows[i];
        const parsed = this.parseEmployeeRow(row, company.id, company.name, sheetName, i + 2);
        if (parsed) {
          employees.push(parsed);
        }
      }
    }

    return employees;
  }

  /**
   * Parses a single row from Excel into an Employee object
   */
  private static parseEmployeeRow(
    row: any,
    companyId: CompanyId,
    companyName: string,
    sheetName: string,
    rowNumber: number
  ): Employee | null {
    // Find Employee ID column dynamically
    const idKey = Object.keys(row).find((key) =>
      /employee\s*id|i[şs][çc]i\s*n[öo]mr[əe]si|taber|kod|^id$/i.test(key.trim())
    );
    const rawEmployeeId = idKey ? String(row[idKey] || '').trim() : undefined;

    // Find name column dynamically (excluding ata adı)
    const nameKey = Object.keys(row).find((key) =>
      /^(ad\s*soyad|ad[ıi]\s*soyad[ıi]|full\s*name|ad|name|employee)$/i.test(key.trim()) ||
      (/ad/i.test(key.trim()) && !/ata/i.test(key.trim()))
    );

    // Find patronymic (Ata adı) column dynamically
    const patronymicKey = Object.keys(row).find((key) =>
      /ata\s*ad[ıi]|patronymic|father/i.test(key.trim())
    );
    const rawPatronymic = patronymicKey ? String(row[patronymicKey] || '').trim() : undefined;

    // Find date column dynamically
    const dateKey = Object.keys(row).find((key) =>
      /birth|date|tarix|dogum|doğum/i.test(key.trim())
    );

    // Find position / department column dynamically
    const positionKey = Object.keys(row).find((key) =>
      /v[əe]zif[əe]|şöb[əe]|sobe|department|position|title|rol/i.test(key.trim())
    );
    const rawPosition = positionKey ? String(row[positionKey] || '').trim() : undefined;

    if (!nameKey || !dateKey) {
      // If row has headers missing or is blank
      return null;
    }

    const rawName = String(row[nameKey] || '').trim();
    const rawDate = String(row[dateKey] || '').trim();

    if (!rawName || !rawDate) {
      return null;
    }

    const parsedDate = this.parseDate(rawDate);
    if (!parsedDate) {
      logger.warn(`[Row ${rowNumber}] Invalid date format for employee "${rawName}": "${rawDate}" in sheet "${sheetName}"`);
      return null;
    }

    // Build unique identifier: use rawEmployeeId if available; otherwise use crypto hash
    const uniqueKey = rawEmployeeId
      ? rawEmployeeId.replace(/[^a-zA-Z0-9_-]/g, '')
      : crypto
          .createHash('sha256')
          .update(`${companyId}_${rawName.toLowerCase()}_${(rawPatronymic || '').toLowerCase()}`)
          .digest('hex')
          .substring(0, 8);

    const fullNameWithPatronymic = rawPatronymic
      ? `${rawName} ${rawPatronymic}`
      : rawName;

    return {
      id: `${companyId}_${uniqueKey}`,
      employeeIdRaw: rawEmployeeId,
      name: rawName,
      patronymic: rawPatronymic,
      fullNameWithPatronymic,
      position: rawPosition || undefined,
      birthDateRaw: rawDate,
      birthDay: parsedDate.day,
      birthMonth: parsedDate.month,
      companyId,
      companyName,
      sheetName,
    };
  }

  /**
   * Parses various date formats into day and month:
   * - DD.MM.YYYY (e.g. 15.09.1990)
   * - DD/MM/YYYY
   * - YYYY-MM-DD
   * - ISO string
   */
  public static parseDate(dateStr: string): { day: number; month: number } | null {
    const trimmed = dateStr.trim();

    // Pattern: DD.MM.YYYY or DD/MM/YYYY or DD-MM-YYYY
    const dmyMatch = trimmed.match(/^(\d{1,2})[./-](\d{1,2})[./-](\d{2,4})$/);
    if (dmyMatch) {
      const day = parseInt(dmyMatch[1], 10);
      const month = parseInt(dmyMatch[2], 10);
      if (this.isValidDayMonth(day, month)) {
        return { day, month };
      }
    }

    // Pattern: YYYY-MM-DD or YYYY/MM/DD
    const ymdMatch = trimmed.match(/^(\d{4})[./-](\d{1,2})[./-](\d{1,2})$/);
    if (ymdMatch) {
      const month = parseInt(ymdMatch[2], 10);
      const day = parseInt(ymdMatch[3], 10);
      if (this.isValidDayMonth(day, month)) {
        return { day, month };
      }
    }

    // Try parsing with JS Date
    const parsedDate = new Date(trimmed);
    if (!isNaN(parsedDate.getTime())) {
      return {
        day: parsedDate.getDate(),
        month: parsedDate.getMonth() + 1,
      };
    }

    return null;
  }

  private static isValidDayMonth(day: number, month: number): boolean {
    return day >= 1 && day <= 31 && month >= 1 && month <= 12;
  }
}
