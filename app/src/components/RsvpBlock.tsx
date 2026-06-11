import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, X, HelpCircle, Send } from 'lucide-react';
import { useTranslation } from '../i18n/useTranslation';
import { useTelegram } from '../hooks/useTelegram';
import { useSubmitRsvp } from '../hooks/useApi';
import type { RsvpStatus } from '../types';

interface RsvpBlockProps {
  inviteId: string;
}

const RSVP_OPTIONS: { id: RsvpStatus; icon: React.ReactNode; labelKey: string; color: string }[] = [
  { id: 'yes', icon: <Check className="w-5 h-5" />, labelKey: 'rsvp.yes', color: 'bg-green-500 hover:bg-green-600' },
  { id: 'no', icon: <X className="w-5 h-5" />, labelKey: 'rsvp.no', color: 'bg-red-500 hover:bg-red-600' },
  { id: 'maybe', icon: <HelpCircle className="w-5 h-5" />, labelKey: 'rsvp.maybe', color: 'bg-amber-500 hover:bg-amber-600' },
];

export default function RsvpBlock({ inviteId }: RsvpBlockProps) {
  const { t } = useTranslation();
  const { hapticImpact, hapticNotify } = useTelegram();
  const submitRsvp = useSubmitRsvp();

  const [selected, setSelected] = useState<RsvpStatus | null>(null);
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSelect = (status: RsvpStatus) => {
    hapticImpact('light');
    setSelected(status);
  };

  const handleSubmit = async () => {
    if (!selected) return;

    hapticImpact('medium');

    try {
      await submitRsvp.mutateAsync({
        inviteId,
        status,
        message: message || undefined,
      });

      hapticNotify('success');
      setSubmitted(true);
    } catch {
      hapticNotify('error');
    }
  };

  return (
    <motion.div
      className="w-full max-w-lg mx-auto py-6"
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6 }}
    >
      <h3 className="text-center text-xl sm:text-2xl font-bold text-rose-800 mb-6">
        {t('rsvp.title')}
      </h3>

      <AnimatePresence mode="wait">
        {submitted ? (
          <motion.div
            key="thanks"
            className="text-center py-8"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 300 }}
            >
              <Check className="w-8 h-8 text-green-600" />
            </motion.div>
            <p className="text-lg text-gray-700 font-medium">{t('rsvp.thanks')}</p>
          </motion.div>
        ) : (
          <motion.div
            key="form"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {/* RSVP Buttons */}
            <div className="flex justify-center gap-3 mb-6">
              {RSVP_OPTIONS.map((option, index) => (
                <motion.button
                  key={option.id}
                  className={`flex flex-col items-center gap-2 px-5 py-3 rounded-xl text-white font-medium shadow-sm transition-colors ${
                    selected === option.id ? option.color : 'bg-gray-300 hover:bg-gray-400'
                  }`}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleSelect(option.id)}
                >
                  {option.icon}
                  <span className="text-sm">{t(option.labelKey as never)}</span>
                </motion.button>
              ))}
            </div>

            {/* Message Input */}
            <AnimatePresence>
              {selected && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder={t('rsvp.messagePlaceholder')}
                    className="w-full p-3 rounded-xl border border-rose-200 bg-white/70 backdrop-blur-sm text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-rose-400 resize-none mb-4"
                    rows={3}
                  />

                  <motion.button
                    className="w-full py-3 bg-rose-600 text-white rounded-xl font-medium shadow-sm flex items-center justify-center gap-2 hover:bg-rose-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleSubmit}
                    disabled={submitRsvp.isPending}
                  >
                    <Send className="w-4 h-4" />
                    {submitRsvp.isPending ? t('common.loading') : t('rsvp.submit')}
                  </motion.button>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
