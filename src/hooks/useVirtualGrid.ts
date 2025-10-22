import { useCallback, useEffect, useRef, useState } from 'react';
import type { Photo } from '../interfaces/api';

export function useVirtualGrid() {
  const gridRef = useRef<HTMLDivElement | null>(null);
  const [cols, setCols] = useState<number>(2);
  const [scrollTop, setScrollTop] = useState<number>(0);
  const [containerHeight, setContainerHeight] = useState<number>(0);
  const [endIndex, setEndIndex] = useState<number>(50);
  const [visibleSet, setVisibleSet] = useState<Set<number>>(new Set());

  // Calc columns + container height
  useEffect(() => {
    const calc = () => {
      const w = gridRef.current?.clientWidth ?? window.innerWidth;
      const newCols = w >= 1024 ? 5 : w >= 640 ? 3 : 2;
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

  // Scroll handler
  useEffect(() => {
    const el = gridRef.current;
    if (!el) return;
    const onScroll = () => {
      setScrollTop(el.scrollTop);
      setContainerHeight(el.clientHeight);
    };
    el.addEventListener('scroll', onScroll, { passive: true });
    setContainerHeight(el.clientHeight);
    return () => el.removeEventListener('scroll', onScroll);
  }, []);

  // Compute endIndex
  useEffect(() => {
    if (!containerHeight) return;
    const loadMoreThreshold = containerHeight * 2;
    const estimatedItemHeight = 200;
    setEndIndex((_) =>
      Math.max(
        0,
        Math.min(99999, Math.ceil((scrollTop + loadMoreThreshold) / estimatedItemHeight) * cols * 3)
      )
    );
  }, [scrollTop, containerHeight, cols]);

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
