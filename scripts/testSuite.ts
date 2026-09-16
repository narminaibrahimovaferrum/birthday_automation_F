import assert from 'assert';
import { BirthdayMatcher } from '../src/birthday/birthdayMatcher';
import { EmployeeReader } from '../src/excel/employeeReader';
import { DuplicateChecker } from '../src/duplicate/duplicateChecker';
import { AssetValidator } from '../src/validation/assetValidator';
import { TextRenderer } from '../src/image/textRenderer';
import { Employee } from '../src/types/employee';

async function runTests() {
  console.log('--- Running Birthday Automation Test Suite ---');

  // Test 1: Date Parsing in EmployeeReader
  console.log('Test 1: EmployeeReader date parsing...');
  const d1 = EmployeeReader.parseDate('15.09.1990');
  assert.deepStrictEqual(d1, { day: 15, month: 9 }, 'Should parse DD.MM.YYYY');
  const d2 = EmployeeReader.parseDate('2026-09-15');
  assert.deepStrictEqual(d2, { day: 15, month: 9 }, 'Should parse YYYY-MM-DD');
  const d3 = EmployeeReader.parseDate('5/3/1988');
  assert.deepStrictEqual(d3, { day: 5, month: 3 }, 'Should parse D/M/YYYY');
  console.log('✓ Test 1 Passed');

  // Test 2: Birthday Matcher (Ignoring Year)
  console.log('Test 2: BirthdayMatcher ignoring birth year...');
  const mockEmployees: Employee[] = [
    {
      id: 'cf_1',
      name: 'Ali Aliyev',
      birthDateRaw: '15.09.1990',
      birthDay: 15,
      birthMonth: 9,
      companyId: 'city-finance',
      companyName: 'City Finance',
      sheetName: 'City Finance',
    },
    {
      id: 'cf_2',
      name: 'Leyla Hasanli',
      birthDateRaw: '20.09.1995',
      birthDay: 20,
      birthMonth: 9,
      companyId: 'city-finance',
      companyName: 'City Finance',
      sheetName: 'City Finance',
    },
    {
      id: 'fc_1',
      name: 'Kamran Ahmadov',
      birthDateRaw: '15.09.1988',
      birthDay: 15,
      birthMonth: 9,
      companyId: 'ferrum-capital',
      companyName: 'Ferrum Capital',
      sheetName: 'Ferrum Capital',
    },
  ];

  const matched = BirthdayMatcher.findBirthdays(mockEmployees, { day: 15, month: 9 });
  assert.strictEqual(matched.length, 2, 'Should match 2 employees for 15.09 regardless of year 1990 vs 1988');
  assert.strictEqual(matched[0].name, 'Ali Aliyev');
  assert.strictEqual(matched[1].name, 'Kamran Ahmadov');
  console.log('✓ Test 2 Passed');

  // Test 3: Text Renderer Dynamic Font Scaling
  console.log('Test 3: TextRenderer dynamic font auto-scaling...');
  const shortNameSize = TextRenderer.calculateOptimalFontSize('Ali Aliyev', 480, 34, 22);
  const longNameSize = TextRenderer.calculateOptimalFontSize('Məhəmmədəli Əbdülhüseynov-Əliyev', 480, 34, 22);
  assert.strictEqual(shortNameSize, 34, 'Short name should keep initial font size');
  assert(longNameSize < 34, 'Long name should scale down');
  console.log(`✓ Test 3 Passed: Short name size = ${shortNameSize}px, Long name size = ${longNameSize}px`);

  // Test 4: Duplicate Checker
  console.log('Test 4: DuplicateChecker prevention...');
  const testEmp = mockEmployees[0];
  const testDate = '2026-09-15';
  
  // Before marking
  const alreadySentBefore = DuplicateChecker.isAlreadySent(testDate, testEmp);
  // Mark as sent
  DuplicateChecker.markAsSent(testDate, testEmp);
  const alreadySentAfter = DuplicateChecker.isAlreadySent(testDate, testEmp);

  assert.strictEqual(alreadySentAfter, true, 'Should detect already sent employee for today');
  console.log('✓ Test 4 Passed');

  // Test 5: Asset Validator for missing photo
  console.log('Test 5: AssetValidator handling missing photo gracefully...');
  const invalidEmp: Employee = {
    id: 'cf_unknown',
    name: 'Qeydiyyatsiz Sexs',
    birthDateRaw: '15.09.2000',
    birthDay: 15,
    birthMonth: 9,
    companyId: 'city-finance',
    companyName: 'City Finance',
    sheetName: 'City Finance',
  };
  const valResult = await AssetValidator.validate(invalidEmp);
  assert.strictEqual(valResult.valid, false, 'Should fail validation for missing photo');
  console.log('✓ Test 5 Passed');

  console.log('\nAll 5 automated unit tests PASSED successfully! 🚀\n');
}

runTests().catch((err) => {
  console.error('Test suite failed:', err);
  process.exit(1);
});
