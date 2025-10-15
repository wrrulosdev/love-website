import { type LucideIcon } from 'lucide-react';
import './PageCard.css';
import { Link } from 'react-router-dom';

export type PageCardProps = {
  icon: LucideIcon;
  title: string;
  description: string;
  to: string;
};

type CirclePosition = {
  top?: string;
  bottom?: string;
  left?: string;
  right?: string;
  transform?: string;
};

const circlePositions: CirclePosition[] = [
  { top: '-15px', left: '-15px' },
  { top: '-15px', right: '-15px' },
  { bottom: '-15px', left: '-15px' },
  { bottom: '-15px', right: '-15px' },
  { top: '-20px', left: '50%', transform: 'translateX(-50%)' },
  { bottom: '-20px', left: '50%', transform: 'translateX(-50%)' },
  { top: '50%', left: '-20px', transform: 'translateY(-50%)' },
  { top: '50%', right: '-20px', transform: 'translateY(-50%)' },
];

const PageCard: React.FC<PageCardProps> = ({ icon: Icon, title, description, to }) => {
  const randomPosition = circlePositions[Math.floor(Math.random() * circlePositions.length)];

  return (
    <Link
      to={to}
      className="home-pagecard"
      tabIndex={0}
      style={
        {
          '--dot-top': randomPosition.top || 'auto',
          '--dot-bottom': randomPosition.bottom || 'auto',
          '--dot-left': randomPosition.left || 'auto',
          '--dot-right': randomPosition.right || 'auto',
          '--dot-transform': randomPosition.transform || 'none',
        } as React.CSSProperties
      }
    >
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
