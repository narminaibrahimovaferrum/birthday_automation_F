import cron from 'node-cron';
import { processBirthdays } from '../src/index';

async function runAutomatedTest() {
  console.log('\n=============================================================');
  console.log('⏱️  AVTOMATİK PLANLAYICININ CANLI SINAĞI');
  console.log('=============================================================');
  console.log('Bu sınaqda siz HЕÇ BİR düyməyə basmayacaqsınız.');
  console.log('Sistem saatın tamamını gözləyəcək və vaxt çatan kimi');
  console.log('AVTOMATİK olaraq oyanıb prosesi icra edəcək.\n');

  const now = new Date();
  // Set trigger for next minute
  const nextMinute = new Date(now.getTime() + 60 * 1000);
  const cronMinute = nextMinute.getMinutes();
  const cronHour = nextMinute.getHours();

  const cronExpression = `${cronMinute} ${cronHour} * * *`;
  const timeStr = `${String(cronHour).padStart(2, '0')}:${String(cronMinute).padStart(2, '0')}:00`;

  console.log(`📅 Cari vaxt:          ${now.toLocaleTimeString('az-AZ')}`);
  console.log(`🎯 Planlaşdırılan vaxt: ${timeStr} (təxminən 30-50 saniyə sonra)`);
  console.log(`⏳ Sistem gözləmə rejimindədir... Zəhmət olmasa gözləyin...\n`);

  let triggered = false;

  const task = cron.schedule(cronExpression, async () => {
    if (triggered) return;
    triggered = true;
    console.log('\n=============================================================');
    console.log(`⚡ [AVTOMATİK TETİKLƏNDİ!] Saat tamam oldu: ${new Date().toLocaleTimeString('az-AZ')}`);
    console.log('   Sistem insan müdaxiləsi olmadan avtomatik işə düşdü!');
    console.log('=============================================================\n');

    await processBirthdays({ isDryRun: true });

    console.log('\n🎉 Gördüyünüz kimi, planlayıcı tam avtomatik işlədi!');
    console.log('İstehsalatda (Production) bu proses hər səhər saat 09:00-da eyni şəkildə baş verir.\n');
    task.stop();
    process.exit(0);
  });
}

runAutomatedTest().catch(console.error);
