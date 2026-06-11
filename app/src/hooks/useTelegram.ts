import { useEffect, useCallback } from 'react';

interface TelegramUser {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  language_code?: string;
  is_premium?: boolean;
}

interface TelegramWebApp {
  ready: () => void;
  expand: () => void;
  close: () => void;
  setHeaderColor: (color: string) => void;
  setBackgroundColor: (color: string) => void;
  enableClosingConfirmation: () => void;
  disableClosingConfirmation: () => void;
  showConfirm: (message: string, callback: (confirmed: boolean) => void) => void;
  showPopup: (params: { title?: string; message: string; buttons?: Array<{ id: string; type?: string; text: string }> }, callback?: (buttonId: string) => void) => void;
  showAlert: (message: string, callback?: () => void) => void;
  HapticFeedback: {
    impactOccurred: (style: 'light' | 'medium' | 'heavy' | 'rigid' | 'soft') => void;
    notificationOccurred: (type: 'error' | 'success' | 'warning') => void;
    selectionChanged: () => void;
  };
  MainButton: {
    text: string;
    color: string;
    textColor: string;
    isVisible: boolean;
    isActive: boolean;
    show: () => void;
    hide: () => void;
    enable: () => void;
    disable: () => void;
    onClick: (callback: () => void) => void;
    offClick: (callback: () => void) => void;
    setText: (text: string) => void;
  };
  BackButton: {
    isVisible: boolean;
    show: () => void;
    hide: () => void;
    onClick: (callback: () => void) => void;
    offClick: (callback: () => void) => void;
  };
  initDataUnsafe: {
    user?: TelegramUser;
    query_id?: string;
    auth_date?: number;
    hash?: string;
  };
  platform: string;
  version: string;
  colorScheme: 'light' | 'dark';
  themeParams: Record<string, string>;
  isExpanded: boolean;
  viewportHeight: number;
  viewportStableHeight: number;
}

declare global {
  interface Window {
    Telegram?: {
      WebApp: TelegramWebApp;
    };
  }
}

export function useTelegram() {
  const tg = typeof window !== 'undefined' ? window.Telegram?.WebApp : null;
  const user = tg?.initDataUnsafe?.user;

  useEffect(() => {
    if (tg) {
      tg.ready();
      tg.expand();
    }
  }, [tg]);

  const hapticImpact = useCallback(
    (style: 'light' | 'medium' | 'heavy' = 'light') => {
      tg?.HapticFeedback?.impactOccurred(style);
    },
    [tg]
  );

  const hapticNotify = useCallback(
    (type: 'error' | 'success' | 'warning' = 'success') => {
      tg?.HapticFeedback?.notificationOccurred(type);
    },
    [tg]
  );

  const showConfirm = useCallback(
    (message: string): Promise<boolean> => {
      return new Promise((resolve) => {
        if (tg) {
          tg.showConfirm(message, resolve);
        } else {
          resolve(window.confirm(message));
        }
      });
    },
    [tg]
  );

  const showAlert = useCallback(
    (message: string): Promise<void> => {
      return new Promise((resolve) => {
        if (tg) {
          tg.showAlert(message, resolve);
        } else {
          window.alert(message);
          resolve();
        }
      });
    },
    [tg]
  );

  const setMainButton = useCallback(
    (text: string, onClick: () => void, options?: { color?: string; textColor?: string }) => {
      if (!tg) return;
      tg.MainButton.setText(text);
      if (options?.color) tg.MainButton.color = options.color;
      if (options?.textColor) tg.MainButton.textColor = options.textColor;
      tg.MainButton.onClick(onClick);
      tg.MainButton.show();
    },
    [tg]
  );

  const hideMainButton = useCallback(() => {
    tg?.MainButton.hide();
  }, [tg]);

  return {
    tg,
    user,
    platform: tg?.platform || 'web',
    isInTelegram: !!tg,
    hapticImpact,
    hapticNotify,
    showConfirm,
    showAlert,
    setMainButton,
    hideMainButton,
    close: () => tg?.close(),
  };
}
