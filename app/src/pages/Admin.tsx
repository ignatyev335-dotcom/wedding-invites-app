import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BarChart3, Layout, Mail, Music, Image, Users, CreditCard,
  TrendingUp, Heart, DollarSign, Upload, FileAudio
} from 'lucide-react';
import { useTranslation } from '../i18n/useTranslation';
import { useAdminStats, useMusicTracks, useIllustrations } from '../hooks/useApi';
import { Spinner } from '../components/ui/spinner';

const TABS = [
  { id: 'stats', label: 'admin.stats', icon: <BarChart3 className="w-4 h-4" /> },
  { id: 'templates', label: 'admin.templates', icon: <Layout className="w-4 h-4" /> },
  { id: 'envelopes', label: 'admin.envelopes', icon: <Mail className="w-4 h-4" /> },
  { id: 'music', label: 'admin.music', icon: <Music className="w-4 h-4" /> },
  { id: 'illustrations', label: 'admin.illustrations', icon: <Image className="w-4 h-4" /> },
  { id: 'users', label: 'admin.users', icon: <Users className="w-4 h-4" /> },
  { id: 'payments', label: 'admin.payments', icon: <CreditCard className="w-4 h-4" /> },
];

// Mock data for stats
const MOCK_STATS = {
  totalUsers: 156,
  totalInvites: 234,
  totalRsvps: 1890,
  totalPayments: 89,
  revenue: 62301,
  activeToday: 23,
};

const MOCK_USERS = [
  { id: '1', telegramId: 123456789, username: 'user1', firstName: 'Anna', tariff: 'PREMIUM', createdAt: '2025-01-15' },
  { id: '2', telegramId: 987654321, username: 'user2', firstName: 'Ivan', tariff: 'FREE', createdAt: '2025-02-20' },
  { id: '3', telegramId: 456789123, username: 'user3', firstName: 'Maria', tariff: 'LIGHT', createdAt: '2025-03-10' },
];

const MOCK_PAYMENTS = [
  { id: '1', userId: '1', tariff: 'PREMIUM', amount: 999, status: 'completed', createdAt: '2025-01-15' },
  { id: '2', userId: '3', tariff: 'LIGHT', amount: 499, status: 'completed', createdAt: '2025-03-10' },
  { id: '3', userId: '4', tariff: 'PREMIUM', amount: 999, status: 'pending', createdAt: '2025-04-01' },
];

const MOCK_ENVELOPES = [
  { id: '1', name: 'Классический', style: 'classic', image: '/envelopes/classic.png' },
  { id: '2', name: 'Рустик', style: 'rustic', image: '/envelopes/rustic.png' },
  { id: '3', name: 'Модерн', style: 'modern', image: '/envelopes/modern.png' },
];

