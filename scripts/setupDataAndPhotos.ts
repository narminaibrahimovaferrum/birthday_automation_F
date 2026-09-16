import fs from 'fs';
import path from 'path';
import * as xlsx from 'xlsx';

async function setup() {
  const root = path.resolve(__dirname, '..');
  const userUploadDir = 'C:\\Users\\narmina.ibrahimova\\.gemini\\antigravity-ide\\brain\\416f4830-8300-4ab5-aeb9-c837153f2f74\\.user_uploaded';

  const cfEmployees = path.join(root, 'assets', 'city-finance', 'employees');
  const fcEmployees = path.join(root, 'assets', 'ferrum-capital', 'employees');
  const dataDir = path.join(root, 'data');

  fs.mkdirSync(cfEmployees, { recursive: true });
  fs.mkdirSync(fcEmployees, { recursive: true });
  fs.mkdirSync(dataDir, { recursive: true });

  // 1. Copy photos with exact UTF-8 names
  // 5 uploaded photos:
  // media_1789456935730.jpg: Young man in white shirt -> Ali Aliyev
  // media_1789456935767.jpg: Middle aged man in suit -> Kamran Ahmadov
  // media_1789456935809.jpg: Woman in black blazer -> Leyla Hasanli
  // media_1789456935837.jpg: Man in navy suit -> Məhəmmədəli Əbdülhüseynov (and Elmir Qasımov)
  // media_1789456935848.jpg: Woman in light blue shirt -> Nigar Aliyeva

  const photoMapping: Array<{ src: string; destDir: string; name: string }> = [
    { src: 'media_1789456935730.jpg', destDir: cfEmployees, name: 'Ali Aliyev.jpg' },
    { src: 'media_1789456935809.jpg', destDir: cfEmployees, name: 'Leyla Hasanli.jpg' },
    { src: 'media_1789456935837.jpg', destDir: cfEmployees, name: 'Məhəmmədəli Əbdülhüseynov.jpg' },
    { src: 'media_1789456935837.jpg', destDir: cfEmployees, name: 'Mehemmedeli Abdulhuseynov.jpg' }, // ASCII alias

    { src: 'media_1789456935767.jpg', destDir: fcEmployees, name: 'Kamran Ahmadov.jpg' },
    { src: 'media_1789456935848.jpg', destDir: fcEmployees, name: 'Nigar Aliyeva.jpg' },
    { src: 'media_1789456935837.jpg', destDir: fcEmployees, name: 'Elmir Qasımov.jpg' },
  ];

  for (const item of photoMapping) {
    const srcFile = path.join(userUploadDir, item.src);
    const destFile = path.join(item.destDir, item.name);
    if (fs.existsSync(srcFile)) {
      fs.copyFileSync(srcFile, destFile);
      console.log(`Copied ${item.src} -> ${destFile}`);
    } else {
      console.warn(`Source photo not found: ${srcFile}`);
    }
  }

  // 2. Generate data/employees.xlsx
  const workbook = xlsx.utils.book_new();

  // City Finance sheet
  const cityFinanceData = [
    { 'Name': 'Ali Aliyev', 'Birth Date': '15.09.1990' },
    { 'Name': 'Leyla Hasanli', 'Birth Date': '20.09.1995' },
    { 'Name': 'Məhəmmədəli Əbdülhüseynov', 'Birth Date': '15.09.1992' },
    { 'Name': 'Samir Quliyev', 'Birth Date': '15.09.1994' }, // Deliberately missing photo to test error tolerance
  ];
  const cfSheet = xlsx.utils.json_to_sheet(cityFinanceData);
  xlsx.utils.book_append_sheet(workbook, cfSheet, 'City Finance');

  // Ferrum Capital sheet
  const ferrumCapitalData = [
    { 'Name': 'Kamran Ahmadov', 'Birth Date': '15.09.1988' },
    { 'Name': 'Nigar Aliyeva', 'Birth Date': '16.09.1992' },
    { 'Name': 'Elmir Qasımov', 'Birth Date': '15.09.1985' },
  ];
  const fcSheet = xlsx.utils.json_to_sheet(ferrumCapitalData);
  xlsx.utils.book_append_sheet(workbook, fcSheet, 'Ferrum Capital');

  const excelPath = path.join(dataDir, 'employees.xlsx');
  xlsx.writeFile(workbook, excelPath);
  console.log(`Excel file created at: ${excelPath}`);
}

setup().catch(console.error);
