import type { Tariff, Language } from '../types';

/**
 * Format date to localized string
 */
export function formatDate(date: string | Date, language: Language = 'ru'): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  const options: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  };
  const locale = language === 'ru' ? 'ru-RU' : language === 'zh' ? 'zh-CN' : 'en-US';
  return d.toLocaleDateString(locale, options);
}

/**
 * Format time to HH:MM
 */
export function formatTime(time: string): string {
  return time.substring(0, 5);
}

/**
 * Get days, hours, minutes, seconds until target date
 */
export function getTimeRemaining(targetDate: string | Date): {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  total: number;
  expired: boolean;
} {
  const total = new Date(targetDate).getTime() - Date.now();
  const expired = total <= 0;

  if (expired) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0, total: 0, expired: true };
  }

  const seconds = Math.floor((total / 1000) % 60);
  const minutes = Math.floor((total / 1000 / 60) % 60);
  const hours = Math.floor((total / (1000 * 60 * 60)) % 24);
  const days = Math.floor(total / (1000 * 60 * 60 * 24));

  return { days, hours, minutes, seconds, total, expired: false };
}

/**
 * Tariff limits configuration
 */
export const TARIFF_LIMITS: Record<
  Tariff,
  {
    maxTemplates: number;
    maxGuests: number | null;
    maxPhotos: number | null;
    analytics: 'none' | 'basic' | 'full';
    watermark: boolean;
    export: boolean;
    price: number;
  }
> = {
  FREE: {
    maxTemplates: 2,
    maxGuests: 10,
    maxPhotos: 1,
    analytics: 'none',
    watermark: true,
    export: false,
    price: 0,
  },
  LIGHT: {
    maxTemplates: 6,
    maxGuests: 50,
    maxPhotos: 3,
    analytics: 'basic',
    watermark: false,
    export: false,
    price: 499,
  },
  PREMIUM: {
    maxTemplates: 12,
    maxGuests: null,
    maxPhotos: null,
    analytics: 'full',
    watermark: false,
    export: true,
    price: 999,
  },
};

/**
 * Check if action exceeds tariff limit
 */
export function checkTariffLimit(
  tariff: Tariff,
  limitType: 'maxTemplates' | 'maxGuests' | 'maxPhotos',
  currentValue: number
): boolean {
  const limit = TARIFF_LIMITS[tariff][limitType];
  if (limit === null) return false; // unlimited
  return currentValue >= limit;
}

/**
 * Get tariff display name
 */
export function getTariffName(tariff: Tariff, language: Language = 'ru'): string {
  const names: Record<Tariff, Record<Language, string>> = {
    FREE: { ru: 'Бесплатно', en: 'Free', zh: '免费' },
    LIGHT: { ru: 'LIGHT', en: 'LIGHT', zh: 'LIGHT' },
    PREMIUM: { ru: 'PREMIUM', en: 'PREMIUM', zh: 'PREMIUM' },
  };
  return names[tariff][language];
}

/**
 * Generate a random slug
 */
export function generateSlug(names: string[]): string {
  const timestamp = Date.now().toString(36);
  const namePart = names
    .join('-')
    .toLowerCase()
    .replace(/[^a-z0-9\-]/g, '')
    .substring(0, 20);
  return `${namePart}-${timestamp}`;
}

/**
 * Clamp a number between min and max
 */
export function clamp(num: number, min: number, max: number): number {
  return Math.min(Math.max(num, min), max);
}

/**
 * Debounce function
 */
export function debounce<T extends (...args: unknown[]) => unknown>(
  fn: T,
  ms: number
): (...args: Parameters<T>) => void {
  let timer: ReturnType<typeof setTimeout>;
  return (...args: Parameters<T>) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), ms);
  };
}

/**
 * Check if user agent is Telegram WebApp
 */
export function isTelegramWebApp(): boolean {
  return typeof window !== 'undefined' && !!window.Telegram?.WebApp;
}

/**
 * Share link via Telegram
 */
export function shareViaTelegram(url: string, text?: string): void {
  const shareUrl = `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text || '')}`;
  window.open(shareUrl, '_blank');
}
