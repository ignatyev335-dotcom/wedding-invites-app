import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User, InviteData, Language, Tariff } from '../types';

interface AppState {
  // User
  user: User | null;
  setUser: (user: User | null) => void;

  // Invite
  invite: InviteData | null;
  setInvite: (invite: InviteData | null) => void;
  updateInvite: (updates: Partial<InviteData>) => void;

  // Language
  language: Language;
  setLanguage: (lang: Language) => void;

  // Tariff
  tariff: Tariff;
  setTariff: (tariff: Tariff) => void;

  // UI State
  isEnvelopeOpened: boolean;
  setEnvelopeOpened: (opened: boolean) => void;

  // Quiz
  quizAnswers: Record<string, unknown>;
  setQuizAnswers: (answers: Record<string, unknown>) => void;

  // Editor
  editorBlocks: string[];
  setEditorBlocks: (blocks: string[]) => void;

  // Music
  isMusicPlaying: boolean;
  setMusicPlaying: (playing: boolean) => void;

  // Loading
  isLoading: boolean;
  setLoading: (loading: boolean) => void;
}

export const useStore = create<AppState>()(
  persist(
    (set) => ({
      // User
      user: null,
      setUser: (user) => set({ user }),

      // Invite
      invite: null,
      setInvite: (invite) => set({ invite }),
      updateInvite: (updates) =>
        set((state) => ({
          invite: state.invite ? { ...state.invite, ...updates } : null,
        })),

      // Language
      language: 'ru',
      setLanguage: (language) => set({ language }),

      // Tariff
      tariff: 'FREE',
      setTariff: (tariff) => set({ tariff }),

      // UI State
      isEnvelopeOpened: false,
      setEnvelopeOpened: (isEnvelopeOpened) => set({ isEnvelopeOpened }),

      // Quiz
      quizAnswers: {},
      setQuizAnswers: (quizAnswers) => set({ quizAnswers }),

      // Editor
      editorBlocks: [
        'timer',
        'program',
        'dressCode',
        'map',
        'transfer',
        'gifts',
        'contacts',
        'rsvp',
      ],
      setEditorBlocks: (editorBlocks) => set({ editorBlocks }),

      // Music
      isMusicPlaying: false,
      setMusicPlaying: (isMusicPlaying) => set({ isMusicPlaying }),

      // Loading
      isLoading: false,
      setLoading: (isLoading) => set({ isLoading }),
    }),
    {
      name: 'wedding-app-storage',
      partialize: (state) => ({
        language: state.language,
        tariff: state.tariff,
        quizAnswers: state.quizAnswers,
        editorBlocks: state.editorBlocks,
        user: state.user,
        invite: state.invite,
      }),
    }
  )
);
