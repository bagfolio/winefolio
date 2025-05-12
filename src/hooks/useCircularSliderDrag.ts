
import { useRef, useEffect, useCallback } from 'react';
import { triggerHapticFeedback } from '@/utils/sliderUtils';

interface UseCircularSliderDragProps {
  min: number;
  max: number;
  step: number;
  value: number;
  onChange: (value: number) => void;
  sliderRef: React.RefObject<HTMLDivElement>;
}

export const useCircularSliderDrag = ({
  min,
  max,
  step,
  value,
  onChange,
  sliderRef
}: UseCircularSliderDragProps) => {
  const isDragging = useRef(false);
  
  // Make updateValueFromEvent a callback that will be stable across renders
  // but will always use the latest props
  const updateValueFromEvent = useCallback((clientX: number, clientY: number) => {
    if (!sliderRef.current) return;
    
    const rect = sliderRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    // Calculate angle
    const angle = Math.atan2(clientY - centerY, clientX - centerX);
    let degrees = angle * (180 / Math.PI) + 90; // +90 to start from top
    
    if (degrees < 0) {
      degrees += 360;
    }
    
    // Calculate new value based on rotation and round to step
    const range = max - min;
    let newVal = min + (degrees / 360) * range;
    newVal = Math.max(min, Math.min(max, newVal));
    let newValue = Math.round(newVal / step) * step;
    
    // Set the new value if it's different
    if (Math.abs(newValue - value) > 0.001) {
      triggerHapticFeedback();
      onChange(newValue);
    }
  }, [min, max, step, value, onChange, sliderRef]);
  
  // Create event handlers as callbacks to ensure they always use the latest version of updateValueFromEvent
  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (isDragging.current) {
      updateValueFromEvent(e.clientX, e.clientY);
    }
  }, [updateValueFromEvent]);
  
  const handleMouseUp = useCallback(() => {
    isDragging.current = false;
    document.removeEventListener('mousemove', handleMouseMove);
    document.removeEventListener('mouseup', handleMouseUp);
  }, [handleMouseMove]);
  
  const handleTouchMove = useCallback((e: TouchEvent) => {
    e.preventDefault(); // Prevent scrolling when sliding
    if (isDragging.current && e.touches[0]) {
      updateValueFromEvent(e.touches[0].clientX, e.touches[0].clientY);
    }
  }, [updateValueFromEvent]);
  
  const handleTouchEnd = useCallback(() => {
    isDragging.current = false;
    document.removeEventListener('touchmove', handleTouchMove);
    document.removeEventListener('touchend', handleTouchEnd);
  }, [handleTouchMove]);

  const handleMouseDown = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    isDragging.current = true;
    updateValueFromEvent(e.clientX, e.clientY);
    
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  }, [updateValueFromEvent, handleMouseMove, handleMouseUp]);
  
  const handleTouchStart = useCallback((e: React.TouchEvent<HTMLDivElement>) => {
    isDragging.current = true;
    if (e.touches[0]) {
      updateValueFromEvent(e.touches[0].clientX, e.touches[0].clientY);
    }
    
    document.addEventListener('touchmove', handleTouchMove, { passive: false });
    document.addEventListener('touchend', handleTouchEnd);
  }, [updateValueFromEvent, handleTouchMove, handleTouchEnd]);
  
  // Setup and cleanup event listeners
  useEffect(() => {
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleTouchEnd);
    };
  }, [handleMouseMove, handleMouseUp, handleTouchMove, handleTouchEnd]);
  
  return { handleMouseDown, handleTouchStart };
};
