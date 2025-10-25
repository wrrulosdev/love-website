import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import './BookPage.css';
import ImageCard, { type ImageCardProps } from './ImageCard';
import { usePhotos } from '../../../hooks/usePhotos';
import type { Photo } from '../../../interfaces/api';
import { useLoading } from '../../../context/LoadingContext';
import ApiErrorState from '../../../components/errorstate/ApiErrorState';
import { BookIcon } from 'lucide-react';

const BookPage: React.FC = () => {
  const { show, hide } = useLoading();
  const { photos, loading, error, refetch } = usePhotos('Todas', 'book');

  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [twoUp, setTwoUp] = useState<boolean>(false);
  const [isAnimating, setIsAnimating] = useState<boolean>(false);
  const dotsRef = useRef<HTMLDivElement | null>(null);

  /**
   * Displays or hides the global loading overlay depending on the photo fetch state.
   */
  useEffect(() => {
    if (loading) {
      show('Loading photos...');
    } else {
      hide();
    }
  }, [loading, show, hide]);

  /**
   * Enables "two-up" mode (two visible pages) on larger screens.
   * Automatically toggles based on a media query (min-width: 768px).
   */
  useEffect(() => {
    const mq = window.matchMedia('(min-width: 768px)');
    const onChange = () => setTwoUp(mq.matches);
    onChange();
    mq.addEventListener?.('change', onChange);
    return () => mq.removeEventListener?.('change', onChange);
  }, []);

  const total = photos.length;

  /**
   * Calculates the left page index for the current spread.
   * Ensures that in two-page mode, indices are even (left page of the pair).
   */
  const leftIndex = useMemo(
    () => (twoUp ? Math.floor(currentIndex / 2) * 2 : currentIndex),
    [currentIndex, twoUp]
  );

  /**
   * Calculates the right page index when in two-page mode.
   * Returns `null` if no right page is available.
   */
  const rightIndex = useMemo(
    () => (twoUp && total > 1 ? (leftIndex + 1 < total ? leftIndex + 1 : null) : null),
    [leftIndex, twoUp, total]
  );

  /**
   * Returns the index of the last valid left page in a two-up layout.
   *
   * @returns {number} The last valid left page index (0-based).
   */
  const lastLeftIndex = useCallback((): number => {
    if (total <= 1) return 0;
    return total - (total % 2 === 0 ? 2 : 1);
  }, [total]);

  /**
   * Handles page navigation (forward or backward) with animation lock.
   * Prevents rapid navigation by setting a temporary animation flag.
   *
   * @param {'prev' | 'next'} direction - The navigation direction.
   */
  const navigate = useCallback(
    (direction: 'prev' | 'next') => {
      if (isAnimating || total === 0) return;
      setIsAnimating(true);

      setTimeout(() => {
        if (direction === 'prev') {
          // Navigate backward
          if (twoUp) {
            setCurrentIndex((prev) => {
              const step = 2;
              const newIndex = prev - step;
              if (newIndex < 0) return Math.max(0, lastLeftIndex());
              return newIndex;
            });
          } else {
            setCurrentIndex((prev) => (prev === 0 ? Math.max(0, total - 1) : prev - 1));
          }
        } else {
          // Navigate forward
          if (twoUp) {
            setCurrentIndex((prev) => {
              const step = 2;
              const newIndex = prev + step;
              return newIndex >= total ? 0 : newIndex;
            });
          } else {
            setCurrentIndex((prev) => (prev >= total - 1 ? 0 : prev + 1));
          }
        }

        // Unlock animation after transition
        setTimeout(() => setIsAnimating(false), 300);
      }, 50);
    },
    [isAnimating, total, twoUp, lastLeftIndex]
  );

  // Shortcut functions for prev/next navigation
  const prevImage = useCallback(() => navigate('prev'), [navigate]);
  const nextImage = useCallback(() => navigate('next'), [navigate]);

  /**
   * Ensures that the current index remains valid when layout mode (twoUp) or
   * total number of photos changes. Prevents out-of-range indexes.
   */
  useEffect(() => {
    if (twoUp) {
      setCurrentIndex((prev) => {
        const normalized = Math.floor(prev / 2) * 2;
        const last = lastLeftIndex();
        return normalized > last ? last : normalized;
      });
    } else {
      setCurrentIndex((prev) => (prev >= total ? Math.max(0, total - 1) : prev));
    }
  }, [twoUp, lastLeftIndex, total]);

  // Pagination dots logic
  const maxDotsVisible = 5;
  const effectiveIndex = twoUp ? Math.floor(leftIndex / 2) : leftIndex;
  const totalDots = twoUp ? Math.ceil(total / 2) : total;

  let startDot = Math.max(0, effectiveIndex - Math.floor(maxDotsVisible / 2));
  let endDot = startDot + maxDotsVisible;
  if (endDot > totalDots) {
    endDot = totalDots;
    startDot = Math.max(0, endDot - maxDotsVisible);
  }

  /**
   * Automatically scrolls the pagination dot container to keep
   * the active dot centered when navigating.
   */
  useEffect(() => {
    const container = dotsRef.current;
    if (!container) return;
    const activeDot = container.querySelector('.dot.active') as HTMLElement | null;
    if (!activeDot) return;
    const containerWidth = container.offsetWidth;
    const dotOffsetLeft = activeDot.offsetLeft;
    const dotWidth = activeDot.offsetWidth;
    const scrollLeft = dotOffsetLeft - containerWidth / 2 + dotWidth / 2;
    container.scrollTo({ left: scrollLeft, behavior: 'smooth' });
  }, [effectiveIndex, startDot, endDot]);

  /**
   * Enables keyboard navigation for left/right arrow keys.
   * Disabled while an animation is in progress.
   */
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isAnimating) return;
      if (e.key === 'ArrowLeft') prevImage();
      else if (e.key === 'ArrowRight') nextImage();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isAnimating, prevImage, nextImage]);

  /**
   * Maps the current left photo to the `ImageCard` props format.
   */
  const currentLeftCard: ImageCardProps | null = useMemo(() => {
    const p: Photo | undefined = photos[leftIndex];
    if (!p) return null;
    return {
      imageUrl: p.image_url,
      title: p.title ?? undefined,
      description: p.description ?? undefined,
      date: p.date ?? undefined,
    };
  }, [photos, leftIndex]);

  /**
   * Maps the current right photo (if any) to the `ImageCard` props format.
   */
  const currentRightCard: ImageCardProps | null = useMemo(() => {
    if (rightIndex === null) return null;
    const p: Photo | undefined = photos[rightIndex];
    if (!p) return null;
    return {
      imageUrl: p.image_url,
      title: p.title ?? undefined,
      description: p.description ?? undefined,
      date: p.date ?? undefined,
    };
  }, [photos, rightIndex]);

  // Render error state if API fails
  if (error) {
    return (
      <ApiErrorState
        error={error}
        onRetry={() => refetch().catch(() => {})}
        message="We couldn't load the images."
      />
    );
  }

  return (
    <section
      className={`book-page ${loading ? 'hidden' : ''} ${photos.length === 0 ? 'no-content' : ''}`}
    >
      {!loading && !error && photos.length === 0 ? (
        <div className="default-empty-state">
          <BookIcon size={64} />
          <h3>No images available</h3>
          <p>The storybook of this universe hasn't been written yet.</p>
          <button className="default-retry-button" onClick={() => refetch().catch(() => {})}>
            Retry
          </button>
        </div>
      ) : (
        <>
          <div className={`book ${twoUp ? 'two-up' : 'single'} ${isAnimating ? 'animating' : ''}`}>
            <div className="book-side left">
              {currentLeftCard ? (
                <ImageCard {...currentLeftCard} />
              ) : (
                <div className="blank-page" aria-hidden="true" />
              )}
            </div>

            <div className="book-separator" aria-hidden="true" />

            {twoUp && (
              <div className="book-side right">
                {currentRightCard ? (
                  <ImageCard {...currentRightCard} />
                ) : (
                  <div className="blank-page" aria-hidden="true" />
                )}
              </div>
            )}
          </div>

          <div className="book-controls">
            <div className="mobile-nav-buttons">
              <button
                className="text-nav-button prev"
                onClick={prevImage}
                aria-label="Previous page"
                disabled={isAnimating}
              >
                &lt; Previous Page
              </button>
              <button
                className="text-nav-button next"
                onClick={nextImage}
                aria-label="Next page"
                disabled={isAnimating}
              >
                Next Page &gt;
              </button>
            </div>

            <div className="pagination-dots" ref={dotsRef} role="list" aria-label="Pagination">
              {Array.from({ length: endDot - startDot }).map((_, i) => {
                const dotIndex = startDot + i;

                if (twoUp) {
                  const isActive = dotIndex === effectiveIndex;
                  return (
                    <button
                      key={dotIndex}
                      className={`dot ${isActive ? 'active' : ''}`}
                      onClick={() => !isAnimating && setCurrentIndex(dotIndex * 2)}
                      aria-label={`Go to pages ${dotIndex * 2 + 1} and ${Math.min(total, dotIndex * 2 + 2)}`}
                      role="listitem"
                      disabled={isAnimating}
                    />
                  );
                }

                const isActive = dotIndex === currentIndex;

                return (
                  <button
                    key={dotIndex}
                    className={`dot ${isActive ? 'active' : ''}`}
                    onClick={() => !isAnimating && setCurrentIndex(dotIndex)}
                    aria-label={`Go to page ${dotIndex + 1}`}
                    role="listitem"
                    disabled={isAnimating}
                  />
                );
              })}
            </div>

            <div className="book-caption">
              <em>"Each page of our book tells a love story that grows day by day."</em>
            </div>
          </div>
        </>
      )}
    </section>
  );
};

export default BookPage;
