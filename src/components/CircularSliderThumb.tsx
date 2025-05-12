
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
      className="circular-slider-thumb absolute w-12 h-12 rounded-full flex items-center justify-center cursor-grab active:cursor-grabbing z-10 transform -translate-x-1/2 -translate-y-1/2 touch-action-none" 
      style={{ 
        left: `${x}px`, 
        top: `${y}px`,
        background: `radial-gradient(circle, rgba(255,255,255,1) 0%, rgba(155,135,245,1) 75%)`,
        boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
        touchAction: 'none', // Ensure touch events don't trigger scrolling
      }}
      onMouseDown={onMouseDown}
      onTouchStart={onTouchStart}
    >
      {/* Inner target circle for better visual feedback */}
      <div className="w-4 h-4 rounded-full bg-white/80"></div>
    </div>
  );
};

export default CircularSliderThumb;
