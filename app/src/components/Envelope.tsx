import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from '../i18n/useTranslation';

interface EnvelopeProps {
  envelope: { image: string; sealImage: string; style: string };
  onOpen: () => void;
  isOpened: boolean;
}

export default function Envelope({ envelope, onOpen, isOpened }: EnvelopeProps) {
  const { t } = useTranslation();
  const [isAnimating, setIsAnimating] = useState(false);

  const handleOpen = () => {
    if (isOpened || isAnimating) return;
    setIsAnimating(true);
    // Animation completes via onAnimationComplete
  };

  const handleAnimationComplete = () => {
    setIsAnimating(false);
    onOpen();
  };

  return (
    <AnimatePresence>
      {!isOpened && (
        <motion.div
          className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-gradient-to-b from-amber-50 to-rose-50"
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Envelope Container */}
          <motion.div
            className="relative cursor-pointer"
            onClick={handleOpen}
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{
              rotateX: 180,
              opacity: 0,
              scale: 0.5,
            }}
            transition={
              isAnimating
                ? { duration: 1.5, ease: [0.4, 0, 0.2, 1] }
                : { duration: 0.5, ease: 'easeOut' }
            }
            onAnimationComplete={() => {
              if (isAnimating) {
                handleAnimationComplete();
              }
            }}
            style={{ perspective: 1000 }}
          >
            {/* Envelope Image */}
            <div className="relative w-72 h-48 sm:w-96 sm:h-60">
              <img
                src={envelope.image}
                alt="Envelope"
                className="w-full h-full object-contain drop-shadow-xl"
              />

              {/* Seal */}
              <motion.div
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/4"
                whileHover={!isAnimating ? { scale: 1.1 } : {}}
                whileTap={!isAnimating ? { scale: 0.95 } : {}}
              >
                <img
                  src={envelope.sealImage}
                  alt="Seal"
                  className="w-20 h-20 sm:w-24 sm:h-24 object-contain drop-shadow-lg"
                />
              </motion.div>
            </div>
          </motion.div>

          {/* Open Text */}
          <motion.p
            className="mt-8 text-lg sm:text-xl text-rose-700 font-medium tracking-wide"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ delay: 0.3, duration: 0.5 }}
          >
            {t('envelope.open')}
          </motion.p>

          {/* Decorative elements */}
          <motion.div
            className="absolute top-10 left-10 w-16 h-16 rounded-full bg-rose-200/30 blur-xl"
            animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
            transition={{ duration: 3, repeat: Infinity }}
          />
          <motion.div
            className="absolute bottom-20 right-10 w-24 h-24 rounded-full bg-amber-200/30 blur-xl"
            animate={{ scale: [1, 1.3, 1], opacity: [0.3, 0.6, 0.3] }}
            transition={{ duration: 4, repeat: Infinity, delay: 1 }}
          />
          <motion.div
            className="absolute top-1/3 right-5 w-12 h-12 rounded-full bg-pink-200/30 blur-lg"
            animate={{ scale: [1, 1.4, 1], opacity: [0.2, 0.4, 0.2] }}
            transition={{ duration: 2.5, repeat: Infinity, delay: 0.5 }}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
