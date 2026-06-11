import { motion } from 'framer-motion';
import { MapPin } from 'lucide-react';
import { useTranslation } from '../i18n/useTranslation';

interface MapBlockProps {
  title: string;
  address: string;
  mapUrl: string;
  onMapClick?: () => void;
}

export default function MapBlock({ title, address, mapUrl, onMapClick }: MapBlockProps) {
  const { t } = useTranslation();

  const handleClick = () => {
    onMapClick?.();
    window.open(mapUrl, '_blank');
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
        {t('map.title')}
      </h3>

      <motion.div
        className="relative bg-white/70 backdrop-blur-sm rounded-xl overflow-hidden shadow-sm border border-rose-100"
        whileHover={{ scale: 1.01 }}
        transition={{ type: 'spring', stiffness: 300 }}
      >
        {/* Map iframe or placeholder */}
        <div className="relative w-full h-56 sm:h-64 bg-rose-50">
          {mapUrl.includes('yandex') || mapUrl.includes('google') ? (
            <iframe
              src={mapUrl}
              title={title}
              className="w-full h-full border-0"
              allowFullScreen
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-rose-50 to-amber-50">
              <MapPin className="w-12 h-12 text-rose-400 mb-2" />
              <p className="text-rose-600 font-medium text-sm text-center px-4">{address}</p>
            </div>
          )}
        </div>

        {/* Address & Open Button */}
        <div className="p-4 flex items-center justify-between">
          <div className="flex-1 pr-3">
            <p className="text-sm font-semibold text-gray-800">{title}</p>
            <p className="text-xs text-gray-500 mt-0.5">{address}</p>
          </div>
          <motion.button
            onClick={handleClick}
            className="px-4 py-2 bg-rose-600 text-white text-sm rounded-lg font-medium shadow-sm hover:bg-rose-700 transition-colors"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {t('map.open')}
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  );
}
