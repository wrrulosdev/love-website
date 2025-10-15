import { HeartIcon } from 'lucide-react';
import './HomeFooter.css';

const HomeFooter: React.FC = () => {
  return (
    <footer className="home-footer">
      <HeartIcon className="home-footer-heart" />
      <span>Creado con amor para nosotros dos</span>
      <HeartIcon className="home-footer-heart" />
    </footer>
  );
};

export default HomeFooter;
