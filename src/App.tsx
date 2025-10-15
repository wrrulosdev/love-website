import React from 'react';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import SimplePasswordPage from './pages/simplepassword/SimplePasswordPage';
import HomePage from './pages/app/home/HomePage';
import AppLayout from './layout/AppLayout';
import SimpleProtectedRoute from './protection/SimpleProtectedRoute';
import ProtectedRoute from './protection/ProtectedRoute';
import BookPage from './pages/app/book/BookPage';
import GaleryPage from './pages/app/galery/GaleryPage';
import AdminLoginPage from './pages/admin/AdminLoginPage';
import AdminDashboardPage from './pages/admin/dashboard/AdminDashboard';
import UploadImagesPage from './pages/admin/subpages/UploadImagesPage';
import EditImagesPage from './pages/admin/subpages/EditImagesPage';
import LayoutNoNavbar from './layout/LayoutNoNavbar';
import TimelinePage from './pages/app/timeline/TimeLinePage';
import CardsPage from './pages/app/cards/CardsPage';

const router = createBrowserRouter([
  {
    path: '/',
    element: <LayoutNoNavbar />,
    children: [
      {
        index: true,
        element: <SimplePasswordPage />,
      },
    ],
  },

  // Pages with simple protection

  {
    path: '/home',
    element: (
      <SimpleProtectedRoute>
        <AppLayout />
      </SimpleProtectedRoute>
    ),
    children: [{ index: true, element: <HomePage /> }],
  },
  {
    path: '/book',
    element: (
      <SimpleProtectedRoute>
        <AppLayout />
      </SimpleProtectedRoute>
    ),
    children: [{ index: true, element: <BookPage /> }],
  },
  {
    path: '/galery',
    element: (
      <SimpleProtectedRoute>
        <AppLayout />
      </SimpleProtectedRoute>
    ),
    children: [{ index: true, element: <GaleryPage /> }],
  },
  {
    path: '/timeline',
    element: (
      <SimpleProtectedRoute>
        <AppLayout />
      </SimpleProtectedRoute>
    ),
    children: [{ index: true, element: <TimelinePage /> }],
  },
  {
    path: '/cards',
    element: (
      <SimpleProtectedRoute>
        <AppLayout />
      </SimpleProtectedRoute>
    ),
    children: [{ index: true, element: <CardsPage /> }],
  },

  // Admin routes

  {
    path: '/login',
    element: <AppLayout />,
    children: [{ index: true, element: <AdminLoginPage /> }],
  },
  {
    path: '/admin',
    element: (
      <ProtectedRoute>
        <LayoutNoNavbar />
      </ProtectedRoute>
    ),
    children: [{ index: true, element: <AdminDashboardPage /> }],
  },
  {
    path: '/admin/upload-image',
    element: (
      <ProtectedRoute>
        <LayoutNoNavbar />
      </ProtectedRoute>
    ),
    children: [{ index: true, element: <UploadImagesPage /> }],
  },
  {
    path: '/admin/edit-image',
    element: (
      <ProtectedRoute>
        <LayoutNoNavbar />
      </ProtectedRoute>
    ),
    children: [{ index: true, element: <EditImagesPage /> }],
  },
]);

const App: React.FC = () => {
  return (
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  );
};

export default App;
