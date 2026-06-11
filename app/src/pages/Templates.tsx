import { useState } from 'react';
import { motion } from 'framer-motion';
import { Lock, Check, Sparkles } from 'lucide-react';
import { useTranslation } from '../i18n/useTranslation';
import { useStore } from '../store/useStore';
import { TARIFF_LIMITS } from '../utils/helpers';
import PaymentModal from '../components/PaymentModal';
import type { Template, Tariff } from '../types';

const MOCK_TEMPLATES: Template[] = [
  { id: '1', name: 'Классика', description: 'Элегантный классический стиль', image: '/templates/classic.jpg', tariff: 'FREE', category: 'classic', previewUrl: '', colors: ['#F5F5DC', '#8B0000', '#FFD700'] },
  { id: '2', name: 'Минимализм', description: 'Чистые линии и простота', image: '/templates/minimal.jpg', tariff: 'FREE', category: 'minimal', previewUrl: '', colors: ['#FFFFFF', '#333333', '#E0E0E0'] },
  { id: '3', name: 'Бохо', description: 'Натуральные оттенки и уют', image: '/templates/boho.jpg', tariff: 'LIGHT', category: 'boho', previewUrl: '', colors: ['#D2B48C', '#8B4513', '#F4A460'] },
  { id: '4', name: 'Рустик', description: 'Деревенский шарм', image: '/templates/rustic.jpg', tariff: 'LIGHT', category: 'rustic', previewUrl: '', colors: ['#8B7355', '#F5DEB3', '#556B2F'] },
  { id: '5', name: 'Гламур', description: 'Роскошь и блеск', image: '/templates/glamour.jpg', tariff: 'LIGHT', category: 'glamour', previewUrl: '', colors: ['#FFD700', '#FF69B4', '#4B0082'] },
  { id: '6', name: 'Модерн', description: 'Современный стиль', image: '/templates/modern.jpg', tariff: 'LIGHT', category: 'modern', previewUrl: '', colors: ['#000000', '#FF6B6B', '#FFFFFF'] },
  { id: '7', name: 'Винтаж', description: 'Ностальгическая атмосфера', image: '/templates/vintage.jpg', tariff: 'PREMIUM', category: 'vintage', previewUrl: '', colors: ['#704214', '#D4AF37', '#F5F5DC'] },
  { id: '8', name: 'Морской', description: 'Океанская тематика', image: '/templates/nautical.jpg', tariff: 'PREMIUM', category: 'nautical', previewUrl: '', colors: ['#4682B4', '#FFFFFF', '#DAA520'] },
];

interface TemplatesProps {
  onSelect?: (template: Template) => void;
}

export default function Templates({ onSelect }: TemplatesProps) {
  const { t } = useTranslation();
  const { tariff } = useStore();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [filter, setFilter] = useState<Tariff | 'all'>('all');
  const [showPayment, setShowPayment] = useState(false);

  const tariffOrder: Tariff[] = ['FREE', 'LIGHT', 'PREMIUM'];
  const filteredTemplates =
    filter === 'all'
      ? MOCK_TEMPLATES
      : MOCK_TEMPLATES.filter((t) => t.tariff === filter);

  const isTemplateAvailable = (templateTariff: Tariff) => {
    return tariffOrder.indexOf(tariff) >= tariffOrder.indexOf(templateTariff);
  };

  const handleSelect = (template: Template) => {
    if (!isTemplateAvailable(template.tariff)) {
      setShowPayment(true);
      return;
    }
    setSelectedId(template.id);
    onSelect?.(template);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 to-rose-50">
      {/* Header */}
      <div className="px-4 pt-6 pb-2">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 text-center mb-2">
          {t('templates.title')}
        </h1>
        <p className="text-sm text-gray-500 text-center mb-4">
          {t('tariff.free')}: {TARIFF_LIMITS.FREE.maxTemplates} &middot;{' '}
          {t('tariff.light')}: {TARIFF_LIMITS.LIGHT.maxTemplates} &middot;{' '}
          {t('tariff.premium')}: {TARIFF_LIMITS.PREMIUM.maxTemplates}
        </p>

        {/* Filter Tabs */}
        <div className="flex justify-center gap-2 mb-4">
          {(['all', 'FREE', 'LIGHT', 'PREMIUM'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                filter === f
                  ? 'bg-rose-600 text-white'
                  : 'bg-white text-gray-600 hover:bg-rose-100'
              }`}
            >
              {f === 'all' ? t('common.all') : f}
            </button>
          ))}
        </div>
      </div>

      {/* Template Grid */}
      <div className="px-4 pb-8">
        <div className="grid grid-cols-2 gap-3 sm:gap-4 max-w-lg mx-auto">
          {filteredTemplates.map((template, index) => {
            const available = isTemplateAvailable(template.tariff);
            const selected = selectedId === template.id;

            return (
              <motion.button
                key={template.id}
                className={`relative rounded-xl overflow-hidden border-2 transition-all text-left ${
                  selected
                    ? 'border-rose-500 ring-2 ring-rose-200'
                    : available
                    ? 'border-transparent hover:border-rose-300'
                    : 'border-gray-200 opacity-70'
                }`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: available ? 1 : 0.6, y: 0 }}
                transition={{ delay: index * 0.05 }}
                whileHover={available ? { scale: 1.03 } : {}}
                whileTap={available ? { scale: 0.97 } : {}}
                onClick={() => handleSelect(template)}
              >
                {/* Preview Image Area */}
                <div
                  className="aspect-[3/4] relative"
                  style={{
                    background: `linear-gradient(135deg, ${template.colors[0]}22, ${template.colors[1]}22)`,
                  }}
                >
                  {/* Color circles preview */}
                  <div className="absolute inset-0 flex items-center justify-center gap-2">
                    {template.colors.map((color, ci) => (
                      <div
                        key={ci}
                        className="w-8 h-8 sm:w-10 sm:h-10 rounded-full border-2 border-white shadow-md"
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>

                  {/* Lock overlay */}
                  {!available && (
                    <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                      <div className="w-10 h-10 rounded-full bg-white/90 flex items-center justify-center">
                        <Lock className="w-5 h-5 text-gray-600" />
                      </div>
                    </div>
                  )}

                  {/* Selected check */}
                  {selected && (
                    <motion.div
                      className="absolute top-2 right-2 w-6 h-6 bg-rose-500 rounded-full flex items-center justify-center"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: 'spring' }}
                    >
                      <Check className="w-4 h-4 text-white" />
                    </motion.div>
                  )}

                  {/* Tariff badge */}
                  <div className="absolute top-2 left-2">
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        template.tariff === 'FREE'
                          ? 'bg-green-500 text-white'
                          : template.tariff === 'LIGHT'
                          ? 'bg-amber-500 text-white'
                          : 'bg-rose-500 text-white'
                      }`}
                    >
                      {template.tariff === 'PREMIUM' && (
                        <Sparkles className="w-3 h-3 inline mr-0.5" />
                      )}
                      {template.tariff}
                    </span>
                  </div>
                </div>

                {/* Info */}
                <div className="p-3 bg-white">
                  <h3 className="text-sm font-semibold text-gray-800">{template.name}</h3>
                  <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">
                    {template.description}
                  </p>
                </div>
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* Payment Modal */}
      <PaymentModal isOpen={showPayment} onClose={() => setShowPayment(false)} currentTariff={tariff} />
    </div>
  );
}
