import { motion, AnimatePresence } from 'framer-motion';
import { X, Sparkles, Zap } from 'lucide-react';
import { useTranslation } from '../i18n/useTranslation';
import { useCreatePayment } from '../hooks/useApi';
import type { Tariff } from '../types';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentTariff?: Tariff;
}

interface TariffOption {
  id: Tariff;
  name: string;
  price: number;
  description: string;
  icon: React.ReactNode;
  features: string[];
  popular?: boolean;
}

export default function PaymentModal({ isOpen, onClose, currentTariff = 'FREE' }: PaymentModalProps) {
  const { t } = useTranslation();
  const createPayment = useCreatePayment();

  const tariffs: TariffOption[] = [
    {
      id: 'LIGHT',
      name: 'LIGHT',
      price: 499,
      description: t('payment.lightDesc'),
      icon: <Zap className="w-6 h-6 text-amber-500" />,
      features: ['6 шаблонов', '50 гостей', '3 фото', 'Базовая аналитика'],
    },
    {
      id: 'PREMIUM',
      name: 'PREMIUM',
      price: 999,
      description: t('payment.premiumDesc'),
      icon: <Sparkles className="w-6 h-6 text-rose-500" />,
      features: ['12 шаблонов', 'Безлимит гостей', 'Безлимит фото', 'Полная аналитика', 'Экспорт данных'],
      popular: true,
    },
  ];

  const handlePay = async (tariff: TariffOption) => {
    try {
      const payment = await createPayment.mutateAsync({
        tariff: tariff.id,
        returnUrl: `${window.location.origin}/payment/success`,
      });

      if (payment.paymentUrl) {
        window.location.href = payment.paymentUrl;
      }
    } catch (error) {
      console.error('Payment creation failed:', error);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden"
            initial={{ scale: 0.9, y: 50 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 50 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="relative p-6 pb-4">
              <button
                onClick={onClose}
                className="absolute top-4 right-4 p-2 rounded-full hover:bg-gray-100 transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
              <h2 className="text-xl font-bold text-gray-800 text-center">
                Выберите тариф
              </h2>
              <p className="text-sm text-gray-500 text-center mt-1">
                Текущий: {currentTariff}
              </p>
            </div>

            {/* Tariff Cards */}
            <div className="px-6 pb-6 space-y-4">
              {tariffs.map((tariff) => (
                <motion.div
                  key={tariff.id}
                  className={`relative rounded-xl border-2 p-4 transition-colors ${
                    tariff.popular
                      ? 'border-rose-400 bg-rose-50/50'
                      : 'border-gray-200 bg-gray-50/50 hover:border-amber-300'
                  }`}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {tariff.popular && (
                    <span className="absolute -top-3 left-4 px-2 py-0.5 bg-rose-500 text-white text-xs font-bold rounded-full">
                      Популярный
                    </span>
                  )}

                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      {tariff.icon}
                      <div>
                        <h3 className="font-bold text-gray-800">{tariff.name}</h3>
                        <p className="text-xs text-gray-500">{tariff.description}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-2xl font-bold text-gray-800">
                        {tariff.price}
                      </span>
                      <span className="text-sm text-gray-500">₽</span>
                    </div>
                  </div>

                  <ul className="space-y-1 mb-4">
                    {tariff.features.map((feature, i) => (
                      <li key={i} className="text-xs text-gray-600 flex items-center gap-2">
                        <CheckIcon />
                        {feature}
                      </li>
                    ))}
                  </ul>

                  <motion.button
                    className={`w-full py-2.5 rounded-lg font-medium text-sm transition-colors ${
                      tariff.popular
                        ? 'bg-rose-600 text-white hover:bg-rose-700'
                        : 'bg-amber-500 text-white hover:bg-amber-600'
                    }`}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handlePay(tariff)}
                    disabled={createPayment.isPending}
                  >
                    {createPayment.isPending ? t('common.loading') : t('payment.pay')}
                  </motion.button>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function CheckIcon() {
  return (
    <svg
      className="w-3.5 h-3.5 text-green-500 flex-shrink-0"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={3}
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
    </svg>
  );
}
