import sharp from 'sharp';
import path from 'path';

async function testNewTemplates() {
  const root = path.resolve(__dirname, '..');
  const cfTemplate = path.join(root, 'assets', 'city-finance', 'template.png');
  const fcTemplate = path.join(root, 'assets', 'ferrum-capital', 'template.png');

  const aliPhoto = path.join(root, 'assets', 'city-finance', 'employees', 'Ali Aliyev.jpg');
  const kamranPhoto = path.join(root, 'assets', 'ferrum-capital', 'employees', 'Kamran Ahmadov.jpg');

  const photoWidth = 488;
  const photoHeight = 580;
  const photoRadius = 52;
  const photoLeft = 165;
  const photoTop = 140;

  // 1. Prepare rounded photo mask
  const photoMask = Buffer.from(`
    <svg width="${photoWidth}" height="${photoHeight}">
      <rect x="0" y="0" width="${photoWidth}" height="${photoHeight}" rx="${photoRadius}" ry="${photoRadius}" fill="#fff"/>
    </svg>
  `);

  // --- Test City Finance ---
  const aliResized = await sharp(aliPhoto)
    .resize(photoWidth, photoHeight, { fit: 'cover', position: 'center' })
    .composite([{ input: photoMask, blend: 'dest-in' }])
    .png()
    .toBuffer();

  // Name patch for City Finance (covering placeholder 'Ad Soyad' and 'Vəzifə / şöbə')
  const cfBannerWidth = 528;
  const cfBannerHeight = 145;
  const cfBannerSvg = Buffer.from(`
    <svg width="${cfBannerWidth}" height="${cfBannerHeight}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="cfGreen" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stop-color="#2CDA84"/>
          <stop offset="100%" stop-color="#5FEAB0"/>
        </linearGradient>
      </defs>
      <!-- Bottom rounded rectangle -->
      <path d="
        M 0 0 
        L ${cfBannerWidth} 0 
        L ${cfBannerWidth} ${cfBannerHeight - 50} 
        Q ${cfBannerWidth} ${cfBannerHeight} ${cfBannerWidth - 50} ${cfBannerHeight} 
        L 50 ${cfBannerHeight} 
        Q 0 ${cfBannerHeight} 0 ${cfBannerHeight - 50} 
        Z
      " fill="url(#cfGreen)"/>

      <!-- Employee Name -->
      <text x="${cfBannerWidth / 2}" y="56" 
            font-family="'Segoe UI', 'Montserrat', Arial, sans-serif" 
            font-size="34" font-weight="800" 
            fill="#063E26" text-anchor="middle">Ali Aliyev</text>

      <!-- Department / Subtitle -->
      <text x="${cfBannerWidth / 2}" y="98" 
            font-family="'Segoe UI', Arial, sans-serif" 
            font-size="20" font-weight="600" 
            fill="#0A5334" opacity="0.9" text-anchor="middle">City Finance</text>
    </svg>
  `);

  const cfOutput = path.join(root, 'output', 'preview', 'City_Finance_New_Template.png');
  await sharp(cfTemplate)
    .composite([
      { input: aliResized, left: photoLeft, top: photoTop },
      { input: cfBannerSvg, left: 145, top: 720 },
    ])
    .png()
    .toFile(cfOutput);
  console.log('City Finance test rendered:', cfOutput);

  // --- Test Ferrum Capital ---
  const kamranResized = await sharp(kamranPhoto)
    .resize(photoWidth, photoHeight, { fit: 'cover', position: 'center' })
    .composite([{ input: photoMask, blend: 'dest-in' }])
    .png()
    .toBuffer();

  const fcBannerWidth = 528;
  const fcBannerHeight = 145;
  const fcBannerSvg = Buffer.from(`
    <svg width="${fcBannerWidth}" height="${fcBannerHeight}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="fcBlue" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stop-color="#2D43A8"/>
          <stop offset="100%" stop-color="#3B5CEB"/>
        </linearGradient>
      </defs>
      <!-- Bottom rounded rectangle -->
      <path d="
        M 0 0 
        L ${fcBannerWidth} 0 
        L ${fcBannerWidth} ${fcBannerHeight - 50} 
        Q ${fcBannerWidth} ${fcBannerHeight} ${fcBannerWidth - 50} ${fcBannerHeight} 
        L 50 ${fcBannerHeight} 
        Q 0 ${fcBannerHeight} 0 ${fcBannerHeight - 50} 
        Z
      " fill="url(#fcBlue)"/>

      <!-- Employee Name -->
      <text x="${fcBannerWidth / 2}" y="56" 
            font-family="'Segoe UI', 'Montserrat', Arial, sans-serif" 
            font-size="34" font-weight="800" 
            fill="#FFFFFF" text-anchor="middle">Kamran Ahmadov</text>

      <!-- Department / Subtitle -->
      <text x="${fcBannerWidth / 2}" y="98" 
            font-family="'Segoe UI', Arial, sans-serif" 
            font-size="20" font-weight="600" 
            fill="#C9D6FF" opacity="0.9" text-anchor="middle">Ferrum Capital</text>
    </svg>
  `);

  const fcOutput = path.join(root, 'output', 'preview', 'Ferrum_Capital_New_Template.png');
  await sharp(fcTemplate)
    .composite([
      { input: kamranResized, left: photoLeft, top: photoTop },
      { input: fcBannerSvg, left: 145, top: 720 },
    ])
    .png()
    .toFile(fcOutput);
  console.log('Ferrum Capital test rendered:', fcOutput);
}

testNewTemplates().catch(console.error);
