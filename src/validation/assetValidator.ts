import fs from 'fs';
import sharp from 'sharp';
import { Employee, ValidationResult } from '../types/employee';
import { AssetResolver } from '../assets/assetResolver';
import { logger } from '../logging/logger';

export class AssetValidator {
  /**
   * Validates template and photo assets for an employee
   */
  public static async validate(employee: Employee): Promise<ValidationResult> {
    const { templatePath, photoPath } = AssetResolver.resolve(employee);

    // 1. Validate Template
    if (!fs.existsSync(templatePath)) {
      const reason = `Template not found at: ${templatePath}`;
      logger.error(`[Validation Failed] Employee ID "${employee.id}": ${reason}`);
      return {
        valid: false,
        employee,
        reason,
        missingAsset: 'template',
      };
    }

    try {
      const templateMeta = await sharp(templatePath).metadata();
      if (!templateMeta.width || !templateMeta.height) {
        throw new Error('Template has empty dimensions');
      }
    } catch (err: any) {
      const reason = `Template image is corrupted or unreadable: ${err.message}`;
      logger.error(`[Validation Failed] Employee ID "${employee.id}": ${reason}`);
      return {
        valid: false,
        employee,
        reason,
        missingAsset: 'template',
      };
    }

    // 2. Validate Employee Photo
    if (!photoPath || !fs.existsSync(photoPath)) {
      const reason = `Photo not found for employee "${employee.name}" in company "${employee.companyId}"`;
      logger.error(`[Validation Failed] Employee ID "${employee.id}": ${reason}`);
      return {
        valid: false,
        employee,
        reason,
        missingAsset: 'photo',
      };
    }

    try {
      const photoMeta = await sharp(photoPath).metadata();
      if (!photoMeta.width || !photoMeta.height) {
        throw new Error('Photo has empty dimensions');
      }
    } catch (err: any) {
      const reason = `Photo image is corrupted or unreadable: ${err.message}`;
      logger.error(`[Validation Failed] Employee ID "${employee.id}": ${reason}`);
      return {
        valid: false,
        employee,
        reason,
        missingAsset: 'photo',
      };
    }

    return {
      valid: true,
      employee,
      templatePath,
      photoPath,
    };
  }
}
