import crypto from 'crypto';

/**
 * Validates Telegram WebApp initData using HMAC-SHA256 signature verification.
 * This ensures the data was actually sent by Telegram and not tampered with.
 *
 * @param initData - The raw initData string from Telegram WebApp
 * @param botToken - The bot token used to verify the signature
 * @returns boolean - True if the data is valid, false otherwise
 */
export function validateTelegramData(initData: string, botToken: string): boolean {
  try {
    const urlParams = new URLSearchParams(initData);
    const hash = urlParams.get('hash');

    if (!hash) {
      return false;
    }

    urlParams.delete('hash');

    // Sort keys alphabetically and build data check string
    const dataCheckString = Array.from(urlParams.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([key, value]) => `${key}=${value}`)
      .join('\n');

    // Create secret key from bot token
    const secretKey = crypto
      .createHmac('sha256', 'WebAppData')
      .update(botToken)
      .digest();

    // Calculate expected hash
    const checkHash = crypto
      .createHmac('sha256', secretKey)
      .update(dataCheckString)
      .digest('hex');

    return hash === checkHash;
  } catch {
    return false;
  }
}

/**
 * Extracts user information from Telegram WebApp initData.
 *
 * @param initData - The raw initData string from Telegram WebApp
 * @returns Parsed user object or null if parsing fails
 */
export function extractTelegramUser(initData: string): {
  id: string;
  username?: string;
  firstName?: string;
  lastName?: string;
} | null {
  try {
    const urlParams = new URLSearchParams(initData);
    const userJson = urlParams.get('user');

    if (!userJson) {
      return null;
    }

    const user = JSON.parse(userJson);

    return {
      id: String(user.id),
      username: user.username,
      firstName: user.first_name,
      lastName: user.last_name,
    };
  } catch {
    return null;
  }
}

/**
 * Generates a unique slug for an invite.
 * Format: [groom-name]-[bride-name]-[random-string]
 */
export function generateSlug(groomName: string, brideName: string): string {
  const groom = transliterate(groomName).toLowerCase().replace(/[^a-z0-9]/g, '');
  const bride = transliterate(brideName).toLowerCase().replace(/[^a-z0-9]/g, '');
  const random = crypto.randomBytes(3).toString('hex');
  return `${groom}-${bride}-${random}`;
}

/**
 * Simple transliteration from Cyrillic to Latin.
 */
function transliterate(text: string): string {
  const map: Record<string, string> = {
    а: 'a', б: 'b', в: 'v', г: 'g', д: 'd', е: 'e', ё: 'yo', ж: 'zh',
    з: 'z', и: 'i', й: 'j', к: 'k', л: 'l', м: 'm', н: 'n', о: 'o',
    п: 'p', р: 'r', с: 's', т: 't', у: 'u', ф: 'f', х: 'h', ц: 'c',
    ч: 'ch', ш: 'sh', щ: 'sh', ъ: '', ы: 'y', ь: '', э: 'e', ю: 'yu',
    я: 'ya', А: 'A', Б: 'B', В: 'V', Г: 'G', Д: 'D', Е: 'E', Ё: 'Yo',
    Ж: 'Zh', З: 'Z', И: 'I', Й: 'J', К: 'K', Л: 'L', М: 'M', Н: 'N',
    О: 'O', П: 'P', Р: 'R', С: 'S', Т: 'T', У: 'U', Ф: 'F', Х: 'H',
    Ц: 'C', Ч: 'Ch', Ш: 'Sh', Щ: 'Sh', Ъ: '', Ы: 'Y', Ь: '', Э: 'E',
    Ю: 'Yu', Я: 'Ya',
  };
  return text
    .split('')
    .map((char) => map[char] || char)
    .join('');
}
