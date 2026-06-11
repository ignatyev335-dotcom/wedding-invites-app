import { motion } from 'framer-motion';
import { useTranslation } from '../i18n/useTranslation';
import { formatDate, formatTime } from '../utils/helpers';
import { useStore } from '../store/useStore';
import type { InviteData } from '../types';

interface ProgramBlockProps {
  invite: InviteData;
}

interface ProgramItemProps {
  time: string;
  title: string;
  description?: string;
  delay?: number;
}

function ProgramItem({ time, title, description, delay = 0 }: ProgramItemProps) {
  return (
    <motion.div
      className="flex gap-4 items-start p-4 rounded-xl bg-white/70 backdrop-blur-sm shadow-sm border border-rose-100"
      initial={{ opacity: 0, x: -20 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true }}
      transition={{ delay, duration: 0.5 }}
    >
      <div className="flex-shrink-0 w-16 h-16 rounded-full bg-rose-100 flex flex-col items-center justify-center">
        <span className="text-lg font-bold text-rose-700">{formatTime(time)}</span>
      </div>
      <div className="flex-1">
        <h4 className="text-lg font-semibold text-gray-800">{title}</h4>
        {description && <p className="text-sm text-gray-500 mt-1">{description}</p>}
      </div>
    </motion.div>
  );
}

export default function ProgramBlock({ invite }: ProgramBlockProps) {
  const { t } = useTranslation();
  const { language } = useStore();

  const items: ProgramItemProps[] = [
    {
      time: invite.ceremonyTime,
      title: t('program.ceremony'),
      description: `${invite.ceremonyPlace} — ${invite.ceremonyAddress} — ${formatDate(invite.ceremonyDate, language)}`,
      delay: 0,
    },
  ];

  if (invite.hasBanquet && invite.banquetTime) {
    items.push({
      time: invite.banquetTime,
      title: t('program.banquet'),
      description: invite.banquetPlace
        ? `${invite.banquetPlace} — ${invite.banquetAddress || ''}`
        : undefined,
      delay: 0.15,
    });
  }

  return (
    <motion.div
      className="w-full max-w-lg mx-auto py-6"
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true }}
    >
      <h3 className="text-center text-xl sm:text-2xl font-bold text-rose-800 mb-6">
        {t('program.title')}
      </h3>

      <div className="space-y-4">
        {items.map((item, index) => (
          <ProgramItem key={index} {...item} />
        ))}
      </div>
    </motion.div>
  );
}
