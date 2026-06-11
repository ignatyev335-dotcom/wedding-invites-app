export type Language = 'ru' | 'en' | 'zh';
export type Tariff = 'FREE' | 'LIGHT' | 'PREMIUM';
export type RsvpStatus = 'yes' | 'no' | 'maybe';
export type TransferOption = 'self' | 'car' | 'need';

export interface EnvelopeData {
  id: string;
  image: string;
  sealImage: string;
  style: string;
  name: string;
}

export interface Template {
  id: string;
  name: string;
  description: string;
  image: string;
  tariff: Tariff;
  category: string;
  previewUrl: string;
  colors: string[];
}

export interface InvitationBlock {
  id: string;
  type: string;
  enabled: boolean;
}

export interface ProgramItem {
  time: string;
  title: string;
  description?: string;
}

export interface DressCodeItem {
  name: string;
  description: string;
  colors: string[];
  photoRef?: string;
}

export interface ContactItem {
  name: string;
  phone?: string;
  telegram?: string;
  role?: string;
}

export interface InviteData {
  id: string;
  slug: string;
  userId: string;
  templateId: string;
  language: Language;
  partner1Name: string;
  partner2Name: string;
  ceremonyDate: string;
  ceremonyTime: string;
  ceremonyPlace: string;
  ceremonyAddress: string;
  ceremonyMapUrl: string;
  banquetDate?: string;
  banquetTime?: string;
  banquetPlace?: string;
  banquetAddress?: string;
  banquetMapUrl?: string;
  hasBanquet: boolean;
  hasTransfer: boolean;
  transferDetails?: string;
  dressCode?: DressCodeItem[];
  dressCodeDescription?: string;
  giftsText?: string;
  contacts: ContactItem[];
  blockOrder: string[];
  envelopeId: string;
  musicUrl?: string;
  photoUrl?: string;
  watermarkEnabled: boolean;
  rsvpEnabled: boolean;
  mapClicks: number;
  createdAt: string;
  updatedAt: string;
}

export interface RsvpResponse {
  id: string;
  inviteId: string;
  guestName?: string;
  status: RsvpStatus;
  message?: string;
  transfer?: TransferOption;
  createdAt: string;
}

export interface User {
  id: string;
  telegramId: number;
  username?: string;
  firstName?: string;
  lastName?: string;
  tariff: Tariff;
  language: Language;
  expiresAt?: string;
  createdAt: string;
}

export interface Payment {
  id: string;
  userId: string;
  tariff: Tariff;
  amount: number;
  status: 'pending' | 'completed' | 'failed';
  paymentUrl?: string;
  createdAt: string;
}

export interface AdminStats {
  totalUsers: number;
  totalInvites: number;
  totalRsvps: number;
  totalPayments: number;
  revenue: number;
  activeToday: number;
}

export interface MusicTrack {
  id: string;
  title: string;
  artist: string;
  url: string;
  duration?: number;
}

export interface Illustration {
  id: string;
  title: string;
  url: string;
  category: string;
}

export interface QuizAnswers {
  date?: string;
  hasBanquet?: boolean;
  hasTransfer?: boolean;
  guestCount?: number;
  style?: string;
  hasPhoto?: boolean;
}
