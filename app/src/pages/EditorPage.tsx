import { useState, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Save, Eye, Upload, AlertCircle } from 'lucide-react';
import { useTranslation } from '../i18n/useTranslation';
import { useTelegram } from '../hooks/useTelegram';
import { useStore } from '../store/useStore';
import { useUpdateInvite, useUploadFile } from '../hooks/useApi';
import { validatePortraitPhoto } from '../utils/validators';
import { checkTariffLimit } from '../utils/helpers';
import Editor from '../components/Editor';
import PaymentModal from '../components/PaymentModal';

interface EditorPageProps {
  inviteId?: string;
}

export default function EditorPage({ inviteId }: EditorPageProps) {
  const { t } = useTranslation();
  const { hapticImpact, hapticNotify } = useTelegram();
  const { invite, editorBlocks, setEditorBlocks, tariff } = useStore();
  const updateInvite = useUpdateInvite();
  const uploadFile = useUploadFile();

  const [blocks, setBlocks] = useState(editorBlocks);
  const [showPayment, setShowPayment] = useState(false);
  const [photoError, setPhotoError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    partner1Name: invite?.partner1Name || '',
    partner2Name: invite?.partner2Name || '',
    ceremonyDate: invite?.ceremonyDate?.split('T')[0] || '',
    ceremonyTime: invite?.ceremonyTime || '',
    ceremonyPlace: invite?.ceremonyPlace || '',
    ceremonyAddress: invite?.ceremonyAddress || '',
    ceremonyMapUrl: invite?.ceremonyMapUrl || '',
    hasBanquet: invite?.hasBanquet || false,
    banquetTime: invite?.banquetTime || '',
    banquetPlace: invite?.banquetPlace || '',
    hasTransfer: invite?.hasTransfer || false,
    transferDetails: invite?.transferDetails || '',
    giftsText: invite?.giftsText || '',
  });

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleBlockUpdate = useCallback((newBlocks: string[]) => {
    setBlocks(newBlocks);
    setEditorBlocks(newBlocks);
  }, [setEditorBlocks]);

  const handleChange = (field: string, value: unknown) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setPhotoError(null);

    // Check tariff limit
    const photoCount = invite?.photoUrl ? 1 : 0;
    if (checkTariffLimit(tariff, 'maxPhotos', photoCount)) {
      setShowPayment(true);
      return;
    }

    // Validate portrait orientation
    const isPortrait = await validatePortraitPhoto(file);
    if (!isPortrait) {
      setPhotoError('Фото должно быть в вертикальной ориентации (портрет)');
      hapticNotify('error');
      return;
    }

    try {
      const url = await uploadFile.mutateAsync({ file, type: 'photo' });
      // Would update invite with new photo URL
      console.log('Uploaded photo:', url);
      hapticNotify('success');
    } catch {
      hapticNotify('error');
    }
  };

  const handleSave = async () => {
    hapticImpact('medium');

    if (!inviteId) return;

    try {
      await updateInvite.mutateAsync({
        id: inviteId,
        data: {
          ...formData,
          blockOrder: blocks,
        },
      });
      hapticNotify('success');
    } catch {
      hapticNotify('error');
    }
  };

  const handlePreview = () => {
    hapticImpact('light');
    window.open('/#/preview', '_blank');
  };

  const inputClasses =
    'w-full p-3 rounded-xl border border-rose-200 bg-white/80 text-gray-800 focus:outline-none focus:ring-2 focus:ring-rose-400 text-sm';
  const labelClasses = 'block text-sm font-medium text-gray-700 mb-1';

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 to-rose-50">
      {/* Header */}
      <div className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-rose-100 px-4 py-3">
        <div className="max-w-lg mx-auto flex items-center justify-between">
          <h1 className="text-lg font-bold text-gray-800">{t('editor.invitationTitle')}</h1>
          <div className="flex gap-2">
            <motion.button
              className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handlePreview}
            >
              <Eye className="w-4 h-4 text-gray-600" />
            </motion.button>
            <motion.button
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-rose-600 text-white text-sm font-medium hover:bg-rose-700 transition-colors disabled:opacity-50"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleSave}
              disabled={updateInvite.isPending}
            >
              <Save className="w-4 h-4" />
              {updateInvite.isPending ? t('common.loading') : t('editor.save')}
            </motion.button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-lg mx-auto px-4 py-6 space-y-6">
        {/* Couple Photo Upload */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <label className={labelClasses}>{t('editor.photo')}</label>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handlePhotoUpload}
            className="hidden"
          />
          <motion.button
            className="w-full h-40 rounded-xl border-2 border-dashed border-rose-300 bg-white/50 flex flex-col items-center justify-center gap-2 hover:bg-rose-50 transition-colors"
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            onClick={() => fileInputRef.current?.click()}
          >
            <Upload className="w-8 h-8 text-rose-400" />
            <span className="text-sm text-rose-500">{t('editor.uploadPhoto')}</span>
          </motion.button>
          {photoError && (
            <div className="flex items-center gap-2 mt-2 text-red-500 text-xs">
              <AlertCircle className="w-4 h-4" />
              {photoError}
            </div>
          )}
          {invite?.photoUrl && (
            <img
              src={invite.photoUrl}
              alt="Couple"
              className="mt-3 w-full h-48 object-cover rounded-xl"
            />
          )}
        </motion.section>

        {/* Names */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <label className={labelClasses}>{t('editor.names')}</label>
          <div className="flex gap-3">
            <input
              type="text"
              value={formData.partner1Name}
              onChange={(e) => handleChange('partner1Name', e.target.value)}
              placeholder="Имя 1"
              className={inputClasses}
            />
            <span className="self-center text-rose-400 font-bold">&amp;</span>
            <input
              type="text"
              value={formData.partner2Name}
              onChange={(e) => handleChange('partner2Name', e.target.value)}
              placeholder="Имя 2"
              className={inputClasses}
            />
          </div>
        </motion.section>

        {/* Date & Time */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
        >
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelClasses}>{t('editor.date')}</label>
              <input
                type="date"
                value={formData.ceremonyDate}
                onChange={(e) => handleChange('ceremonyDate', e.target.value)}
                className={inputClasses}
              />
            </div>
            <div>
              <label className={labelClasses}>{t('editor.time')}</label>
              <input
                type="time"
                value={formData.ceremonyTime}
                onChange={(e) => handleChange('ceremonyTime', e.target.value)}
                className={inputClasses}
              />
            </div>
          </div>
        </motion.section>

        {/* Venue */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <label className={labelClasses}>{t('editor.place')}</label>
          <input
            type="text"
            value={formData.ceremonyPlace}
            onChange={(e) => handleChange('ceremonyPlace', e.target.value)}
            placeholder="Название места"
            className={inputClasses + ' mb-3'}
          />
          <label className={labelClasses}>{t('editor.address')}</label>
          <input
            type="text"
            value={formData.ceremonyAddress}
            onChange={(e) => handleChange('ceremonyAddress', e.target.value)}
            placeholder="Адрес"
            className={inputClasses + ' mb-3'}
          />
          <label className={labelClasses}>{t('map.title')}</label>
          <input
            type="text"
            value={formData.ceremonyMapUrl}
            onChange={(e) => handleChange('ceremonyMapUrl', e.target.value)}
            placeholder="Ссылка на карту"
            className={inputClasses}
          />
        </motion.section>

        {/* Banquet Toggle */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="flex items-center justify-between p-4 rounded-xl bg-white/80 border border-rose-100"
        >
          <span className="text-sm font-medium text-gray-700">{t('quiz.hasBanquet')}</span>
          <button
            onClick={() => handleChange('hasBanquet', !formData.hasBanquet)}
            className={`w-12 h-6 rounded-full transition-colors relative ${
              formData.hasBanquet ? 'bg-rose-500' : 'bg-gray-300'
            }`}
          >
            <motion.span
              className="absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow-sm"
              animate={{ x: formData.hasBanquet ? 24 : 0 }}
              transition={{ type: 'spring', stiffness: 500, damping: 30 }}
            />
          </button>
        </motion.section>

        {formData.hasBanquet && (
          <motion.section
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
          >
            <label className={labelClasses}>Время банкета</label>
            <input
              type="time"
              value={formData.banquetTime}
              onChange={(e) => handleChange('banquetTime', e.target.value)}
              className={inputClasses + ' mb-3'}
            />
            <label className={labelClasses}>Место банкета</label>
            <input
              type="text"
              value={formData.banquetPlace}
              onChange={(e) => handleChange('banquetPlace', e.target.value)}
              placeholder="Название ресторана"
              className={inputClasses}
            />
          </motion.section>
        )}

        {/* Transfer */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <div className="flex items-center justify-between p-4 rounded-xl bg-white/80 border border-rose-100 mb-3">
            <span className="text-sm font-medium text-gray-700">{t('quiz.hasTransfer')}</span>
            <button
              onClick={() => handleChange('hasTransfer', !formData.hasTransfer)}
              className={`w-12 h-6 rounded-full transition-colors relative ${
                formData.hasTransfer ? 'bg-rose-500' : 'bg-gray-300'
              }`}
            >
              <motion.span
                className="absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow-sm"
                animate={{ x: formData.hasTransfer ? 24 : 0 }}
                transition={{ type: 'spring', stiffness: 500, damping: 30 }}
              />
            </button>
          </div>
          {formData.hasTransfer && (
            <textarea
              value={formData.transferDetails}
              onChange={(e) => handleChange('transferDetails', e.target.value)}
              placeholder="Детали трансфера"
              className={inputClasses + ' resize-none'}
              rows={2}
            />
          )}
        </motion.section>

        {/* Gifts */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
        >
          <label className={labelClasses}>{t('gifts.title')}</label>
          <textarea
            value={formData.giftsText}
            onChange={(e) => handleChange('giftsText', e.target.value)}
            placeholder="Текст о подарках"
            className={inputClasses + ' resize-none'}
            rows={3}
          />
        </motion.section>

        {/* Block Order Editor */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Editor blockOrder={blocks} onUpdate={handleBlockUpdate} />
        </motion.section>
      </div>

      {/* Payment Modal */}
      <PaymentModal isOpen={showPayment} onClose={() => setShowPayment(false)} currentTariff={tariff} />
    </div>
  );
}
