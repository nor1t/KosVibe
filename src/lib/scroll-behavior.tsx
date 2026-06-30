import { createContext, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';

type ScrollBehaviorContextValue = {
  scrollOffset: number;
  isCompact: boolean;
  setScrollOffset: (value: number) => void;
  expandBars: () => void;
};

const ScrollBehaviorContext = createContext<ScrollBehaviorContextValue | undefined>(undefined);

export function ScrollBehaviorProvider({ children }: { children: ReactNode }) {
  const [scrollOffset, setScrollOffsetState] = useState(0);
  const [isCompact, setIsCompact] = useState(false);
  const pendingOffsetRef = useRef(0);
  const lastCommittedOffsetRef = useRef(0);
  const frameRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (frameRef.current !== null) {
        cancelAnimationFrame(frameRef.current);
      }
    };
  }, []);

  const setScrollOffset = (nextOffset: number) => {
    const normalizedOffset = Number.isFinite(nextOffset) ? nextOffset : 0;
    pendingOffsetRef.current = normalizedOffset;

    if (frameRef.current !== null) {
      return;
    }

    frameRef.current = requestAnimationFrame(() => {
      frameRef.current = null;
      const currentOffset = pendingOffsetRef.current;
      const delta = currentOffset - lastCommittedOffsetRef.current;

      setScrollOffsetState(currentOffset);
      lastCommittedOffsetRef.current = currentOffset;

      if (currentOffset <= 8) {
        setIsCompact(false);
      } else if (delta > 8 || currentOffset > 24) {
        setIsCompact(true);
      } else if (delta < -8) {
        setIsCompact(false);
      }
    });
  };

  const expandBars = () => {
    setIsCompact(false);
  };

  const value = useMemo(
    () => ({
      scrollOffset,
      isCompact,
      setScrollOffset,
      expandBars,
    }),
    [isCompact, scrollOffset]
  );

  return <ScrollBehaviorContext.Provider value={value}>{children}</ScrollBehaviorContext.Provider>;
}

export function useScrollBehavior() {
  const context = useContext(ScrollBehaviorContext);

  if (!context) {
    throw new Error('useScrollBehavior must be used within a ScrollBehaviorProvider');
  }

  return context;
}
