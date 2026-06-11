import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from '../i18n/useTranslation';
import { getTimeRemaining } from '../utils/helpers';

interface TimerBlockProps {
  ceremonyDate: string;
}

interface TimeUnitProps {
  value: number;
  label: string;
}

function TimeUnit({ value, label }: TimeUnitProps) {
  return (
    <div className="flex flex-col items-center">
      <motion.div
        className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl bg-white/80 backdrop-blur-sm shadow-lg flex items-center justify-center border border-rose-100"
        key={value}
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      >
        <span className="text-2xl sm:text-3xl font-bold text-rose-700 tabular-nums">
          {String(value).padStart(2, '0')}
        </span>
      </motion.div>
      <span className="mt-2 text-xs sm:text-sm text-rose-500 font-medium uppercase tracking-wider">
        {label}
      </span>
    </div>
  );
}

export default function TimerBlock({ ceremonyDate }: TimerBlockProps) {
  const { t } = useTranslation();
  const [time, setTime] = useState(() => getTimeRemaining(ceremonyDate));

  useEffect(() => {
    const interval = setInterval(() => {
      const remaining = getTimeRemaining(ceremonyDate);
      setTime(remaining);
      if (remaining.expired) {
        clearInterval(interval);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [ceremonyDate]);

  if (time.expired) {
    return (
      <motion.div
        className="text-center py-8"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
      >
        <h3 className="text-2xl font-bold text-rose-700">{t('timer.expired')}</h3>
      </motion.div>
    );
  }

  return (
    <motion.div
      className="w-full max-w-md mx-auto"
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6 }}
    >
      <h3 className="text-center text-xl sm:text-2xl font-bold text-rose-800 mb-6">
        {t('timer.title')}
      </h3>

      <div className="flex justify-center gap-3 sm:gap-4">
        <TimeUnit value={time.days} label={t('timer.days')} />
        <span className="text-2xl sm:text-3xl font-bold text-rose-300 self-start mt-4">:</span>
        <TimeUnit value={time.hours} label={t('timer.hours')} />
        <span className="text-2xl sm:text-3xl font-bold text-rose-300 self-start mt-4">:</span>
        <TimeUnit value={time.minutes} label={t('timer.minutes')} />
        <span className="text-2xl sm:text-3xl font-bold text-rose-300 self-start mt-4">:</span>
        <TimeUnit value={time.seconds} label={t('timer.seconds')} />
      </div>
    </motion.div>
  );
}
