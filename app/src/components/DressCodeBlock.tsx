import { motion } from 'framer-motion';
import { useTranslation } from '../i18n/useTranslation';
import type { DressCodeItem } from '../types';

interface DressCodeBlockProps {
  items: DressCodeItem[];
  description?: string;
}

function ColorCircle({ color, delay = 0 }: { color: string; delay?: number }) {
  return (
    <motion.div
      className="w-10 h-10 sm:w-12 sm:h-12 rounded-full border-2 border-white shadow-md"
      style={{ backgroundColor: color }}
      initial={{ scale: 0 }}
      whileInView={{ scale: 1 }}
      viewport={{ once: true }}
      transition={{ delay, type: 'spring', stiffness: 300 }}
      whileHover={{ scale: 1.15 }}
    />
  );
}

export default function DressCodeBlock({ items, description }: DressCodeBlockProps) {
  const { t } = useTranslation();

  return (
    <motion.div
      className="w-full max-w-lg mx-auto py-6"
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6 }}
    >
      <h3 className="text-center text-xl sm:text-2xl font-bold text-rose-800 mb-4">
        {t('dressCode.title')}
      </h3>

      {description && (
        <motion.p
          className="text-center text-gray-600 mb-6 px-4"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
        >
          {description}
        </motion.p>
      )}

      <div className="space-y-6">
        {items.map((item, index) => (
          <motion.div
            key={index}
            className="bg-white/70 backdrop-blur-sm rounded-xl p-4 sm:p-5 shadow-sm border border-rose-100"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.15 }}
          >
            <h4 className="text-lg font-semibold text-gray-800 mb-1">{item.name}</h4>
            {item.description && (
              <p className="text-sm text-gray-500 mb-3">{item.description}</p>
            )}

            {/* Color palette */}
            <div className="flex gap-2 flex-wrap">
              {item.colors.map((color, ci) => (
                <ColorCircle key={ci} color={color} delay={ci * 0.1} />
              ))}
            </div>

            {/* Photo reference */}
            {item.photoRef && (
              <motion.img
                src={item.photoRef}
                alt={item.name}
                className="mt-3 w-full h-40 object-cover rounded-lg"
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.3 }}
              />
            )}
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
