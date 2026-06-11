import { useState } from 'react';
import { motion } from 'framer-motion';
import { Car, Footprints, Bus } from 'lucide-react';
import { useTranslation } from '../i18n/useTranslation';
import type { TransferOption } from '../types';

interface TransferBlockProps {
  details?: string;
  onSelect?: (option: TransferOption) => void;
}

const TRANSFER_OPTIONS: { id: TransferOption; icon: React.ReactNode; labelKey: string }[] = [
  { id: 'self', icon: <Footprints className="w-6 h-6" />, labelKey: 'transfer.self' },
  { id: 'car', icon: <Car className="w-6 h-6" />, labelKey: 'transfer.car' },
  { id: 'need', icon: <Bus className="w-6 h-6" />, labelKey: 'transfer.need' },
];

export default function TransferBlock({ details, onSelect }: TransferBlockProps) {
  const { t } = useTranslation();
  const [selected, setSelected] = useState<TransferOption | null>(null);

  const handleSelect = (option: TransferOption) => {
    setSelected(option);
    onSelect?.(option);
  };

  return (
    <motion.div
      className="w-full max-w-lg mx-auto py-6"
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6 }}
    >
      <h3 className="text-center text-xl sm:text-2xl font-bold text-rose-800 mb-4">
        {t('transfer.title')}
      </h3>

      {details && (
        <motion.p
          className="text-center text-gray-600 mb-6 px-4"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
        >
          {details}
        </motion.p>
      )}

      <div className="flex justify-center gap-3 sm:gap-4">
        {TRANSFER_OPTIONS.map((option, index) => (
          <motion.button
            key={option.id}
            className={`flex flex-col items-center gap-2 p-4 sm:p-5 rounded-xl border-2 transition-colors min-w-[90px] sm:min-w-[110px] ${
              selected === option.id
                ? 'border-rose-500 bg-rose-50'
                : 'border-rose-100 bg-white/70 hover:border-rose-300'
            }`}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.1 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => handleSelect(option.id)}
          >
            <span className={selected === option.id ? 'text-rose-600' : 'text-gray-500'}>
              {option.icon}
            </span>
            <span
              className={`text-xs sm:text-sm font-medium ${
                selected === option.id ? 'text-rose-700' : 'text-gray-600'
              }`}
            >
              {t(option.labelKey as never)}
            </span>
          </motion.button>
        ))}
      </div>
    </motion.div>
  );
}
