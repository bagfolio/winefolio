
import React from 'react';
import { calculateThumbPosition } from '@/utils/sliderUtils';

interface CircularSliderThumbProps {
  rotation: number;
  radius: number;
  onMouseDown: (e: React.MouseEvent<HTMLDivElement>) => void;
  onTouchStart: (e: React.TouchEvent<HTMLDivElement>) => void;
}

const CircularSliderThumb: React.FC<CircularSliderThumbProps> = ({
  rotation,
  radius,
  onMouseDown,
  onTouchStart
}) => {
  const { x, y } = calculateThumbPosition(rotation, radius);
  
  return (
    <div 
      className="circular-slider-thumb absolute w-10 h-10 rounded-full flex items-center justify-center cursor-grab active:cursor-grabbing z-10 transform -translate-x-1/2 -translate-y-1/2 touch-action-none" 
      style={{ 
        left: `${x}px`, 
        top: `${y}px`,
        background: `radial-gradient(circle, rgba(255,255,255,1) 0%, rgba(155,135,245,1) 75%)`
      }}
      onMouseDown={onMouseDown}
      onTouchStart={onTouchStart}
    ></div>
  );
};

export default CircularSliderThumb;
