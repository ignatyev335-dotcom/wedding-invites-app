import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, ChevronLeft, Calendar, Users, Car, UtensilsCrossed, Image, Palette } from 'lucide-react';
import { useTranslation } from '../i18n/useTranslation';
import { useTelegram } from '../hooks/useTelegram';
import { useStore } from '../store/useStore';
import type { QuizAnswers } from '../types';

interface QuizStep {
  id: string;
  question: string;
  type: 'date' | 'toggle' | 'number' | 'cards';
  options?: string[] | { id: string; label: string; image?: string }[];
  placeholder?: string;
  icon: React.ReactNode;
}

const QUIZ_STEPS: QuizStep[] = [
  {
    id: 'date',
    question: 'quiz.date',
    type: 'date',
    icon: <Calendar className="w-6 h-6" />,
  },
  {
    id: 'hasBanquet',
    question: 'quiz.hasBanquet',
    type: 'toggle',
    options: ['quiz.yes', 'quiz.no'],
    icon: <UtensilsCrossed className="w-6 h-6" />,
  },
  {
    id: 'hasTransfer',
    question: 'quiz.hasTransfer',
    type: 'toggle',
    options: ['quiz.yes', 'quiz.no'],
    icon: <Car className="w-6 h-6" />,
  },
  {
    id: 'guestCount',
    question: 'quiz.guestCount',
    type: 'number',
    placeholder: 'quiz.guestCount',
    icon: <Users className="w-6 h-6" />,
  },
  {
    id: 'style',
    question: 'quiz.style',
    type: 'cards',
    options: [
      { id: 'classic', label: 'Классика', image: '/styles/classic.jpg' },
      { id: 'minimal', label: 'Минимализм', image: '/styles/minimal.jpg' },
      { id: 'boho', label: 'Бохо', image: '/styles/boho.jpg' },
    ],
    icon: <Palette className="w-6 h-6" />,
  },
];

interface QuizProps {
  onComplete?: (answers: QuizAnswers) => void;
}

