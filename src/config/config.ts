import path from 'path';
import dotenv from 'dotenv';
import { CompanyId } from '../types/employee';

dotenv.config();

export interface TemplateLayout {
  canvasWidth: number;
  canvasHeight: number;
  photo: {
    left: number;
    top: number;
    width: number;
    height: number;
    borderRadius: number;
    topRadius?: number;
  };
  banner: {
    left: number;
    top: number;
    width: number;
    height: number;
    bottomRadius: number;
    gradientStart: string;
    gradientEnd: string;
    nameColor: string;
    subtitleColor: string;
    initialFontSize: number;
    minFontSize: number;
    maxWidth: number;
  };
}

export const CONFIG = {
  timezone: process.env.TIMEZONE || 'Asia/Baku',
  cronSchedule: process.env.CRON_SCHEDULE || '0 9 * * *',
  telegram: {
    botToken: process.env.TELEGRAM_BOT_TOKEN || '',
    chatId: process.env.TELEGRAM_CHAT_ID || '',
  },
  paths: {
    root: path.resolve(__dirname, '../../'),
    data: path.resolve(__dirname, '../../data'),
    excelFile: path.resolve(__dirname, '../../', process.env.DATA_FILE || 'data/employees.xlsx'),
    assets: path.resolve(__dirname, '../../assets'),
    output: path.resolve(__dirname, '../../output'),
    preview: path.resolve(__dirname, '../../output/preview'),
    generated: path.resolve(__dirname, '../../output/generated'),
    logs: path.resolve(__dirname, '../../logs'),
    logFile: path.resolve(__dirname, '../../logs/app.log'),
    stateFile: path.resolve(__dirname, '../../state/sent.json'),
  },
  templates: {
    'city-finance': {
      name: 'City Finance',
      folderName: 'city-finance',
      layout: {
        canvasWidth: 819,
        canvasHeight: 1024,
        photo: {
          left: 171,
          top: 140,
          width: 478,
          height: 590,
          borderRadius: 42,
          topRadius: 42,
        },
        banner: {
          left: 171,
          top: 730,
          width: 478,
          height: 138,
          bottomRadius: 44,
          gradientStart: '#2CDA84',
          gradientEnd: '#5FEAB0',
          nameColor: '#063E26',
          subtitleColor: '#0A5334',
          initialFontSize: 34,
          minFontSize: 22,
          maxWidth: 440,
        },
      } as TemplateLayout,
    },
    'ferrum-capital': {
      name: 'Ferrum Capital',
      folderName: 'ferrum-capital',
      layout: {
        canvasWidth: 819,
        canvasHeight: 1024,
        photo: {
          left: 171,
          top: 140,
          width: 478,
          height: 590,
          borderRadius: 42,
          topRadius: 42,
        },
        banner: {
          left: 171,
          top: 730,
          width: 478,
          height: 138,
          bottomRadius: 44,
          gradientStart: '#2D43A8',
          gradientEnd: '#3B5CEB',
          nameColor: '#FFFFFF',
          subtitleColor: '#C9D6FF',
          initialFontSize: 34,
          minFontSize: 22,
          maxWidth: 440,
        },
      } as TemplateLayout,
    },
  },
};
