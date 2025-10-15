import './ImageCard.css';

export type ImageCardProps = {
  imageUrl: string;
  title: string;
  description: string;
  date: string;
};

const ImageCard: React.FC<ImageCardProps> = ({ imageUrl, title, description, date }) => {
  return (
    <article className="book-imagecard">
      <img src={imageUrl} alt={title} />
      <h2>{title}</h2>
      <span>{date}</span>
      <p>{description}</p>
    </article>
  );
};

export default ImageCard;
