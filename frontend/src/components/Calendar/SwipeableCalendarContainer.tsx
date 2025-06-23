import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useCalendar } from '../../contexts/CalendarContext';
import { useSwipeGesture } from '../../hooks/useSwipeGesture';
import { addMonths, addDays } from '../../utils/dateUtils';

interface SwipeableCalendarContainerProps {
  children: React.ReactNode;
}

type SlideDirection = 'none' | 'left' | 'right';

const SwipeableCalendarContainer: React.FC<SwipeableCalendarContainerProps> = ({ children }) => {
  const { currentDate, view, setCurrentDate } = useCalendar();
  const [isAnimating, setIsAnimating] = useState(false);
  const [swipeOffset, setSwipeOffset] = useState(0);
  const [swipeProgress, setSwipeProgress] = useState(0);
  const [slideDirection, setSlideDirection] = useState<SlideDirection>('none');
  const [nextViewContent, setNextViewContent] = useState<React.ReactNode>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Navigation functions (same as in CalendarHeader)
  const handlePrevious = useCallback(() => {
    if (view === 'month') {
      setCurrentDate(addMonths(currentDate, -1));
    } else if (view === 'week') {
      setCurrentDate(addDays(currentDate, -7));
    } else if (view === 'day') {
      setCurrentDate(addDays(currentDate, -1));
    }
  }, [currentDate, view, setCurrentDate]);

  const handleNext = useCallback(() => {
    if (view === 'month') {
      setCurrentDate(addMonths(currentDate, 1));
    } else if (view === 'week') {
      setCurrentDate(addDays(currentDate, 7));
    } else if (view === 'day') {
      setCurrentDate(addDays(currentDate, 1));
    }
  }, [currentDate, view, setCurrentDate]);

  const startSlideAnimation = useCallback((direction: 'left' | 'right') => {
    setIsAnimating(true);
    setSlideDirection(direction);
    setNextViewContent(children); // Store the current content as the "next" content
    
    // Trigger the date change after setting up the animation
    setTimeout(() => {
      if (direction === 'left') {
        handleNext();
      } else {
        handlePrevious();
      }
    }, 50); // Small delay to ensure animation setup
  }, [children, handleNext, handlePrevious]);

  // Set up swipe gesture
  const swipeGesture = useSwipeGesture({
    onSwipeLeft: () => {
      if (!isAnimating) {
        startSlideAnimation('left');
      }
    },
    onSwipeRight: () => {
      if (!isAnimating) {
        startSlideAnimation('right');
      }
    },
    onSwipeStart: () => {
      if (!isAnimating) {
        setSwipeOffset(0);
        setSwipeProgress(0);
      }
    },
    onSwipeMove: (deltaX, progress) => {
      if (!isAnimating) {
        setSwipeOffset(deltaX);
        setSwipeProgress(progress);
      }
    },
    onSwipeEnd: () => {
      if (!isAnimating) {
        setSwipeOffset(0);
        setSwipeProgress(0);
      }
    },
    threshold: 80, // Require 80px swipe to trigger navigation
    velocity: 0.3
  });

  // Apply ref from swipe gesture to container
  useEffect(() => {
    if (containerRef.current) {
      swipeGesture.ref.current = containerRef.current;
    }
  }, [swipeGesture.ref]);

  // Reset animation state after view change
  useEffect(() => {
    if (isAnimating) {
      const timer = setTimeout(() => {
        setIsAnimating(false);
        setSwipeOffset(0);
        setSwipeProgress(0);
        setSlideDirection('none');
        setNextViewContent(null);
      }, 300); // Match the transition duration
      return () => clearTimeout(timer);
    }
  }, [currentDate, isAnimating]);

  // Calculate transform styles for live swipe feedback
  const getLiveSwipeStyle = () => {
    if (isAnimating) {
      return {
        transform: 'translateX(0)',
        transition: 'none'
      };
    }
    
    if (swipeOffset !== 0) {
      // Apply some resistance as user approaches the threshold
      const resistance = Math.max(0.3, 1 - swipeProgress * 0.7);
      const adjustedOffset = swipeOffset * resistance;
      
      return {
        transform: `translateX(${adjustedOffset}px)`,
        transition: 'none'
      };
    }
    
    return {
      transform: 'translateX(0)',
      transition: 'none'
    };
  };

  // Calculate transform styles for slide animation
  const getSlideAnimationStyle = () => {
    if (!isAnimating || slideDirection === 'none') {
      return {
        transform: 'translateX(0)',
        transition: 'none'
      };
    }

    // Current view slides out in the swipe direction
    const toTransform = slideDirection === 'left' ? 'translateX(-100%)' : 'translateX(100%)';
    return {
      transform: toTransform,
      transition: '300ms cubic-bezier(0.4, 0, 0.2, 1)'
    };
  };

  return (
    <div className="relative overflow-hidden">
      {/* Current view */}
      <div
        ref={containerRef}
        className="relative"
        style={isAnimating ? getSlideAnimationStyle() : getLiveSwipeStyle()}
      >
        {!isAnimating || slideDirection === 'none' ? children : nextViewContent}
      </div>
      
      {/* Next view during animation */}
      {isAnimating && slideDirection !== 'none' && (
        <div
          className={`absolute inset-0 swipe-animation-${slideDirection === 'left' ? 'right' : 'left'}`}
        >
          {children}
        </div>
      )}
      
      {/* Visual feedback during swipe */}
      {swipeProgress > 0.2 && !isAnimating && (
        <div className="absolute inset-0 pointer-events-none">
          <div 
            className="absolute inset-y-0 flex items-center justify-center text-gray-400"
            style={{
              left: swipeOffset > 0 ? '20px' : 'auto',
              right: swipeOffset < 0 ? '20px' : 'auto',
              opacity: Math.min(swipeProgress, 0.8)
            }}
          >
            <div className="text-2xl">
              {swipeOffset > 0 ? '‹' : '›'}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SwipeableCalendarContainer;
