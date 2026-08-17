// TECH.md §4 Route Definitions. S001/S002D1/S002D2/S002S1/SMSG are NOT
// separate routes — they are conditional renders/modals (TECH.md §3 note).
// TECH.md §9 Enforcement: "Dynamic imports for routes (React.lazy)".
import { lazy, Suspense } from 'react';
import { createBrowserRouter, Navigate } from 'react-router-dom';
import { ProtectedRoute } from '@/features/auth/components/ProtectedRoute';
import { Spinner } from '@/components/common/Spinner';
import { RootLayout } from './RootLayout';

const WelcomeScreen = lazy(() =>
  import('@/features/auth/components/WelcomeScreen').then((m) => ({ default: m.WelcomeScreen }))
);
const MainScreen = lazy(() =>
  import('@/features/resume/components/MainScreen').then((m) => ({ default: m.MainScreen }))
);

function RouteFallback() {
  return (
    <div className="flex h-screen items-center justify-center">
      <Spinner />
    </div>
  );
}

export const router = createBrowserRouter([
  {
    path: '/',
    element: <RootLayout />,
    children: [
      {
        index: true,
        element: (
          <Suspense fallback={<RouteFallback />}>
            <WelcomeScreen />
          </Suspense>
        ),
      },
      {
        path: 'app',
        element: (
          <ProtectedRoute>
            <Suspense fallback={<RouteFallback />}>
              <MainScreen />
            </Suspense>
          </ProtectedRoute>
        ),
      },
      { path: '*', element: <Navigate to="/" replace /> },
    ],
  },
]);
