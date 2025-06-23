import { useRef, useCallback, useEffect } from 'react';

interface TouchPoint {
  x: number;
  y: number;
  time: number;
}

interface SwipeGestureOptions {
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  onSwipeStart?: (deltaX: number) => void;
  onSwipeMove?: (deltaX: number, progress: number) => void;
  onSwipeEnd?: () => void;
  threshold?: number; // Minimum distance for a swipe
  velocity?: number; // Minimum velocity for a swipe
  preventScroll?: boolean; // Prevent vertical scrolling during horizontal swipe
}

export const useSwipeGesture = (options: SwipeGestureOptions) => {
  const {
    onSwipeLeft,
    onSwipeRight,
    onSwipeStart,
    onSwipeMove,
    onSwipeEnd,
    threshold = 50,
    velocity = 0.3,
    preventScroll = true
  } = options;

  const touchStart = useRef<TouchPoint | null>(null);
  const touchCurrent = useRef<TouchPoint | null>(null);
  const isSwipeActive = useRef(false);
  const elementRef = useRef<HTMLElement | null>(null);

  const getTouchPoint = useCallback((e: TouchEvent | React.TouchEvent): TouchPoint => {
    const touch = e.touches[0] || e.changedTouches[0];
    return {
      x: touch.clientX,
      y: touch.clientY,
      time: Date.now()
    };
  }, []);

  const handleTouchStart = useCallback((e: TouchEvent | React.TouchEvent) => {
    touchStart.current = getTouchPoint(e);
    touchCurrent.current = touchStart.current;
    isSwipeActive.current = false;
  }, [getTouchPoint]);

  const handleTouchMove = useCallback((e: TouchEvent | React.TouchEvent) => {
    if (!touchStart.current) return;

    touchCurrent.current = getTouchPoint(e);
    const deltaX = touchCurrent.current.x - touchStart.current.x;
    const deltaY = touchCurrent.current.y - touchStart.current.y;
    
    // Check if this is a horizontal swipe (more horizontal than vertical movement)
    const isHorizontalSwipe = Math.abs(deltaX) > Math.abs(deltaY);
    
    if (isHorizontalSwipe && Math.abs(deltaX) > 10) {
      if (!isSwipeActive.current) {
        isSwipeActive.current = true;
        onSwipeStart?.(deltaX);
      }
      
      // Calculate progress (0 to 1) based on threshold
      const progress = Math.min(Math.abs(deltaX) / threshold, 1);
      onSwipeMove?.(deltaX, progress);
      
      // Only prevent scrolling if this is clearly a horizontal swipe and we want to prevent scroll
      if (preventScroll && Math.abs(deltaX) > Math.abs(deltaY) * 2) {
        try {
          e.preventDefault();
        } catch {
          // Ignore passive event listener errors
          console.debug('Could not prevent default on passive event');
        }
      }
    }
  }, [onSwipeStart, onSwipeMove, threshold, preventScroll, getTouchPoint]);

  const handleTouchEnd = useCallback(() => {
    if (!touchStart.current || !touchCurrent.current) return;

    const deltaX = touchCurrent.current.x - touchStart.current.x;
    const deltaY = touchCurrent.current.y - touchStart.current.y;
    const deltaTime = touchCurrent.current.time - touchStart.current.time;
    const swipeVelocity = Math.abs(deltaX) / deltaTime;

    // Check if this qualifies as a swipe
    const isHorizontalSwipe = Math.abs(deltaX) > Math.abs(deltaY);
    const meetsThreshold = Math.abs(deltaX) > threshold;
    const meetsVelocity = swipeVelocity > velocity;

    if (isSwipeActive.current && isHorizontalSwipe && (meetsThreshold || meetsVelocity)) {
      if (deltaX > 0) {
        onSwipeRight?.();
      } else {
        onSwipeLeft?.();
      }
    }

    onSwipeEnd?.();
    touchStart.current = null;
    touchCurrent.current = null;
    isSwipeActive.current = false;
  }, [onSwipeLeft, onSwipeRight, onSwipeEnd, threshold, velocity]);

  // Set up event listeners
  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    // Use passive: true for touchstart and touchend for better performance
    // Use passive: false only for touchmove to allow preventDefault when needed
    element.addEventListener('touchstart', handleTouchStart, { passive: true });
    element.addEventListener('touchmove', handleTouchMove, { passive: false });
    element.addEventListener('touchend', handleTouchEnd, { passive: true });

    return () => {
      element.removeEventListener('touchstart', handleTouchStart);
      element.removeEventListener('touchmove', handleTouchMove);
      element.removeEventListener('touchend', handleTouchEnd);
    };
  }, [handleTouchStart, handleTouchMove, handleTouchEnd]);

  return {
    ref: elementRef,
    handlers: {
      onTouchStart: handleTouchStart,
      onTouchMove: handleTouchMove,
      onTouchEnd: handleTouchEnd
    }
  };
};
