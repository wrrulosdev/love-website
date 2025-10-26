import * as React from 'react';
import { Outlet } from 'react-router-dom';
import './Layout.css';
import WallpaperEmojis from './WallpaperEmojis';

const LayoutNoNavbar: React.FC = () => {
  return (
    <div className="app-layout" aria-hidden={false}>
      <WallpaperEmojis />
      <div className="app-content">
        <Outlet />
      </div>
    </div>
  );
};

export default LayoutNoNavbar;
