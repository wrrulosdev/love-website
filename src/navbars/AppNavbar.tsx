import React, { useEffect, useState } from 'react';
import {
  Home,
  ImageIcon,
  ClockIcon,
  MailIcon,
  SettingsIcon,
  GithubIcon,
  BookIcon,
} from 'lucide-react';
import { NavLink, useLocation } from 'react-router-dom';
import './AppNavbar.css';

type NavItem = {
  name: string;
  path?: string;
  icon: React.ReactNode;
  external?: boolean;
};

const navItems: NavItem[] = [
  { name: 'Home', path: '/home', icon: <Home size={24} /> },
  { name: 'Libro', path: '/book', icon: <BookIcon size={24} /> },
  { name: 'Galeria', path: '/galery', icon: <ImageIcon size={24} /> },
  { name: 'Timeline', path: '/timeline', icon: <ClockIcon size={24} /> },
  { name: 'Cartas', path: '/cards', icon: <MailIcon size={24} /> },
  { name: 'Admin', path: '/admin', icon: <SettingsIcon size={24} /> },
  {
    name: 'Github',
    icon: <GithubIcon size={24} />,
    external: true,
    path: 'https://github.com/wrrulosdev/love-website',
  },
];

const AppNavbar: React.FC = () => {
  const [hidden, setHidden] = useState(false);
  const [lastScrollY, setLastScrollY] = useState(0);
  const location = useLocation();

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
      {navItems.map((item) =>
        item.external ? (
          <a
            key={item.name}
            href={item.path}
            target="_blank"
            rel="noopener noreferrer"
            className="nav-item"
            title={item.name}
          >
            {item.icon}
          </a>
        ) : (
          <NavLink
            key={item.path}
            to={item.path!}
            className={({ isActive }) => {
              const isAdminRelated =
                item.path === '/admin' &&
                (location.pathname.startsWith('/admin') || location.pathname.startsWith('/login'));

              return `nav-item ${isActive || isAdminRelated ? 'active' : ''}`;
            }}
            title={item.name}
          >
            {item.icon}
          </NavLink>
        )
      )}
    </nav>
  );
};

export default AppNavbar;
