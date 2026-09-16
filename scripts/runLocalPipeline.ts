import fs from 'fs';
import path from 'path';
import { processBirthdays } from '../src/index';
import { CONFIG } from '../src/config/config';

async function runLocal() {
  console.log('\n=============================================================');
  console.log('🚀 BIRTHDAY AUTOMATION PIPELINE (LOKAL TEST / TELEGRAMSIZ)');
  console.log('=============================================================\n');

  // 1. Ensure test directories exist
  const outputDir = CONFIG.paths.generated;
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  // 2. Clear state/sent.json for a clean test run
  if (fs.existsSync(CONFIG.paths.stateFile)) {
    fs.writeFileSync(CONFIG.paths.stateFile, JSON.stringify({}, null, 2), 'utf-8');
    console.log('🔄 [State Sıfırlandı] state/sent.json təmizləndi ki, bütün test əməkdaşları üçün render baş tutsun.');
  }

  // 3. Clear previously generated images in output/generated
  const oldFiles = fs.readdirSync(outputDir);
  for (const file of oldFiles) {
    fs.unlinkSync(path.join(outputDir, file));
  }
  console.log(`🧹 [Keş Təmizləndi] output/generated qovluğu təmizləndi (${oldFiles.length} köhnə fayl silindi).\n`);

  // 4. Run the entire pipeline in Dry-Run mode (Telegram-sız lokal icra)
  console.log('▶️  Pipeline icra olunur...\n');
  const summary = await processBirthdays({
    isDryRun: true, // Telegram-a sorğu getmir!
    outputDir: outputDir,
  });

  // 5. List generated posters
  console.log('\n=============================================================');
  console.log('📁 HAZIRLANMIŞ YEKUN TƏBRİK POSTERLƏRİ (output/generated/):');
  console.log('=============================================================');
  const generatedFiles = fs.readdirSync(outputDir).filter(f => f.endsWith('.png'));
  if (generatedFiles.length === 0) {
    console.log('Heç bir poster generasiya edilmədi.');
  } else {
    generatedFiles.forEach((file, idx) => {
      const fullPath = path.join(outputDir, file);
      const stats = fs.statSync(fullPath);
      const sizeKb = Math.round(stats.size / 1024);
      console.log(`  ${idx + 1}. [${sizeKb} KB] ${file}`);
      console.log(`     Tam yol: ${fullPath}`);
    });
  }

  console.log('\n✅ Bütün pipeline Telegram olmadan lokal mühitdə uğurla başa çatdı!\n');
}

runLocal().catch((err) => {
  console.error('Lokal pipeline xətası:', err);
  process.exit(1);
});
