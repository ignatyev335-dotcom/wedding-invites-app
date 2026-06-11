import { motion } from 'framer-motion';
import { Gift } from 'lucide-react';
import { useTranslation } from '../i18n/useTranslation';

interface GiftsBlockProps {
  text?: string;
}

export default function GiftsBlock({ text }: GiftsBlockProps) {
  const { t } = useTranslation();

  const defaultText = text ||
    'Ваше присутствие — самый главный подарок для нас! Если хотите сделать нам приятное, мы будем рады вкладу в нашу семейную копилку.';

  return (
    <motion.div
      className="w-full max-w-lg mx-auto py-6"
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6 }}
    >
      <h3 className="text-center text-xl sm:text-2xl font-bold text-rose-800 mb-6">
        {t('gifts.title')}
      </h3>

      <motion.div
        className="relative bg-gradient-to-br from-amber-50 to-rose-50 rounded-xl p-6 sm:p-8 border border-rose-100 shadow-sm"
        initial={{ scale: 0.95 }}
        whileInView={{ scale: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
      >
        {/* Decorative corner elements */}
        <div className="absolute top-3 left-3 w-6 h-6 border-t-2 border-l-2 border-rose-300 rounded-tl" />
        <div className="absolute top-3 right-3 w-6 h-6 border-t-2 border-r-2 border-rose-300 rounded-tr" />
        <div className="absolute bottom-3 left-3 w-6 h-6 border-b-2 border-l-2 border-rose-300 rounded-bl" />
        <div className="absolute bottom-3 right-3 w-6 h-6 border-b-2 border-r-2 border-rose-300 rounded-br" />

        <div className="flex flex-col items-center text-center">
          <motion.div
            className="w-14 h-14 rounded-full bg-rose-100 flex items-center justify-center mb-4"
            animate={{ rotate: [0, 5, -5, 0] }}
            transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
          >
            <Gift className="w-7 h-7 text-rose-500" />
          </motion.div>

          <p className="text-gray-700 leading-relaxed text-sm sm:text-base">{defaultText}</p>
        </div>
      </motion.div>
    </motion.div>
  );
}
