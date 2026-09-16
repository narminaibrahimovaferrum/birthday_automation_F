export type CompanyId = 'city-finance' | 'ferrum-capital';

export interface Employee {
  id: string; // Unique ID (e.g. city-finance_CF101 or hash)
  employeeIdRaw?: string; // Excel-dən oxunan Employee ID (məs: CF101, FC202)
  name: string; // Ad Soyad
  patronymic?: string; // Ata adı
  fullNameWithPatronymic?: string; // Ad Soyad + Ata adı
  position?: string; // Vəzifə / şöbə
  birthDateRaw: string;
  birthDay: number;
  birthMonth: number;
  companyId: CompanyId;
  companyName: string;
  sheetName: string;
}

export interface ResolvedAssets {
  employee: Employee;
  templatePath: string;
  photoPath: string;
}

export interface ValidationSuccess {
  valid: true;
  employee: Employee;
  templatePath: string;
  photoPath: string;
}

export interface ValidationFailure {
  valid: false;
  employee: Employee;
  reason: string;
  missingAsset?: 'template' | 'photo';
}

export type ValidationResult = ValidationSuccess | ValidationFailure;

export interface RenderResult {
  employee: Employee;
  outputPath: string;
  success: boolean;
  error?: string;
}

export interface SentStateItem {
  status: 'sent' | 'skipped' | 'failed';
  sentAt: string;
  employeeHash: string;
  companyId: CompanyId;
}

export interface SentState {
  [key: string]: SentStateItem;
}

export interface DailySummary {
  date: string;
  totalFound: number;
  sentSuccess: number;
  skippedDuplicate: number;
  validationErrors: number;
  sendErrors: number;
}
