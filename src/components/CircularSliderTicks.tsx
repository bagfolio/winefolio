
import React from 'react';
import { calculateTicks } from '@/utils/sliderUtils';

interface CircularSliderTicksProps {
  min: number;
  max: number;
  radius: number;
}

const CircularSliderTicks: React.FC<CircularSliderTicksProps> = ({
  min,
  max,
  radius
}) => {
  const ticks = calculateTicks(min, max, radius);
  
  return (
    <>
      {ticks.map(tick => (
        <line
          key={tick.key}
          x1={tick.x1}
          y1={tick.y1}
          x2={tick.x2}
          y2={tick.y2}
          stroke="rgba(255,255,255,0.5)"
          strokeWidth={tick.isLarge ? "2" : "1"}
        />
      ))}
    </>
  );
};

export default CircularSliderTicks;