export default function Admin() {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState('stats');

  const { data: stats, isLoading: statsLoading } = useAdminStats();
  const { data: musicTracks } = useMusicTracks();
  const { data: illustrations } = useIllustrations();

  const displayStats = stats || MOCK_STATS;

  const statCards = [
    { label: 'Пользователи', value: displayStats.totalUsers, icon: <Users className="w-5 h-5" />, color: 'bg-blue-100 text-blue-600' },
    { label: 'Приглашения', value: displayStats.totalInvites, icon: <Mail className="w-5 h-5" />, color: 'bg-rose-100 text-rose-600' },
    { label: 'RSVP', value: displayStats.totalRsvps, icon: <Heart className="w-5 h-5" />, color: 'bg-pink-100 text-pink-600' },
    { label: 'Выручка', value: `${displayStats.revenue.toLocaleString()}₽`, icon: <DollarSign className="w-5 h-5" />, color: 'bg-green-100 text-green-600' },
    { label: 'Оплаты', value: displayStats.totalPayments, icon: <CreditCard className="w-5 h-5" />, color: 'bg-amber-100 text-amber-600' },
    { label: 'Сегодня', value: displayStats.activeToday, icon: <TrendingUp className="w-5 h-5" />, color: 'bg-purple-100 text-purple-600' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-4">
        <h1 className="text-xl font-bold text-gray-800">Admin Panel</h1>
      </div>

      {/* Tabs */}
      <div className="bg-white border-b border-gray-200 px-4 overflow-x-auto">
        <div className="flex gap-1 py-2 min-w-max">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? 'bg-rose-100 text-rose-700'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              {tab.icon}
              <span className="hidden sm:inline">{t(tab.label as never)}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="p-4 sm:p-6 max-w-6xl mx-auto">
        <AnimatePresence mode="wait">
          {activeTab === 'stats' && (
            <motion.div
              key="stats"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
            >
              {statsLoading ? (
                <div className="flex justify-center py-12">
                  <Spinner className="w-8 h-8 text-rose-500" />
                </div>
              ) : (
                <>
                  {/* Stat Cards */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
                    {statCards.map((card, i) => (
                      <motion.div
                        key={card.label}
                        className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.05 }}
                      >
                        <div className={`w-9 h-9 rounded-lg ${card.color} flex items-center justify-center mb-3`}>
                          {card.icon}
                        </div>
                        <p className="text-2xl font-bold text-gray-800">{card.value}</p>
                        <p className="text-xs text-gray-500 mt-0.5">{card.label}</p>
                      </motion.div>
                    ))}
                  </div>

                  {/* Analytics Charts Placeholder */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
                      <h3 className="text-sm font-semibold text-gray-700 mb-4">Регистрации за месяц</h3>
                      <div className="h-40 flex items-end gap-2">
                        {[40, 65, 45, 80, 55, 90, 70, 85, 60, 75, 95, 50].map((h, i) => (
                          <motion.div
                            key={i}
                            className="flex-1 bg-rose-200 rounded-t"
                            initial={{ height: 0 }}
                            animate={{ height: `${h}%` }}
                            transition={{ delay: i * 0.05, duration: 0.5 }}
                          />
                        ))}
                      </div>
                      <div className="flex justify-between mt-2 text-xs text-gray-400">
                        <span>Янв</span>
                        <span>Дек</span>
                      </div>
                    </div>

                    <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
                      <h3 className="text-sm font-semibold text-gray-700 mb-4">Тарифы</h3>
                      <div className="space-y-3">
                        {[
                          { label: 'FREE', value: 67, color: 'bg-gray-400' },
                          { label: 'LIGHT', value: 23, color: 'bg-amber-400' },
                          { label: 'PREMIUM', value: 10, color: 'bg-rose-500' },
                        ].map((item) => (
                          <div key={item.label}>
                            <div className="flex justify-between text-xs mb-1">
                              <span className="text-gray-600">{item.label}</span>
                              <span className="text-gray-800 font-medium">{item.value}%</span>
                            </div>
                            <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                              <motion.div
                                className={`h-full ${item.color} rounded-full`}
                                initial={{ width: 0 }}
                                animate={{ width: `${item.value}%` }}
                                transition={{ duration: 0.8 }}
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </>
              )}
            </motion.div>
          )}

          {activeTab === 'templates' && (
            <motion.div
              key="templates"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden"
            >
              <table className="w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="text-left px-4 py-3 font-medium text-gray-600">ID</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-600">Название</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-600">Тариф</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-600">Категория</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { id: '1', name: 'Классика', tariff: 'FREE', category: 'classic' },
                    { id: '2', name: 'Минимализм', tariff: 'FREE', category: 'minimal' },
                    { id: '3', name: 'Бохо', tariff: 'LIGHT', category: 'boho' },
                    { id: '4', name: 'Гламур', tariff: 'LIGHT', category: 'glamour' },
                    { id: '5', name: 'Винтаж', tariff: 'PREMIUM', category: 'vintage' },
                  ].map((t) => (
                    <tr key={t.id} className="border-t border-gray-100 hover:bg-gray-50">
                      <td className="px-4 py-3 text-gray-500">{t.id}</td>
                      <td className="px-4 py-3 font-medium text-gray-800">{t.name}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                          t.tariff === 'FREE' ? 'bg-green-100 text-green-700' :
                          t.tariff === 'LIGHT' ? 'bg-amber-100 text-amber-700' :
                          'bg-rose-100 text-rose-700'
                        }`}>
                          {t.tariff}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gray-500">{t.category}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </motion.div>
          )}

          {activeTab === 'envelopes' && (
            <motion.div
              key="envelopes"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="grid grid-cols-2 sm:grid-cols-3 gap-4"
            >
              {MOCK_ENVELOPES.map((env, i) => (
                <motion.div
                  key={env.id}
                  className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 text-center"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.05 }}
                >
                  <div className="w-full aspect-[3/2] bg-gradient-to-br from-amber-100 to-rose-100 rounded-lg mb-3 flex items-center justify-center">
                    <Mail className="w-12 h-12 text-rose-300" />
                  </div>
                  <h4 className="font-medium text-gray-800">{env.name}</h4>
                  <p className="text-xs text-gray-500">{env.style}</p>
                </motion.div>
              ))}
            </motion.div>
          )}

          {activeTab === 'music' && (
            <motion.div
              key="music"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
            >
              {/* Upload */}
              <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 mb-4">
                <h3 className="text-sm font-semibold text-gray-700 mb-3">Загрузить трек</h3>
                <div className="border-2 border-dashed border-gray-200 rounded-lg p-6 text-center hover:border-rose-300 transition-colors cursor-pointer">
                  <FileAudio className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-500">Перетащите аудиофайл или нажмите для выбора</p>
                  <p className="text-xs text-gray-400 mt-1">MP3, WAV до 10MB</p>
                  <input type="file" accept="audio/*" className="hidden" />
                </div>
              </div>

              {/* Tracks List */}
              <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="text-left px-4 py-3 font-medium text-gray-600">Название</th>
                      <th className="text-left px-4 py-3 font-medium text-gray-600">Исполнитель</th>
                      <th className="text-left px-4 py-3 font-medium text-gray-600">Длительность</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(musicTracks || [
                      { id: '1', title: 'Wedding March', artist: 'Traditional', duration: 180 },
                      { id: '2', title: 'Canon in D', artist: 'Pachelbel', duration: 240 },
                      { id: '3', title: 'A Thousand Years', artist: 'Christina Perri', duration: 285 },
                    ]).map((track: { id: string; title: string; artist?: string; duration?: number }) => (
                      <tr key={track.id} className="border-t border-gray-100 hover:bg-gray-50">
                        <td className="px-4 py-3 font-medium text-gray-800">{track.title}</td>
                        <td className="px-4 py-3 text-gray-500">{track.artist || '-'}</td>
                        <td className="px-4 py-3 text-gray-500">
                          {track.duration ? `${Math.floor(track.duration / 60)}:${String(track.duration % 60).padStart(2, '0')}` : '-'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </motion.div>
          )}

          {activeTab === 'illustrations' && (
            <motion.div
              key="illustrations"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
            >
              {/* Upload */}
              <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 mb-4">
                <h3 className="text-sm font-semibold text-gray-700 mb-3">Загрузить иллюстрацию</h3>
                <div className="border-2 border-dashed border-gray-200 rounded-lg p-6 text-center hover:border-rose-300 transition-colors cursor-pointer">
                  <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-500">Перетащите изображение или нажмите для выбора</p>
                  <input type="file" accept="image/*" className="hidden" />
                </div>
              </div>

              {/* Illustrations Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {(illustrations || [
                  { id: '1', title: 'Цветы 1', category: 'flowers' },
                  { id: '2', title: 'Цветы 2', category: 'flowers' },
                  { id: '3', title: 'Кольца', category: 'rings' },
                  { id: '4', title: 'Конверт', category: 'envelope' },
                ]).map((ill: { id: string; title: string; category?: string }, i: number) => (
                  <motion.div
                    key={ill.id}
                    className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.05 }}
                  >
                    <div className="aspect-square bg-gradient-to-br from-rose-100 to-amber-100 flex items-center justify-center">
                      <Image className="w-8 h-8 text-rose-300" />
                    </div>
                    <div className="p-3">
                      <p className="text-sm font-medium text-gray-700">{ill.title}</p>
                      <p className="text-xs text-gray-400">{ill.category}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          {activeTab === 'users' && (
            <motion.div
              key="users"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden"
            >
              <table className="w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="text-left px-4 py-3 font-medium text-gray-600">ID</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-600">Имя</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-600">Username</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-600">Тариф</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-600">Дата</th>
                  </tr>
                </thead>
                <tbody>
                  {MOCK_USERS.map((u) => (
                    <tr key={u.id} className="border-t border-gray-100 hover:bg-gray-50">
                      <td className="px-4 py-3 text-gray-500">{u.id}</td>
                      <td className="px-4 py-3 font-medium text-gray-800">{u.firstName}</td>
                      <td className="px-4 py-3 text-gray-500">@{u.username}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                          u.tariff === 'FREE' ? 'bg-green-100 text-green-700' :
                          u.tariff === 'LIGHT' ? 'bg-amber-100 text-amber-700' :
                          'bg-rose-100 text-rose-700'
                        }`}>
                          {u.tariff}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gray-400">{u.createdAt}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </motion.div>
          )}

          {activeTab === 'payments' && (
            <motion.div
              key="payments"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden"
            >
              <table className="w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="text-left px-4 py-3 font-medium text-gray-600">ID</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-600">Пользователь</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-600">Тариф</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-600">Сумма</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-600">Статус</th>
                  </tr>
                </thead>
                <tbody>
                  {MOCK_PAYMENTS.map((p) => (
                    <tr key={p.id} className="border-t border-gray-100 hover:bg-gray-50">
                      <td className="px-4 py-3 text-gray-500">{p.id}</td>
                      <td className="px-4 py-3 text-gray-800">{p.userId}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                          p.tariff === 'LIGHT' ? 'bg-amber-100 text-amber-700' :
                          'bg-rose-100 text-rose-700'
                        }`}>
                          {p.tariff}
                        </span>
                      </td>
                      <td className="px-4 py-3 font-medium text-gray-800">{p.amount}₽</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                          p.status === 'completed' ? 'bg-green-100 text-green-700' :
                          p.status === 'pending' ? 'bg-amber-100 text-amber-700' :
                          'bg-red-100 text-red-700'
                        }`}>
                          {p.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
