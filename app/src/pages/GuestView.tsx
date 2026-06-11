import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useParams } from 'react-router';
import { useInviteBySlug } from '../hooks/useApi';
import { useStore } from '../store/useStore';
import Envelope from '../components/Envelope';
import Invitation from '../components/Invitation';
import { Spinner } from '../components/ui/spinner';

const MOCK_ENVELOPE = {
  image: 'https://img.icons8.com/color/96/envelope.png',
  sealImage: 'https://img.icons8.com/color/96/wax-seal.png',
  style: 'classic',
};

export default function GuestView() {
  const { slug } = useParams<{ slug: string }>();
  const { isEnvelopeOpened, setEnvelopeOpened } = useStore();
  const { data: invite, isLoading, error } = useInviteBySlug(slug || '');
  const [showContent, setShowContent] = useState(false);

  // For demo: if no API data, use mock
  const [mockMode, setMockMode] = useState(false);

  useEffect(() => {
    if (error && !isLoading) {
      setMockMode(true);
    }
  }, [error, isLoading]);

  const handleEnvelopeOpen = () => {
    setEnvelopeOpened(true);
    // Small delay before showing content for transition effect
    setTimeout(() => setShowContent(true), 500);
  };

  // Mock invite for demo
  const mockInvite = {
    id: 'demo',
    slug: slug || 'demo',
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

  const displayInvite = invite || (mockMode ? mockInvite : null);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-amber-50 to-rose-50 flex items-center justify-center">
        <Spinner className="w-8 h-8 text-rose-500" />
      </div>
    );
  }

  if (!displayInvite) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-amber-50 to-rose-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-500">Приглашение не найдено</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <AnimatePresence mode="wait">
        {!isEnvelopeOpened ? (
          <Envelope
            key="envelope"
            envelope={MOCK_ENVELOPE}
            onOpen={handleEnvelopeOpen}
            isOpened={isEnvelopeOpened}
          />
        ) : (
          <motion.div
            key="invitation"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            {showContent && <Invitation invite={displayInvite} isGuestView={true} />}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
