import fs from 'fs';
import path from 'path';
import { Employee, ResolvedAssets } from '../types/employee';
import { CONFIG } from '../config/config';

export class AssetResolver {
  private static supportedExtensions = ['.jpg', '.jpeg', '.png', '.webp'];

  /**
   * Resolves template path and photo path for an employee
   */
  public static resolve(employee: Employee): { templatePath: string; photoPath: string | null } {
    const companyFolder = employee.companyId; // 'city-finance' or 'ferrum-capital'
    const templatePath = path.join(CONFIG.paths.assets, companyFolder, 'template.png');
    const employeesDir = path.join(CONFIG.paths.assets, companyFolder, 'employees');

    // Search in company-specific folder, then in common assets/employees folder
    const searchDirs = [
      employeesDir,
      path.join(CONFIG.paths.assets, 'employees'),
    ];

    let photoPath: string | null = null;

    for (const dir of searchDirs) {
      if (!fs.existsSync(dir)) continue;

      // 1. By Employee ID (e.g. CF101.jpg, FC201.png)
      if (employee.employeeIdRaw) {
        photoPath = this.findPhotoByCandidate(dir, employee.employeeIdRaw);
      }

      // 2. By Full Name with Patronymic (e.g. "Ali Aliyev Vaqif.jpg")
      if (!photoPath && employee.fullNameWithPatronymic && employee.patronymic) {
        photoPath = this.findPhotoByCandidate(dir, employee.fullNameWithPatronymic);
      }

      // 3. By Name (Ad Soyad) (e.g. "Ali Aliyev.jpg")
      if (!photoPath) {
        photoPath = this.findPhotoByCandidate(dir, employee.name);
      }

      if (photoPath) break;
    }

    return {
      templatePath,
      photoPath,
    };
  }

  /**
   * Searches for photo matching candidate name/id in directory
   */
  public static findPhotoByCandidate(directory: string, candidate: string): string | null {
    if (!fs.existsSync(directory)) {
      return null;
    }

    const files = fs.readdirSync(directory);
    const normalizedTarget = this.normalizeString(candidate);

    // 1. Exact match (case-insensitive)
    for (const file of files) {
      const ext = path.extname(file).toLowerCase();
      if (!this.supportedExtensions.includes(ext)) continue;

      const baseName = path.basename(file, ext);
      if (this.normalizeString(baseName) === normalizedTarget) {
        return path.join(directory, file);
      }
    }

    // 2. ASCII / transliterated match
    const asciiTarget = this.toAscii(normalizedTarget);
    for (const file of files) {
      const ext = path.extname(file).toLowerCase();
      if (!this.supportedExtensions.includes(ext)) continue;

      const baseName = path.basename(file, ext);
      if (this.toAscii(this.normalizeString(baseName)) === asciiTarget) {
        return path.join(directory, file);
      }
    }

    return null;
  }

  private static normalizeString(str: string): string {
    return str.trim().toLowerCase().replace(/\s+/g, ' ');
  }

  private static toAscii(str: string): string {
    return str
      .replace(/ə/g, 'e')
      .replace(/ı/g, 'i')
      .replace(/ö/g, 'o')
      .replace(/ü/g, 'u')
      .replace(/ğ/g, 'g')
      .replace(/ç/g, 'c')
      .replace(/ş/g, 's')
      .replace(/[^a-z0-9]/g, '');
  }
}
