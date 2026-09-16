import dotenv from 'dotenv';
import { CONFIG } from '../src/config/config';

dotenv.config();

async function checkTelegramConnection() {
  console.log('\n======================================================');
  console.log('🔍 TELEGRAM BOT BAĞLANTISININ YOXLANIŞI');
  console.log('======================================================\n');

  const { botToken, chatId } = CONFIG.telegram;

  if (!botToken || botToken.trim() === '' || botToken.includes('your_telegram_bot_token')) {
    console.error('❌ XƏTA: TELEGRAM_BOT_TOKEN .env faylında tapılmadı və ya doldurulmayıb!');
    console.log('Zəhmət olmasa .env faylını açıb TELEGRAM_BOT_TOKEN dəyərini yazın.\n');
    process.exit(1);
  }

  if (!chatId || chatId.trim() === '' || chatId.includes('your_telegram_channel')) {
    console.error('❌ XƏTA: TELEGRAM_CHAT_ID .env faylında tapılmadı və ya doldurulmayıb!');
    console.log('Zəhmət olmasa .env faylını açıb TELEGRAM_CHAT_ID dəyərini yazın.\n');
    process.exit(1);
  }

  try {
    // 1. Test getMe
    console.log('1. Bot tokeni yoxlanılır...');
    const meRes = await fetch(`https://api.telegram.org/bot${botToken}/getMe`);
    const meData = await meRes.json() as any;

    if (!meData.ok) {
      console.error(`❌ Bot tokeni yanlışdır! Telegram cavabı: ${meData.description}`);
      process.exit(1);
    }

    console.log(`✅ Bot tapıldı: @${meData.result.username} (${meData.result.first_name})\n`);

    // 2. Test sendMessage to chatId
    console.log(`2. Chat ID (${chatId}) üzrə sınaq mesajı göndərilir...`);
    const msgRes = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text: `🎉 <b>Birthday Automation Botu Uğurla Qoşuldu!</b>\n\nSistem hazırdır və doğum günü təbriklərini göndərməyə qadirdir.`,
        parse_mode: 'HTML',
      }),
    });

    const msgData = await msgRes.json() as any;

    if (!msgData.ok) {
      console.error(`❌ Chat ID-yə mesaj göndərilə bilmədi! Telegram cavabı: ${msgData.description}`);
      console.log('💡 Kömək: Əgər qrup və ya kanaldırsa, botun həmin qrupda/kanalda Admin olduğundan əmin olun.\n');
      process.exit(1);
    }

    console.log('✅ Sınaq mesajı Telegram qrupunuza/kanalınıza uğurla çatdı!');
    console.log('\n🎉 Bütün konfiqurasiya düzgündür! İndi "run-now.bat" ilə real poster göndərişini yoxlaya bilərsiniz.\n');
  } catch (err: any) {
    console.error('Şəbəkə və ya sorğu xətası:', err.message);
  }
}

checkTelegramConnection().catch(console.error);
