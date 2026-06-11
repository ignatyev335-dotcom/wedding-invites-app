import { Routes, Route } from 'react-router'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { lazy, Suspense } from 'react';
import { Spinner } from './components/ui/spinner';

// Lazy load pages for better performance
const Quiz = lazy(() => import('./pages/Quiz'));
const Templates = lazy(() => import('./pages/Templates'));
const EditorPage = lazy(() => import('./pages/EditorPage'));
const Preview = lazy(() => import('./pages/Preview'));
const GuestView = lazy(() => import('./pages/GuestView'));
const Admin = lazy(() => import('./pages/Admin'));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function LoadingFallback() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 to-rose-50 flex items-center justify-center">
      <Spinner className="w-8 h-8 text-rose-500" />
    </div>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Suspense fallback={<LoadingFallback />}>
        <Routes>
          <Route path="/" element={<Quiz />} />
          <Route path="/templates" element={<Templates />} />
          <Route path="/editor" element={<EditorPage />} />
          <Route path="/preview" element={<Preview />} />
          <Route path="/invite/:slug" element={<GuestView />} />
          <Route path="/admin" element={<Admin />} />
        </Routes>
      </Suspense>
    </QueryClientProvider>
  );
}
