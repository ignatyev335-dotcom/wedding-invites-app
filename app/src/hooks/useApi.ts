import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios, { type AxiosError } from 'axios';
import type { InviteData, RsvpResponse, Template, User, Payment, AdminStats, MusicTrack, Illustration } from '../types';

// Create axios instance with base URL
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth interceptor
api.interceptors.request.use((config) => {
  const initData = window.Telegram?.WebApp?.initDataUnsafe;
  if (initData?.query_id) {
    config.headers['X-Telegram-Init-Data'] = JSON.stringify(initData);
  }
  return config;
});

// ============== Queries ==============

export function useUser(userId?: string) {
  return useQuery<User, AxiosError>({
    queryKey: ['user', userId],
    queryFn: async () => {
      const { data } = await api.get(`/users/${userId}`);
      return data;
    },
    enabled: !!userId,
  });
}

export function useInvite(inviteId?: string) {
  return useQuery<InviteData, AxiosError>({
    queryKey: ['invite', inviteId],
    queryFn: async () => {
      const { data } = await api.get(`/invites/${inviteId}`);
      return data;
    },
    enabled: !!inviteId,
  });
}

export function useInviteBySlug(slug: string) {
  return useQuery<InviteData, AxiosError>({
    queryKey: ['invite', 'slug', slug],
    queryFn: async () => {
      const { data } = await api.get(`/invites/slug/${slug}`);
      return data;
    },
    enabled: !!slug,
  });
}

export function useTemplates(tariff?: string) {
  return useQuery<Template[], AxiosError>({
    queryKey: ['templates', tariff],
    queryFn: async () => {
      const { data } = await api.get('/templates', { params: { tariff } });
      return data;
    },
  });
}

export function useRsvps(inviteId?: string) {
  return useQuery<RsvpResponse[], AxiosError>({
    queryKey: ['rsvps', inviteId],
    queryFn: async () => {
      const { data } = await api.get(`/rsvps`, { params: { inviteId } });
      return data;
    },
    enabled: !!inviteId,
  });
}

export function useAdminStats() {
  return useQuery<AdminStats, AxiosError>({
    queryKey: ['admin', 'stats'],
    queryFn: async () => {
      const { data } = await api.get('/admin/stats');
      return data;
    },
  });
}

export function useMusicTracks() {
  return useQuery<MusicTrack[], AxiosError>({
    queryKey: ['music'],
    queryFn: async () => {
      const { data } = await api.get('/music');
      return data;
    },
  });
}

export function useIllustrations() {
  return useQuery<Illustration[], AxiosError>({
    queryKey: ['illustrations'],
    queryFn: async () => {
      const { data } = await api.get('/illustrations');
      return data;
    },
  });
}

// ============== Mutations ==============

export function useCreateInvite() {
  const queryClient = useQueryClient();

  return useMutation<InviteData, AxiosError, Partial<InviteData>>({
    mutationFn: async (inviteData) => {
      const { data } = await api.post('/invites', inviteData);
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['invites'] });
      queryClient.setQueryData(['invite', data.id], data);
    },
  });
}

export function useUpdateInvite() {
  const queryClient = useQueryClient();

  return useMutation<InviteData, AxiosError, { id: string; data: Partial<InviteData> }>({
    mutationFn: async ({ id, data: updates }) => {
      const { data } = await api.patch(`/invites/${id}`, updates);
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['invites'] });
      queryClient.setQueryData(['invite', data.id], data);
      queryClient.invalidateQueries({ queryKey: ['invite', 'slug', data.slug] });
    },
  });
}

export function useSubmitRsvp() {
  return useMutation<RsvpResponse, AxiosError, { inviteId: string; status: string; message?: string; transfer?: string }>({
    mutationFn: async (rsvpData) => {
      const { data } = await api.post('/rsvps', rsvpData);
      return data;
    },
  });
}

export function useCreatePayment() {
  return useMutation<Payment, AxiosError, { tariff: string; returnUrl: string }>({
    mutationFn: async (paymentData) => {
      const { data } = await api.post('/payments', paymentData);
      return data;
    },
  });
}

export function useUploadFile() {
  return useMutation<string, AxiosError, { file: File; type: 'photo' | 'music' }>({
    mutationFn: async ({ file, type }) => {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('type', type);

      const { data } = await api.post('/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return data.url;
    },
  });
}

export function useUpdateUser() {
  const queryClient = useQueryClient();

  return useMutation<User, AxiosError, { id: string; data: Partial<User> }>({
    mutationFn: async ({ id, data: updates }) => {
      const { data } = await api.patch(`/users/${id}`, updates);
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['user', data.id] });
    },
  });
}

export { api };
