import { createBrowserRouter, Navigate } from 'react-router-dom';
import { WelcomeScreen } from '@/features/auth/components/WelcomeScreen';
import { MainScreen } from '@/features/resume/components/MainScreen';
import { ProtectedRoute } from '@/features/auth/components/ProtectedRoute';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <WelcomeScreen />,
  },
  {
    path: '/app',
    element: (
      <ProtectedRoute>
        <MainScreen />
      </ProtectedRoute>
    ),
  },
  {
    path: '*',
    element: <Navigate to="/" replace />,
  },
]);