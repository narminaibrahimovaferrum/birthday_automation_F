import fs from 'fs';
import path from 'path';
import sharp from 'sharp';

async function generateTemplates() {
  const width = 1080;
  const height = 1350;

  // 1. City Finance Template (Luxury Navy & Gold)
  const cityFinanceSvg = `
  <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="cfBg" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#070E1E" />
        <stop offset="50%" stop-color="#0F1E38" />
        <stop offset="100%" stop-color="#0A1426" />
      </linearGradient>
      <linearGradient id="goldGrad" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stop-color="#DFBA5A" />
        <stop offset="50%" stop-color="#FFEBB0" />
        <stop offset="100%" stop-color="#C59B3F" />
      </linearGradient>
      <linearGradient id="goldRibbon" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#F39C12" stop-opacity="0.3" />
        <stop offset="100%" stop-color="#F1C40F" stop-opacity="0.05" />
      </linearGradient>
      <radialGradient id="glow" cx="50%" cy="20%" r="60%">
        <stop offset="0%" stop-color="#DFBA5A" stop-opacity="0.18" />
        <stop offset="100%" stop-color="#070E1E" stop-opacity="0" />
      </radialGradient>
      <radialGradient id="photoBackGlow" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stop-color="#DFBA5A" stop-opacity="0.12" />
        <stop offset="100%" stop-color="#070E1E" stop-opacity="0" />
      </radialGradient>
      <filter id="goldShadow" x="-20%" y="-20%" width="140%" height="140%">
        <feDropShadow dx="0" dy="4" stdDeviation="6" flood-color="#000000" flood-opacity="0.7"/>
      </filter>
    </defs>

    <!-- Background -->
    <rect width="${width}" height="${height}" fill="url(#cfBg)" />
    <rect width="${width}" height="${height}" fill="url(#glow)" />

    <!-- Festive Background Geometric Shapes & Ribbons -->
    <path d="M -100 200 Q 200 50 600 250 T 1200 150" fill="none" stroke="url(#goldGrad)" stroke-width="2" opacity="0.3" />
    <path d="M -50 350 Q 300 200 800 400 T 1250 300" fill="none" stroke="url(#goldGrad)" stroke-width="1.5" opacity="0.2" />
    
    <!-- Sparkles and Confetti -->
    <circle cx="140" cy="180" r="4" fill="#FFEBB0" opacity="0.8" />
    <circle cx="220" cy="110" r="2.5" fill="#FFEBB0" opacity="0.6" />
    <circle cx="860" cy="190" r="3.5" fill="#FFEBB0" opacity="0.8" />
    <circle cx="940" cy="130" r="5" fill="#FFEBB0" opacity="0.7" />
    <circle cx="180" cy="1180" r="3" fill="#FFEBB0" opacity="0.5" />
    <circle cx="900" cy="1120" r="4" fill="#FFEBB0" opacity="0.6" />
    <polygon points="120,280 126,295 141,295 129,304 133,319 120,310 107,319 111,304 99,295 114,295" fill="url(#goldGrad)" opacity="0.5" transform="scale(0.8) translate(30, 20)" />
    <polygon points="980,260 986,275 1001,275 989,284 993,299 980,290 967,299 971,284 959,275 974,275" fill="url(#goldGrad)" opacity="0.5" transform="scale(0.8) translate(220, 20)" />

    <!-- Company Badge Top -->
    <g transform="translate(390, 65)">
      <rect x="0" y="0" width="300" height="46" rx="23" fill="#132442" stroke="url(#goldGrad)" stroke-width="1.5" />
      <text x="150" y="28" font-family="'Segoe UI', 'Montserrat', Arial, sans-serif" font-size="16" font-weight="700" letter-spacing="4" fill="#FFEBB0" text-anchor="middle">CITY FINANCE</text>
    </g>

    <!-- Main Title: AD GÜNÜNÜZ MÜBARƏK! -->
    <text x="540" y="195" font-family="'Segoe UI', 'Cinzel', 'Playfair Display', serif" font-size="54" font-weight="800" letter-spacing="3" fill="url(#goldGrad)" text-anchor="middle" filter="url(#goldShadow)">
      AD GÜNÜNÜZ MÜBARƏK!
    </text>
    <text x="540" y="245" font-family="'Segoe UI', 'Arial', sans-serif" font-size="20" font-weight="400" letter-spacing="1.5" fill="#D2DDF0" text-anchor="middle" opacity="0.85">
      Sizə möhkəm cansağlığı, xoşbəxtlik və yeni nailiyyətlər arzulayırıq
    </text>

    <!-- Photo Slot Background Glow & Placeholder (x:260, y:340, w:560, h:680) -->
    <rect x="230" y="310" width="620" height="740" rx="40" fill="url(#photoBackGlow)" />
    <rect x="256" y="336" width="568" height="688" rx="30" fill="none" stroke="url(#goldGrad)" stroke-width="2" opacity="0.4" />
    <rect x="260" y="340" width="560" height="680" rx="28" fill="#0C172B" />

    <!-- Name Card Underline and Decorative flourish (y:1140) -->
    <line x1="380" y1="1135" x2="700" y2="1135" stroke="url(#goldGrad)" stroke-width="2" opacity="0.7" />
    <circle cx="540" cy="1135" r="4" fill="#FFEBB0" />

    <!-- Subtitle / Wishes below name -->
    <text x="540" y="1175" font-family="'Segoe UI', 'Arial', sans-serif" font-size="19" font-weight="500" letter-spacing="2" fill="url(#goldGrad)" text-anchor="middle">
      TƏBRİK EDİRİK!
    </text>

    <!-- Footer Branding -->
    <g transform="translate(0, 1260)">
      <line x1="150" y1="0" x2="930" y2="0" stroke="#1C2E4C" stroke-width="1" />
      <text x="540" y="38" font-family="'Segoe UI', Arial, sans-serif" font-size="14" font-weight="500" letter-spacing="3" fill="#889BB8" text-anchor="middle">
        CITY FINANCE NON-BANK CREDIT ORGANIZATION
      </text>
    </g>
  </svg>
  `;

  // 2. Ferrum Capital Template (Modern High-Tech Platinum & Cyan)
  const ferrumCapitalSvg = `
  <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="fcBg" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#0E1218" />
        <stop offset="50%" stop-color="#141B24" />
        <stop offset="100%" stop-color="#0A0E14" />
      </linearGradient>
      <linearGradient id="cyanGrad" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stop-color="#00E5FF" />
        <stop offset="50%" stop-color="#80F4FF" />
        <stop offset="100%" stop-color="#00B0FF" />
      </linearGradient>
      <radialGradient id="cyanGlow" cx="50%" cy="20%" r="65%">
        <stop offset="0%" stop-color="#00E5FF" stop-opacity="0.18" />
        <stop offset="100%" stop-color="#0E1218" stop-opacity="0" />
      </radialGradient>
      <radialGradient id="fcPhotoGlow" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stop-color="#00E5FF" stop-opacity="0.15" />
        <stop offset="100%" stop-color="#0E1218" stop-opacity="0" />
      </radialGradient>
      <filter id="cyanShadow" x="-20%" y="-20%" width="140%" height="140%">
        <feDropShadow dx="0" dy="4" stdDeviation="6" flood-color="#000000" flood-opacity="0.8"/>
      </filter>
    </defs>

    <!-- Background -->
    <rect width="${width}" height="${height}" fill="url(#fcBg)" />
    <rect width="${width}" height="${height}" fill="url(#cyanGlow)" />

    <!-- Modern Abstract Geo Lines -->
    <polygon points="0,0 350,0 200,300 0,200" fill="#00E5FF" opacity="0.03" />
    <polygon points="1080,0 730,0 880,300 1080,200" fill="#00B0FF" opacity="0.03" />
    <line x1="80" y1="180" x2="320" y2="180" stroke="url(#cyanGrad)" stroke-width="1.5" opacity="0.4" />
    <line x1="760" y1="180" x2="1000" y2="180" stroke="url(#cyanGrad)" stroke-width="1.5" opacity="0.4" />

    <!-- Dots & Accents -->
    <circle cx="120" cy="140" r="3" fill="#00E5FF" opacity="0.8" />
    <circle cx="250" cy="90" r="2.5" fill="#80F4FF" opacity="0.6" />
    <circle cx="880" cy="120" r="4" fill="#00E5FF" opacity="0.7" />
    <circle cx="960" cy="200" r="3" fill="#80F4FF" opacity="0.8" />
    <circle cx="160" cy="1160" r="3.5" fill="#00E5FF" opacity="0.6" />
    <circle cx="920" cy="1140" r="3.5" fill="#00E5FF" opacity="0.6" />

    <!-- Company Badge Top -->
    <g transform="translate(370, 65)">
      <rect x="0" y="0" width="340" height="46" rx="23" fill="#182332" stroke="url(#cyanGrad)" stroke-width="1.5" />
      <text x="170" y="28" font-family="'Segoe UI', 'Montserrat', Arial, sans-serif" font-size="16" font-weight="700" letter-spacing="4" fill="#80F4FF" text-anchor="middle">FERRUM CAPITAL</text>
    </g>

    <!-- Main Title: AD GÜNÜNÜZ MÜBARƏK! -->
    <text x="540" y="195" font-family="'Segoe UI', 'Montserrat', 'Arial', sans-serif" font-size="54" font-weight="800" letter-spacing="3" fill="url(#cyanGrad)" text-anchor="middle" filter="url(#cyanShadow)">
      AD GÜNÜNÜZ MÜBARƏK!
    </text>
    <text x="540" y="245" font-family="'Segoe UI', 'Arial', sans-serif" font-size="20" font-weight="400" letter-spacing="1.5" fill="#CFD8DC" text-anchor="middle" opacity="0.9">
      Sizə yeni zirvələr, tükənməz enerji və böyük uğurlar arzulayırıq
    </text>

    <!-- Photo Slot Background Glow & Placeholder (x:260, y:340, w:560, h:680) -->
    <rect x="230" y="310" width="620" height="740" rx="40" fill="url(#fcPhotoGlow)" />
    <rect x="256" y="336" width="568" height="688" rx="30" fill="none" stroke="url(#cyanGrad)" stroke-width="2" opacity="0.5" />
    <rect x="260" y="340" width="560" height="680" rx="28" fill="#131B26" />

    <!-- Name Card Underline and Decorative flourish (y:1140) -->
    <line x1="380" y1="1135" x2="700" y2="1135" stroke="url(#cyanGrad)" stroke-width="2" opacity="0.7" />
    <circle cx="540" cy="1135" r="4" fill="#00E5FF" />

    <!-- Subtitle / Wishes below name -->
    <text x="540" y="1175" font-family="'Segoe UI', 'Arial', sans-serif" font-size="19" font-weight="600" letter-spacing="2.5" fill="url(#cyanGrad)" text-anchor="middle">
      TƏBRİK EDİRİK!
    </text>

    <!-- Footer Branding -->
    <g transform="translate(0, 1260)">
      <line x1="150" y1="0" x2="930" y2="0" stroke="#1F2C3D" stroke-width="1" />
      <text x="540" y="38" font-family="'Segoe UI', Arial, sans-serif" font-size="14" font-weight="500" letter-spacing="3" fill="#78909C" text-anchor="middle">
        FERRUM CAPITAL INVESTMENT &amp; FINANCIAL SERVICES
      </text>
    </g>
  </svg>
  `;

  const cfOut = path.resolve(__dirname, '../assets/city-finance/template.png');
  const fcOut = path.resolve(__dirname, '../assets/ferrum-capital/template.png');

  fs.mkdirSync(path.dirname(cfOut), { recursive: true });
  fs.mkdirSync(path.dirname(fcOut), { recursive: true });

  console.log('Rendering City Finance template...');
  await sharp(Buffer.from(cityFinanceSvg)).png({ quality: 100 }).toFile(cfOut);

  console.log('Rendering Ferrum Capital template...');
  await sharp(Buffer.from(ferrumCapitalSvg)).png({ quality: 100 }).toFile(fcOut);

  console.log('Templates created successfully at:');
  console.log(' -', cfOut);
  console.log(' -', fcOut);
}

generateTemplates().catch(console.error);
