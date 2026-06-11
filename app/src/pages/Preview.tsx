import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import { useStore } from '../store/useStore';
import Invitation from '../components/Invitation';

interface PreviewProps {
  onBack?: () => void;
}

export default function Preview({ onBack }: PreviewProps) {
  const { invite } = useStore();

  // If no invite in store, show a mock preview
  const mockInvite = invite || {
    id: 'preview',
    slug: 'preview',
    userId: 'user1',
    templateId: '1',
    language: 'ru' as const,
    partner1Name: 'Анна',
    partner2Name: 'Алексей',
    ceremonyDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    ceremonyTime: '15:00',
    ceremonyPlace: 'Загородный клуб "Лесная Поляна"',
    ceremonyAddress: 'Московская область, г. Пушкино, ул. Лесная, 12',
    ceremonyMapUrl: 'https://yandex.ru/maps/',
    hasBanquet: true,
    banquetTime: '17:00',
    banquetPlace: 'Ресторан "Гранат"',
    hasTransfer: true,
    transferDetails: 'Трансфер от станции Пушкино в 14:30',
    dressCode: [
      { name: 'Основной', description: 'Элегантный наряд', colors: ['#2F4F4F', '#800020', '#D4AF37'] },
    ],
    dressCodeDescription: 'Просим придерживаться указанной цветовой гаммы',
    giftsText: 'Ваше присутствие — самый главный подарок! Если хотите сделать нам приятное, будем рады вкладу в нашу семейную копилку.',
    contacts: [
      { name: 'Анна', phone: '+7 (999) 123-45-67', telegram: 'anna_wed', role: 'Невеста' },
      { name: 'Алексей', phone: '+7 (999) 765-43-21', telegram: 'alex_wed', role: 'Жених' },
    ],
    blockOrder: ['timer', 'program', 'dressCode', 'map', 'transfer', 'gifts', 'contacts', 'rsvp'],
    envelopeId: '1',
    watermarkEnabled: true,
    rsvpEnabled: true,
    mapClicks: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 to-rose-50">
      {/* Preview Banner */}
      <motion.div
        className="sticky top-0 z-40 bg-black/70 backdrop-blur-md text-white px-4 py-2 flex items-center justify-between"
        initial={{ y: -50 }}
        animate={{ y: 0 }}
      >
        <div className="flex items-center gap-2">
          <button
            onClick={onBack}
            className="p-1.5 rounded-lg hover:bg-white/20 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <span className="text-sm font-medium">Режим предпросмотра</span>
        </div>
        <span className="text-xs text-white/60">Так гости увидят приглашение</span>
      </motion.div>

      {/* Invitation */}
      <Invitation invite={mockInvite} isGuestView={true} />
    </div>
  );
}
