# 🎉 Doğum Günü Avtomatlaşdırma Sistemi (Birthday Automation)

**City Finance** və **Ferrum Capital** şirkətləri üçün gündəlik ad günü təbrik posterlərinin avtomatik hazırlanması və Telegram kanalına göndərilməsi sistemi.

Bu sistem hər gün səhər saat 09:00-da (Bakı vaxtı ilə) işə düşür, `data/employees.xlsx` faylından bugünkü ad günlərini (DD + MM) oxuyur, şirkətə uyğun rəsmi şablon və əməkdaş fotosunu birləşdirir, ad üçün dinamik şrift ölçüləndirməsi tətbiq edir və Telegram-a göndərir.

---

## 🚀 Əsas Funksionallıqlar

1. **Excel Oxuyucu (`employeeReader.ts`)**:
   - `employees.xlsx` faylında iki sheet-i dəstəkləyir: `City Finance` və `Ferrum Capital`.
   - Doğum ili tamamilə nəzərə alınmır, yalnız gün və ay (`DD + MM`) müqayisə edilir.
   - Müxtəlif tarix formatlarını (`DD.MM.YYYY`, `YYYY-MM-DD`, Excel serial tarixləri) dəqiq tanıyır.

2. **Şirkət və Asset Həlledicisi (`companyResolver.ts` & `assetResolver.ts`)**:
   - Excel sheet adına görə avtomatik olaraq şirkət şablonunu (`assets/city-finance/template.png` və ya `assets/ferrum-capital/template.png`) seçir.
   - Əməkdaşın fotosunu şirkətin `employees/` qovluğundan ad uyğunluğu və Azərbaycan hərfləri nəzərə alınmaqla tapır.

3. **Yüksək Keyfiyyətli Şəkil Emalı (`imageRenderer.ts` & `textRenderer.ts`)**:
   - **Sharp** kitabxanası ilə şəklin nisbətini pozmadan (`fit: cover`, `position: center`) kəsir və zövqlü yumşaq künclü çərçivəyə yerləşdirir.
   - Uzun adlar üçün (`Məhəmmədəli Əbdülhüseynov` və s.) şrift ölçüsünü avtomatik kiçildir (52px ➔ 48px ➔ 44px ➔ 40px və s.).
   - Azərbaycan əlifbası simvollarını (`Ə`, `ə`, `ı`, `ö`, `ğ`, `ç`, `ş`) tam dəstəkləyir.

4. **Xəta İzolasiyası (`assetValidator.ts`)**:
   - Əgər bir əməkdaşın fotosu yoxdursa və ya fayl oxunmursa, sistem həmin əməkdaş üçün xətanı qeydə alır, lakin **digər əməkdaşların prosesini dayandırmır**.

5. **Təkrar Göndərişin Qarşısının Alınması (`duplicateChecker.ts`)**:
   - `state/sent.json` faylı vasitəsilə eyni gün eyni əməkdaş üçün ikinci dəfə post getməsinin qarşısı alınır.
   - Şəxsi məlumatların yayılmaması üçün açarlar hash ilə saxlanılır (`YYYY-MM-DD_<company>_<hash>`).

6. **Telegram İnteqrasiyası (`telegramService.ts`)**:
   - Telegram Bot API (`sendPhoto`) ilə təbrik posterini və rəsmi təbrik mətnini birbaşa ümumi kanala və ya qrupa göndərir.

7. **Təhlükəsiz Qeydiyyat (`logger.ts`)**:
   - Şəxsi məlumatlar (adlar, telefonlar) və bot tokenləri jurnallarda maskalanır.
   - Hər günün sonunda səliqəli xülasə statistikası (`Daily Summary`) çıxarılır.

---

## 📂 Layihə Strukturu

```
birthday-automation/
├── src/
│   ├── index.ts                     # CLI routing və əsas icra axını
│   ├── config/config.ts             # Şablon koordinatları, yollar və konfiqurasiya
│   ├── excel/employeeReader.ts      # Excel oxuma modulu
│   ├── birthday/birthdayMatcher.ts  # DD + MM müqayisəsi
│   ├── company/companyResolver.ts   # Şirkət sheet həlli
│   ├── assets/assetResolver.ts      # Şablon və foto tapılması
│   ├── validation/assetValidator.ts # Şəkillərin yoxlanılması
│   ├── image/imageRenderer.ts       # Sharp kompozisiya modulu
│   ├── image/textRenderer.ts        # Dinamik şrift ölçülü SVG ad yazıcı
│   ├── duplicate/duplicateChecker.ts# Təkrar göndərmənin yoxlanılması
│   ├── telegram/telegramService.ts  # Telegram Bot API göndəricisi
│   ├── scheduler/scheduler.ts       # Bakı vaxtı ilə 09:00 cron planlayıcı
│   ├── logging/logger.ts            # Təhlükəsiz logger və xülasə
│   └── types/employee.ts            # TypeScript tipləri
├── data/
│   └── employees.xlsx               # Əməkdaşların siyahısı
├── assets/
│   ├── city-finance/
│   │   ├── template.png             # City Finance rəsmi qızılı-göy şablonu
│   │   └── employees/               # Əməkdaş fotoları
│   └── ferrum-capital/
│       ├── template.png             # Ferrum Capital rəsmi platin-mavi şablonu
│       └── employees/               # Əməkdaş fotoları
├── output/
│   ├── preview/                     # Preview rejimi üçün çıxış
│   └── generated/                   # Real və dry-run nəticələri
├── logs/
│   └── app.log                      # İcra jurnalı
├── state/
│   └── sent.json                    # Göndərilmiş postların vəziyyəti
├── .env                             # Telegram və konfiqurasiya dəyişənləri
└── package.json
```

---

## ⚙️ Quraşdırma və Konfiqurasiya

`.env` faylını açıb Telegram Bot Token və Chat ID-nizi daxil edin:

```env
TELEGRAM_BOT_TOKEN=123456789:ABCdefGhIJKlmNoPQRstuVWXyz
TELEGRAM_CHAT_ID=-1001234567890
CRON_SCHEDULE=0 9 * * *
TIMEZONE=Asia/Baku
DATA_FILE=data/employees.xlsx
```

---

## 💻 İstifadə və Əmrlər

### 1. Testləri İcra Etmək
Bütün komponentlərin (Excel oxuyucu, Ad günü yoxlayıcısı, Şrift hesablaması, Dublikat yoxlayıcısı və Validator) avtomatlaşdırılmış testlərini yoxlayır:
```bash
npm test
```

### 2. Preview Rejimi (Tək əməkdaşın şəklinə baxış)
Telegram-a heç nə göndərilmir, poster `output/preview/` qovluğuna yazılır:
```bash
npm run preview -- "Ali Aliyev"
# və ya
npm run preview -- "Kamran Ahmadov"
```

### 3. Dry-Run Rejimi (Simulyasiya)
Bugünkü bütün ad günlərini tapır, şəkilləri `output/generated/` qovluğuna hazırlayır, validator və dublikat məntiqini yoxlayır, Telegram göndərişini təhlükəsiz simulyasiya edir:
```bash
npm run dry-run
```

### 4. Dərhal Göndəriş (Run Now)
Bugünkü ad günlərini icra edir və real olaraq Telegram kanalına göndərir:
```bash
npm run run-now
```

### 5. Gündəlik Planlayıcı (Production Rejimi)
Gündəlik səhər saat 09:00-da (Baku Time) avtomatik işə düşür:
```bash
npm start
```
