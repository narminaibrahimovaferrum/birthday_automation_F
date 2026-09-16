import fs from 'fs';
import path from 'path';
import sharp from 'sharp';
import { Employee, RenderResult } from '../types/employee';
import { CONFIG } from '../config/config';
import { TextRenderer } from './textRenderer';
import { logger } from '../logging/logger';

export class ImageRenderer {
  /**
   * Renders the final birthday poster by compositing template, photo, and dynamic name banner
   */
  public static async render(
    employee: Employee,
    templatePath: string,
    photoPath: string,
    outputDirectory: string
  ): Promise<RenderResult> {
    try {
      if (!fs.existsSync(outputDirectory)) {
        fs.mkdirSync(outputDirectory, { recursive: true });
      }

      const templateConfig = CONFIG.templates[employee.companyId];
      const { photo: photoConfig, banner: bannerConfig, canvasWidth, canvasHeight } = templateConfig.layout;

      // 1. Process Employee Photo (Resize + Crop with fit: 'cover', position: 'center')
      const photoWidth = photoConfig.width;
      const photoHeight = photoConfig.height;
      const topRadius = photoConfig.topRadius ?? photoConfig.borderRadius ?? 48;

      const resizedPhotoBuffer = await sharp(photoPath)
        .resize(photoWidth, photoHeight, {
          fit: 'cover',
          position: 'center',
        })
        .toFormat('png')
        .toBuffer();

      // Apply smooth rounded TOP corners mask (bottom corners remain flat to meet banner)
      const cornerMaskSvg = `
        <svg width="${photoWidth}" height="${photoHeight}" xmlns="http://www.w3.org/2000/svg">
          <path d="
            M 0 ${topRadius}
            Q 0 0 ${topRadius} 0
            L ${photoWidth - topRadius} 0
            Q ${photoWidth} 0 ${photoWidth} ${topRadius}
            L ${photoWidth} ${photoHeight}
            L 0 ${photoHeight}
            Z
          " fill="#ffffff"/>
        </svg>
      `.trim();

      const roundedPhotoBuffer = await sharp(resizedPhotoBuffer)
        .composite([{ input: Buffer.from(cornerMaskSvg), blend: 'dest-in' }])
        .png()
        .toBuffer();

      // 2. Render Name & Department/Position Banner
      const bannerWidth = bannerConfig.width;
      const bannerHeight = bannerConfig.height;

      const fontSize = TextRenderer.calculateOptimalFontSize(
        employee.name,
        bannerConfig.maxWidth,
        bannerConfig.initialFontSize,
        bannerConfig.minFontSize
      );

      const escapedName = this.escapeXml(employee.name);
      const subtitle = employee.position || employee.companyName;

      // Handle subtitle splitting if too long
      let subtitleSvg = '';
      let nameY = 50;
      if (subtitle.length > 28) {
        nameY = 42;
        const words = subtitle.split(' ');
        let line1 = '';
        let line2 = '';
        const halfLength = Math.ceil(subtitle.length / 2);
        for (const word of words) {
          if ((line1 + ' ' + word).trim().length <= halfLength || !line1) {
            line1 = (line1 + ' ' + word).trim();
          } else {
            line2 = (line2 + ' ' + word).trim();
          }
        }
        subtitleSvg = `
          <text 
            x="${Math.round(bannerWidth / 2)}" 
            y="76" 
            font-family="'Segoe UI', 'Montserrat', 'Inter', 'Roboto', 'Arial', sans-serif" 
            font-size="17px" 
            font-weight="600" 
            letter-spacing="0.2px"
            fill="${bannerConfig.subtitleColor}" 
            text-anchor="middle"
          >${this.escapeXml(line1)}</text>
          <text 
            x="${Math.round(bannerWidth / 2)}" 
            y="100" 
            font-family="'Segoe UI', 'Montserrat', 'Inter', 'Roboto', 'Arial', sans-serif" 
            font-size="17px" 
            font-weight="600" 
            letter-spacing="0.2px"
            fill="${bannerConfig.subtitleColor}" 
            text-anchor="middle"
          >${this.escapeXml(line2)}</text>
        `;
      } else {
        nameY = 50;
        subtitleSvg = `
          <text 
            x="${Math.round(bannerWidth / 2)}" 
            y="88" 
            font-family="'Segoe UI', 'Montserrat', 'Inter', 'Roboto', 'Arial', sans-serif" 
            font-size="18px" 
            font-weight="600" 
            letter-spacing="0.3px"
            fill="${bannerConfig.subtitleColor}" 
            text-anchor="middle"
          >${this.escapeXml(subtitle)}</text>
        `;
      }

      const bannerSvg = `
        <svg width="${bannerWidth}" height="${bannerHeight}" xmlns="http://www.w3.org/2000/svg">
          <!-- Employee Name -->
          <text 
            x="${Math.round(bannerWidth / 2)}" 
            y="${nameY}" 
            font-family="'Segoe UI', 'Montserrat', 'Inter', 'Roboto', 'Arial', sans-serif" 
            font-size="${fontSize}px" 
            font-weight="800" 
            letter-spacing="0.3px"
            fill="${bannerConfig.nameColor}" 
            text-anchor="middle"
          >${escapedName}</text>

          <!-- Subtitle: Position or Department -->
          ${subtitleSvg}
        </svg>
      `.trim();

      const bannerBuffer = Buffer.from(bannerSvg);

      // 3. Composite everything onto the base Template
      const safeName = employee.name
        .replace(/[^\w\s\d-]/gi, '')
        .trim()
        .replace(/\s+/g, '_') || 'Employee';
      const safeFileName = `${safeName}_${Date.now()}.png`;
      const outputPath = path.join(outputDirectory, safeFileName);

      await sharp(templatePath)
        .resize(canvasWidth, canvasHeight)
        .composite([
          {
            input: roundedPhotoBuffer,
            top: photoConfig.top,
            left: photoConfig.left,
          },
          {
            input: bannerBuffer,
            top: bannerConfig.top,
            left: bannerConfig.left,
          },
        ])
        .png({ quality: 98 })
        .toFile(outputPath);

      logger.info(
        `Poster successfully generated for ID ${employee.id} (Font size: ${fontSize}px) -> ${outputPath}`
      );

      return {
        employee,
        outputPath,
        success: true,
      };
    } catch (err: any) {
      logger.error(`Error rendering image for employee ID "${employee.id}"`, err);
      return {
        employee,
        outputPath: '',
        success: false,
        error: err.message,
      };
    }
  }

  private static escapeXml(unsafe: string): string {
    return unsafe.replace(/[<>&'"]/g, (c) => {
      switch (c) {
        case '<': return '&lt;';
        case '>': return '&gt;';
        case '&': return '&amp;';
        case '\'': return '&apos;';
        case '"': return '&quot;';
        default: return c;
      }
    });
  }
}
