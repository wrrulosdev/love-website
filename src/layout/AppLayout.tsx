import * as React from 'react';
import { Outlet } from 'react-router-dom';
import './Layout.css';
import AppNavbar from '../navbars/AppNavbar';
import LoadingOverlay from '../loading/LoadingOverlay';
import { LoadingProvider, useLoading } from '../context/LoadingContext';
import WallpaperEmojis from './WallpaperEmojis';

const AppLayoutInner: React.FC = () => {
  const { isLoading, message } = useLoading();

  return (
    <div className="app-layout" aria-hidden={false}>
      <AppNavbar />
      <WallpaperEmojis />
      <LoadingOverlay visible={isLoading} message={message} gifSrc="/loading.gif" />

      <div className="app-content">
        <Outlet />
      </div>
    </div>
  );
};

const AppLayout: React.FC = () => {
  return (
    <LoadingProvider>
      <AppLayoutInner />
    </LoadingProvider>
  );
};

export default AppLayout;
