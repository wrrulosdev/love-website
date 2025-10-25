import './ImageCard.css';

export type ImageCardProps = {
  imageUrl: string;
  title: string;
  description: string;
  date: string;
};

/**
 * Renders a visual card displaying an image with its title, date, and description.
 * Typically used within the BookPage to represent a single "page" of a story or memory.
 *
 * @component
 * @param {ImageCardProps} props - Component properties.
 * @param {string} props.imageUrl - The image source URL.
 * @param {string} props.title - The title text.
 * @param {string} props.description - The descriptive text below the title.
 * @param {string} props.date - The date displayed under the title.
 * @returns {JSX.Element} A formatted card with image and text content.
 */
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