export default function Quiz({ onComplete }: QuizProps) {
  const { t } = useTranslation();
  const { hapticImpact } = useTelegram();
  const { quizAnswers, setQuizAnswers } = useStore();

  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<QuizAnswers>(quizAnswers as QuizAnswers || {});
  const [direction, setDirection] = useState(0);

  const step = QUIZ_STEPS[currentStep];
  const progress = ((currentStep + 1) / QUIZ_STEPS.length) * 100;

  const handleAnswer = (value: unknown) => {
    hapticImpact('light');
    setAnswers((prev) => ({ ...prev, [step.id]: value }));
  };

  const handleNext = () => {
    if (currentStep < QUIZ_STEPS.length - 1) {
      setDirection(1);
      setCurrentStep((prev) => prev + 1);
    } else {
      // Complete
      setQuizAnswers(answers as Record<string, unknown>);
      onComplete?.(answers);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setDirection(-1);
      setCurrentStep((prev) => prev - 1);
    }
  };

  const canProceed = () => {
    const value = answers[step.id as keyof QuizAnswers];
    return value !== undefined && value !== '';
  };

  const variants = {
    enter: (d: number) => ({ x: d > 0 ? 300 : -300, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (d: number) => ({ x: d > 0 ? -300 : 300, opacity: 0 }),
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 to-rose-50 flex flex-col">
      {/* Progress Bar */}
      <div className="w-full h-1.5 bg-rose-100">
        <motion.div
          className="h-full bg-rose-500 rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.3 }}
        />
      </div>

      {/* Header */}
      <div className="flex items-center justify-between px-4 py-4">
        <button
          onClick={handleBack}
          className={`p-2 rounded-full hover:bg-rose-100 transition-colors ${
            currentStep === 0 ? 'invisible' : ''
          }`}
        >
          <ChevronLeft className="w-5 h-5 text-rose-600" />
        </button>
        <span className="text-sm text-rose-500 font-medium">
          {currentStep + 1} / {QUIZ_STEPS.length}
        </span>
        <div className="w-9" />
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col px-6 overflow-hidden">
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={currentStep}
            custom={direction}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="flex-1 flex flex-col"
          >
            {/* Question */}
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 rounded-xl bg-rose-100 text-rose-600">
                {step.icon}
              </div>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-8">
              {t(step.question as never)}
            </h2>

            {/* Input */}
            <div className="flex-1">
              {step.type === 'date' && (
                <input
                  type="date"
                  value={(answers.date as string) || ''}
                  onChange={(e) => handleAnswer(e.target.value)}
                  className="w-full p-4 rounded-xl border-2 border-rose-200 bg-white text-gray-800 focus:outline-none focus:border-rose-500 text-lg"
                />
              )}

              {step.type === 'toggle' && step.options && (
                <div className="flex gap-4">
                  {step.options.map((option) => {
                    const optionKey = option as string;
                    const isYes = optionKey === 'quiz.yes';
                    const value = answers[step.id as keyof QuizAnswers];
                    const isSelected =
                      (isYes && value === true) || (!isYes && value === false);

                    return (
                      <motion.button
                        key={String(option)}
                        className={`flex-1 py-4 rounded-xl border-2 font-medium text-lg transition-colors ${
                          isSelected
                            ? isYes
                              ? 'border-green-500 bg-green-50 text-green-700'
                              : 'border-red-300 bg-red-50 text-red-700'
                            : 'border-gray-200 bg-white text-gray-600 hover:border-rose-300'
                        }`}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => handleAnswer(isYes)}
                      >
                        {t(option as never)}
                      </motion.button>
                    );
                  })}
                </div>
              )}

              {step.type === 'number' && (
                <input
                  type="number"
                  min={1}
                  max={1000}
                  value={(answers.guestCount as number) || ''}
                  onChange={(e) => handleAnswer(parseInt(e.target.value) || 0)}
                  placeholder={t('quiz.guestCount' as never)}
                  className="w-full p-4 rounded-xl border-2 border-rose-200 bg-white text-gray-800 focus:outline-none focus:border-rose-500 text-lg"
                />
              )}

              {step.type === 'cards' && step.options && (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {(step.options as { id: string; label: string; image?: string }[]).map(
                    (option) => {
                      const isSelected = answers.style === option.id;
                      return (
                        <motion.button
                          key={option.id}
                          className={`relative rounded-xl overflow-hidden border-2 transition-colors ${
                            isSelected
                              ? 'border-rose-500 ring-2 ring-rose-200'
                              : 'border-gray-200 hover:border-rose-300'
                          }`}
                          whileHover={{ scale: 1.03 }}
                          whileTap={{ scale: 0.97 }}
                          onClick={() => handleAnswer(option.id)}
                        >
                          <div className="aspect-[3/4] bg-gradient-to-br from-rose-100 to-amber-100 flex items-center justify-center">
                            <Palette className="w-12 h-12 text-rose-300" />
                          </div>
                          <div className="p-3 text-center bg-white">
                            <span className="text-sm font-medium text-gray-700">
                              {option.label}
                            </span>
                          </div>
                          {isSelected && (
                            <motion.div
                              className="absolute top-2 right-2 w-6 h-6 bg-rose-500 rounded-full flex items-center justify-center"
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              transition={{ type: 'spring' }}
                            >
                              <span className="text-white text-xs">✓</span>
                            </motion.div>
                          )}
                        </motion.button>
                      );
                    }
                  )}
                </div>
              )}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Bottom Button */}
      <div className="p-6">
        <motion.button
          className={`w-full py-4 rounded-xl font-medium text-lg flex items-center justify-center gap-2 transition-colors ${
            canProceed()
              ? 'bg-rose-600 text-white hover:bg-rose-700'
              : 'bg-gray-200 text-gray-400 cursor-not-allowed'
          }`}
          whileHover={canProceed() ? { scale: 1.02 } : {}}
          whileTap={canProceed() ? { scale: 0.98 } : {}}
          onClick={handleNext}
          disabled={!canProceed()}
        >
          {currentStep === QUIZ_STEPS.length - 1 ? (
            <>
              {t('quiz.finish')}
              <Image className="w-5 h-5" />
            </>
          ) : (
            <>
              {t('quiz.next')}
              <ChevronRight className="w-5 h-5" />
            </>
          )}
        </motion.button>
      </div>
    </div>
  );
}
