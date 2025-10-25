import { useCallback, useEffect, useRef, useState } from 'react';
import type { Photo } from '../interfaces/api';

/**
 * Custom hook to manage a virtualized grid for photo galleries.
 * Handles responsive columns, scroll position, container height,
 * and the set of visible items to optimize rendering.
 */
export function useVirtualGrid() {
  const gridRef = useRef<HTMLDivElement | null>(null);
  const [cols, setCols] = useState<number>(2);
  const [scrollTop, setScrollTop] = useState<number>(0);
  const [containerHeight, setContainerHeight] = useState<number>(0);
  const [endIndex, setEndIndex] = useState<number>(50);
  const [visibleSet, setVisibleSet] = useState<Set<number>>(new Set());

  /**
   * Compute responsive number of columns and container height.
   * Listens to window resize and container resize events.
   */
  useEffect(() => {
    const calc = () => {
      const w = gridRef.current?.clientWidth ?? window.innerWidth;
      const newCols = w >= 1024 ? 5 : w >= 640 ? 3 : 2; // responsive breakpoints
      setCols(newCols);
      if (gridRef.current) setContainerHeight(gridRef.current.getBoundingClientRect().height);
    };
    calc();

    const ro = new ResizeObserver(calc);
    if (gridRef.current) ro.observe(gridRef.current);
    window.addEventListener('resize', calc);

    return () => {
      ro.disconnect();
      window.removeEventListener('resize', calc);
    };
  }, []);

  /**
   * Track scroll position and update container height dynamically
   */
  useEffect(() => {
    const el = gridRef.current;
    if (!el) return;

    const onScroll = () => {
      setScrollTop(el.scrollTop);
      setContainerHeight(el.clientHeight);
    };

    el.addEventListener('scroll', onScroll, { passive: true });
    setContainerHeight(el.clientHeight); // initial height

    return () => el.removeEventListener('scroll', onScroll);
  }, []);

  /**
   * Calculate the endIndex (last item to render) based on scroll position,
   * container height, and number of columns.
   * This allows for virtualized rendering of large lists.
   */
  useEffect(() => {
    if (!containerHeight) return;

    const loadMoreThreshold = containerHeight * 2; // preload items beyond viewport
    const estimatedItemHeight = 200; // assumed fixed item height

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    setEndIndex((_) =>
      Math.max(
        0,
        Math.min(99999, Math.ceil((scrollTop + loadMoreThreshold) / estimatedItemHeight) * cols * 3)
      )
    );
  }, [scrollTop, containerHeight, cols]);

  /**
   * Mark photos as visible up to the current endIndex.
   * This is useful for triggering animations or lazy-loading.
   *
   * @param items - array of photos
   */
  const markVisible = useCallback(
    (items: Photo[]) => {
      setVisibleSet((prev) => {
        const next = new Set(prev);
        for (let i = 0; i <= endIndex; i++) {
          const id = items[i]?.id;
          if (id !== undefined) next.add(id);
        }
        return next;
      });
    },
    [endIndex]
  );

  // Return state and refs for use in a virtualized gallery
  return {
    gridRef,
    cols,
    scrollTop,
    containerHeight,
    endIndex,
    visibleSet,
    markVisible,
  };
}
