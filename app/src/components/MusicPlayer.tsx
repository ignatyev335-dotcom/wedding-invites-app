import { useRef, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Pause, Music } from 'lucide-react';
import { useStore } from '../store/useStore';

interface MusicPlayerProps {
  audioUrl?: string;
}

export default function MusicPlayer({ audioUrl }: MusicPlayerProps) {
  const { isMusicPlaying, setMusicPlaying } = useStore();
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    if (audioUrl) {
      audioRef.current = new Audio(audioUrl);
      audioRef.current.loop = true;
      audioRef.current.addEventListener('error', () => setHasError(true));
    }

    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, [audioUrl]);

  useEffect(() => {
    if (!audioRef.current || hasError) return;

    if (isMusicPlaying) {
      audioRef.current.play().catch(() => {
        setHasError(true);
        setMusicPlaying(false);
      });
    } else {
      audioRef.current.pause();
    }
  }, [isMusicPlaying, hasError, setMusicPlaying]);

  if (!audioUrl || hasError) return null;

  return (
    <motion.button
      className="fixed bottom-5 right-5 z-40 w-12 h-12 rounded-full bg-rose-600 text-white shadow-lg flex items-center justify-center hover:bg-rose-700 transition-colors"
      onClick={() => setMusicPlaying(!isMusicPlaying)}
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ delay: 2, type: 'spring' }}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
    >
      {isMusicPlaying ? (
        <motion.div
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ duration: 1, repeat: Infinity }}
        >
          <Pause className="w-5 h-5" />
        </motion.div>
      ) : (
        <Music className="w-5 h-5" />
      )}

      {/* Sound waves animation when playing */}
      {isMusicPlaying && (
        <>
          <motion.span
            className="absolute inset-0 rounded-full border-2 border-rose-400"
            animate={{ scale: [1, 1.5], opacity: [0.6, 0] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          />
          <motion.span
            className="absolute inset-0 rounded-full border-2 border-rose-300"
            animate={{ scale: [1, 1.8], opacity: [0.4, 0] }}
            transition={{ duration: 1.5, repeat: Infinity, delay: 0.5 }}
          />
        </>
      )}
    </motion.button>
  );
}
