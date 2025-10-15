import { type LucideIcon } from 'lucide-react';
import './PageCard.css';
import { Link } from 'react-router-dom';

export type PageCardProps = {
  icon: LucideIcon;
  title: string;
  description: string;
  to: string;
};

const PageCard: React.FC<PageCardProps> = ({ icon: Icon, title, description, to }) => {
  return (
    <Link to={to} className="home-pagecard" tabIndex={0}>
      <div className="icon-wrap">
        <Icon className="icon" aria-hidden />
        <span className="icon-circle" />
      </div>
      <h2>{title}</h2>
      <p>{description}</p>
    </Link>
  );
};

export default PageCard;
