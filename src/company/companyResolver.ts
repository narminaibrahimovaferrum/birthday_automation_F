import { CompanyId } from '../types/employee';

export class CompanyResolver {
  /**
   * Resolves sheet name from Excel to a standardized CompanyId
   */
  public static resolveFromSheet(sheetName: string): { id: CompanyId; name: string } | null {
    const normalized = sheetName.trim().toLowerCase().replace(/[\s_-]+/g, '');

    if (normalized === 'cityfinance') {
      return {
        id: 'city-finance',
        name: 'City Finance',
      };
    }

    if (normalized === 'ferrumcapital') {
      return {
        id: 'ferrum-capital',
        name: 'Ferrum Capital',
      };
    }

    return null;
  }
}
