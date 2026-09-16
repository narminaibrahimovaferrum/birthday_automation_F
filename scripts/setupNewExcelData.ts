import fs from 'fs';
import path from 'path';
import * as xlsx from 'xlsx';

async function setupNewExcel() {
  const root = path.resolve(__dirname, '..');
  const dataDir = path.join(root, 'data');
  const cfEmployees = path.join(root, 'assets', 'city-finance', 'employees');
  const fcEmployees = path.join(root, 'assets', 'ferrum-capital', 'employees');

  fs.mkdirSync(dataDir, { recursive: true });
  fs.mkdirSync(cfEmployees, { recursive: true });
  fs.mkdirSync(fcEmployees, { recursive: true });

  // 1. Create workbook with two sheets
  const workbook = xlsx.utils.book_new();

  // Sheet 1: City Finance
  const cityFinanceRows = [
    {
      'Employee ID': 'CF101',
      'Ad Soyad': 'Ali Aliyev',
      'Ata adı': 'Vaqif oğlu',
      'Doğum Tarixi': '15.09.1990',
      'Vəzifə / Şöbə': 'Kredit mütəxəssisi',
    },
    {
      'Employee ID': 'CF102',
      'Ad Soyad': 'Ali Aliyev', // Same name, different ID and Father's name!
      'Ata adı': 'Rəşid oğlu',
      'Doğum Tarixi': '15.09.1989',
      'Vəzifə / Şöbə': 'Maliyyə analitiki',
    },
    {
      'Employee ID': 'CF103',
      'Ad Soyad': 'Leyla Həsənli',
      'Ata adı': 'İlham qızı',
      'Doğum Tarixi': '20.09.1995',
      'Vəzifə / Şöbə': 'Müştəri xidmətləri',
    },
    {
      'Employee ID': 'CF104',
      'Ad Soyad': 'Məhəmmədəli Əbdülhüseynov',
      'Ata adı': 'Tofiq oğlu',
      'Doğum Tarixi': '15.09.1992',
      'Vəzifə / Şöbə': 'Risklərin idarə olunması',
    },
    {
      'Employee ID': 'CF105',
      'Ad Soyad': 'Samir Quliyev',
      'Ata adı': 'Eldar oğlu',
      'Doğum Tarixi': '15.09.1994',
      'Vəzifə / Şöbə': 'Hüquq şöbəsi', // Missing photo test
    },
  ];

  const cfSheet = xlsx.utils.json_to_sheet(cityFinanceRows);
  xlsx.utils.book_append_sheet(workbook, cfSheet, 'City Finance');

  // Sheet 2: Ferrum Capital
  const ferrumCapitalRows = [
    {
      'Employee ID': 'FC201',
      'Ad Soyad': 'Kamran Əhmədov',
      'Ata adı': 'Nizami oğlu',
      'Doğum Tarixi': '15.09.1988',
      'Vəzifə / Şöbə': 'İnvestisiya direktoru',
    },
    {
      'Employee ID': 'FC202',
      'Ad Soyad': 'Nigar Əliyeva',
      'Ata adı': 'Kamal qızı',
      'Doğum Tarixi': '16.09.1992',
      'Vəzifə / Şöbə': 'Mühasibatlıq',
    },
    {
      'Employee ID': 'FC203',
      'Ad Soyad': 'Elmir Qasımov',
      'Ata adı': 'Həsən oğlu',
      'Doğum Tarixi': '15.09.1985',
      'Vəzifə / Şöbə': 'Satış meneceri',
    },
  ];

  const fcSheet = xlsx.utils.json_to_sheet(ferrumCapitalRows);
  xlsx.utils.book_append_sheet(workbook, fcSheet, 'Ferrum Capital');

  const excelPath = path.join(dataDir, 'employees.xlsx');
  xlsx.writeFile(workbook, excelPath);
  console.log(`Updated Excel created at: ${excelPath}`);

  // 2. Set up Photo Aliases for Employee IDs as well
  // In City Finance:
  // CF101 -> Ali Aliyev (Vaqif oglu)
  // CF102 -> Ali Aliyev (Reshid oglu) - copy distinct photo or same photo
  // CF104 -> Məhəmmədəli Əbdülhüseynov
  const userUploadDir = 'C:\\Users\\narmina.ibrahimova\\.gemini\\antigravity-ide\\brain\\416f4830-8300-4ab5-aeb9-c837153f2f74\\.user_uploaded';

  const photos = [
    { src: 'media_1789456935730.jpg', dest: path.join(cfEmployees, 'CF101.jpg') },
    { src: 'media_1789456935730.jpg', dest: path.join(cfEmployees, 'Ali Aliyev.jpg') },
    { src: 'media_1789456935837.jpg', dest: path.join(cfEmployees, 'CF102.jpg') }, // Distinct photo for 2nd Ali Aliyev!
    { src: 'media_1789456935837.jpg', dest: path.join(cfEmployees, 'Ali Aliyev Rəşid oğlu.jpg') },
    { src: 'media_1789456935809.jpg', dest: path.join(cfEmployees, 'CF103.jpg') },
    { src: 'media_1789456935809.jpg', dest: path.join(cfEmployees, 'Leyla Həsənli.jpg') },
    { src: 'media_1789456935837.jpg', dest: path.join(cfEmployees, 'CF104.jpg') },
    { src: 'media_1789456935837.jpg', dest: path.join(cfEmployees, 'Məhəmmədəli Əbdülhüseynov.jpg') },

    { src: 'media_1789456935767.jpg', dest: path.join(fcEmployees, 'FC201.jpg') },
    { src: 'media_1789456935767.jpg', dest: path.join(fcEmployees, 'Kamran Əhmədov.jpg') },
    { src: 'media_1789456935767.jpg', dest: path.join(fcEmployees, 'Kamran Ahmadov.jpg') },
    { src: 'media_1789456935848.jpg', dest: path.join(fcEmployees, 'FC202.jpg') },
    { src: 'media_1789456935848.jpg', dest: path.join(fcEmployees, 'Nigar Əliyeva.jpg') },
    { src: 'media_1789456935837.jpg', dest: path.join(fcEmployees, 'FC203.jpg') },
    { src: 'media_1789456935837.jpg', dest: path.join(fcEmployees, 'Elmir Qasımov.jpg') },
  ];

  for (const p of photos) {
    const srcPath = path.join(userUploadDir, p.src);
    if (fs.existsSync(srcPath)) {
      fs.copyFileSync(srcPath, p.dest);
    }
  }

  console.log('Photos and aliases configured.');
}

setupNewExcel().catch(console.error);
