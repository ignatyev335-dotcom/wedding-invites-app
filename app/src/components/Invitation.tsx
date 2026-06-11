import { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { useTranslation } from '../i18n/useTranslation';
import { formatDate } from '../utils/helpers';
import { useStore } from '../store/useStore';
import type { InviteData } from '../types';

import TimerBlock from './TimerBlock';
import ProgramBlock from './ProgramBlock';
import DressCodeBlock from './DressCodeBlock';
import MapBlock from './MapBlock';
import TransferBlock from './TransferBlock';
import GiftsBlock from './GiftsBlock';
import ContactsBlock from './ContactsBlock';
import RsvpBlock from './RsvpBlock';
import MusicPlayer from './MusicPlayer';

interface InvitationProps {
  invite: InviteData;
  isGuestView?: boolean;
}

interface BlockProps {
  invite: InviteData;
  isGuestView?: boolean;
}

function TimerWrapper({ invite }: BlockProps) {
  return <TimerBlock ceremonyDate={invite.ceremonyDate} />;
}
function ProgramWrapper({ invite }: BlockProps) {
  return <ProgramBlock invite={invite} />;
}
function DressCodeWrapper({ invite }: BlockProps) {
  return invite.dressCode ? (
    <DressCodeBlock items={invite.dressCode} description={invite.dressCodeDescription} />
  ) : null;
}
function MapWrapper({ invite }: BlockProps) {
  return (
    <MapBlock
      title={invite.ceremonyPlace}
      address={invite.ceremonyAddress}
      mapUrl={invite.ceremonyMapUrl}
    />
  );
}
function TransferWrapper({ invite }: BlockProps) {
  return invite.hasTransfer ? <TransferBlock details={invite.transferDetails} /> : null;
}
function GiftsWrapper({ invite }: BlockProps) {
  return <GiftsBlock text={invite.giftsText} />;
}
function ContactsWrapper({ invite }: BlockProps) {
  return invite.contacts.length > 0 ? <ContactsBlock contacts={invite.contacts} /> : null;
}
function RsvpWrapper({ invite, isGuestView }: BlockProps) {
  return invite.rsvpEnabled && isGuestView ? <RsvpBlock inviteId={invite.id} /> : null;
}

const BLOCK_COMPONENTS: Record<string, React.FC<BlockProps>> = {
  timer: TimerWrapper,
  program: ProgramWrapper,
  dressCode: DressCodeWrapper,
  map: MapWrapper,
  transfer: TransferWrapper,
  gifts: GiftsWrapper,
  contacts: ContactsWrapper,
  rsvp: RsvpWrapper,
};

export default function Invitation({ invite, isGuestView = false }: InvitationProps) {
  const { t } = useTranslation();
  const { language } = useStore();
  const containerRef = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end start'],
  });

  const bgY = useTransform(scrollYProgress, [0, 1], ['0%', '30%']);
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0.8]);

  return (
    <div ref={containerRef} className="relative min-h-screen">
      {/* Parallax Background */}
      <motion.div
        className="fixed inset-0 z-0 pointer-events-none"
        style={{ y: bgY, opacity }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-amber-50 via-rose-50 to-pink-50" />
        {/* Decorative elements */}
        <div className="absolute top-[10%] left-[5%] w-32 h-32 rounded-full bg-rose-200/20 blur-3xl" />
        <div className="absolute top-[40%] right-[10%] w-40 h-40 rounded-full bg-amber-200/20 blur-3xl" />
        <div className="absolute top-[70%] left-[15%] w-36 h-36 rounded-full bg-pink-200/20 blur-3xl" />
      </motion.div>

      {/* Content */}
      <div className="relative z-10">
        {/* Hero Section */}
        <motion.section
          className="min-h-[70vh] flex flex-col items-center justify-center px-4 py-12"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1 }}
        >
          {/* Couple Photo */}
          {invite.photoUrl && (
            <motion.div
              className="w-48 h-64 sm:w-56 sm:h-72 rounded-2xl overflow-hidden shadow-xl mb-8 border-4 border-white"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
            >
              <img
                src={invite.photoUrl}
                alt="Couple"
                className="w-full h-full object-cover"
              />
            </motion.div>
          )}

          {/* Names */}
          <motion.div
            className="text-center"
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.8 }}
          >
            <h1 className="text-3xl sm:text-4xl font-bold text-rose-800 mb-2">
              {invite.partner1Name}
            </h1>
            <motion.span
              className="inline-block text-2xl text-rose-400 font-light"
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
            >
              &amp;
            </motion.span>
            <h1 className="text-3xl sm:text-4xl font-bold text-rose-800 mt-2">
              {invite.partner2Name}
            </h1>
          </motion.div>

          {/* Date */}
          <motion.p
            className="mt-6 text-lg text-rose-600 font-medium"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
          >
            {formatDate(invite.ceremonyDate, language)}
          </motion.p>

          {/* Decorative divider */}
          <motion.div
            className="mt-6 flex items-center gap-3"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
          >
            <span className="w-12 h-px bg-rose-300" />
            <span className="text-rose-400 text-lg">&#10047;</span>
            <span className="w-12 h-px bg-rose-300" />
          </motion.div>
        </motion.section>

        {/* Blocks */}
        <div className="px-4 pb-12">
          {invite.blockOrder.map((blockId) => {
            const Component = BLOCK_COMPONENTS[blockId];
            if (!Component) return null;

            return (
              <motion.div
                key={blockId}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-50px' }}
                transition={{ duration: 0.6 }}
              >
                <Component invite={invite} isGuestView={isGuestView} />
              </motion.div>
            );
          })}
        </div>

        {/* Watermark */}
        {invite.watermarkEnabled && (
          <motion.div
            className="text-center pb-8"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
          >
            <p className="text-xs text-gray-400">{t('watermark')}</p>
          </motion.div>
        )}
      </div>

      {/* Music Player */}
      <MusicPlayer audioUrl={invite.musicUrl} />
    </div>
  );
}
