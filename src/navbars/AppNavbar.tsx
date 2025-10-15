import React, { useEffect, useState } from 'react';
import {
  Home,
  Star,
  ImageIcon,
  ClockIcon,
  MailIcon,
  SettingsIcon,
  GithubIcon,
  BookIcon,
} from 'lucide-react';
import { NavLink } from 'react-router-dom';
import './AppNavbar.css';

type NavItem = {
  name: string;
  path: string;
  icon: React.ReactNode;
};

const navItems: NavItem[] = [
  { name: 'Home', path: '/home', icon: <Home size={24} /> },
  { name: 'Libro', path: '/book', icon: <BookIcon size={24} /> },
  { name: 'Galeria', path: '/galery', icon: <ImageIcon size={24} /> },
  { name: 'Timeline', path: '/timeline', icon: <ClockIcon size={24} /> },
  { name: 'Cartas', path: '/cards', icon: <MailIcon size={24} /> },
  { name: 'Admin', path: '/admin', icon: <SettingsIcon size={24} /> },
  { name: 'Github', path: '/github', icon: <GithubIcon size={24} /> },
];

const AppNavbar: React.FC = () => {
  const [hidden, setHidden] = useState(false);
  const [lastScrollY, setLastScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      if (currentScrollY > window.innerHeight * 0.1 && currentScrollY > lastScrollY) {
        setHidden(true);
      } else {
        setHidden(false);
      }

      setLastScrollY(currentScrollY);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY]);

  return (
    <nav className={`app-navbar ${hidden ? 'hidden' : ''}`}>
      {navItems.map((item) => (
        <NavLink
          key={item.path}
          to={item.path}
          className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
        >
          {item.icon}
        </NavLink>
      ))}
    </nav>
  );
};

export default AppNavbar;
