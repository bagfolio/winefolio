
import { useRef, useEffect, useCallback, useState } from 'react';
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
  const [lastValue, setLastValue] = useState<number>(value);
  
  // Update lastValue when value prop changes
  useEffect(() => {
    setLastValue(value);
  }, [value]);
  
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
    if (Math.abs(newValue - lastValue) > 0.001) {
      triggerHapticFeedback();
      setLastValue(newValue);
      onChange(newValue);
    }
  }, [min, max, step, lastValue, onChange, sliderRef]);
  
  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (isDragging.current) {
      e.preventDefault();
      updateValueFromEvent(e.clientX, e.clientY);
    }
  }, [updateValueFromEvent]);
  
  const handleMouseUp = useCallback(() => {
    if (isDragging.current) {
      isDragging.current = false;
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    }
  }, [handleMouseMove]);
  
  const handleTouchMove = useCallback((e: TouchEvent) => {
    if (isDragging.current && e.touches[0]) {
      e.preventDefault(); // Prevent scrolling when sliding
      updateValueFromEvent(e.touches[0].clientX, e.touches[0].clientY);
    }
  }, [updateValueFromEvent]);
  
  const handleTouchEnd = useCallback(() => {
    if (isDragging.current) {
      isDragging.current = false;
      document.removeEventListener('touchmove', handleTouchMove, { capture: true } as EventListenerOptions);
      document.removeEventListener('touchend', handleTouchEnd);
      document.removeEventListener('touchcancel', handleTouchEnd);
    }
  }, [handleTouchMove]);

  const handleMouseDown = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    e.preventDefault();
    isDragging.current = true;
    updateValueFromEvent(e.clientX, e.clientY);
    
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  }, [updateValueFromEvent, handleMouseMove, handleMouseUp]);
  
  const handleTouchStart = useCallback((e: React.TouchEvent<HTMLDivElement>) => {
    e.preventDefault();
    isDragging.current = true;
    if (e.touches[0]) {
      updateValueFromEvent(e.touches[0].clientX, e.touches[0].clientY);
    }
    
    document.addEventListener('touchmove', handleTouchMove, { passive: false, capture: true });
    document.addEventListener('touchend', handleTouchEnd);
    document.addEventListener('touchcancel', handleTouchEnd);
  }, [updateValueFromEvent, handleTouchMove, handleTouchEnd]);
  
  // Setup and cleanup event listeners
  useEffect(() => {
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('touchmove', handleTouchMove, { capture: true } as EventListenerOptions);
      document.removeEventListener('touchend', handleTouchEnd);
      document.removeEventListener('touchcancel', handleTouchEnd);
    };
  }, [handleMouseMove, handleMouseUp, handleTouchMove, handleTouchEnd]);
  
  return { handleMouseDown, handleTouchStart };
};
