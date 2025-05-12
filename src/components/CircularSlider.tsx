
import React, { useState, useRef, useEffect } from 'react';
import { useCircularSliderDrag } from '@/hooks/useCircularSliderDrag';
import { valueToRotation } from '@/utils/sliderUtils';
import CircularSliderThumb from './CircularSliderThumb';
import CircularSliderTrack from './CircularSliderTrack';
import CircularSliderTicks from './CircularSliderTicks';

interface CircularSliderProps {
  value: number;
  onChange: (value: number) => void;
  min: number;
  max: number;
  step?: number;
}

const CircularSlider: React.FC<CircularSliderProps> = ({
  value,
  onChange,
  min,
  max,
  step = 1,
}) => {
  const sliderRef = useRef<HTMLDivElement>(null);
  const [rotation, setRotation] = useState(0);
  const sliderInstanceId = React.useMemo(() => 
    `circular-slider-${Math.random().toString(36).substring(2, 11)}`,
    []
  );
  
  // Update rotation whenever the value changes
  useEffect(() => {
    setRotation(valueToRotation(value, min, max));
  }, [value, min, max]);

  const { handleMouseDown, handleTouchStart } = useCircularSliderDrag({
    min,
    max,
    step,
    value,
    onChange,
    sliderRef
  });
  
  // Calculate thumb position
  const radius = 150 - 20; // subtract half of thumb size

  return (
    <div 
      className="circular-slider" 
      ref={sliderRef}
      id={sliderInstanceId}
    >
      <div className="circular-slider-bg">
        <svg width="300" height="300" viewBox="0 0 300 300">
          <CircularSliderTrack radius={radius} rotation={rotation} />
          <CircularSliderTicks min={min} max={max} radius={radius} />
        </svg>
      </div>
      
      <CircularSliderThumb 
        rotation={rotation} 
        radius={radius}
        onMouseDown={handleMouseDown}
        onTouchStart={handleTouchStart}
      />
      
      <div className="circular-slider-value">{value}/{max}</div>
      
      <div className="absolute bottom-[-40px] left-0 w-full flex justify-between text-white">
        <span>{min} = Yuck</span>
        <span>{max} = Amazing</span>
      </div>
    </div>
  );
};

export default CircularSlider;
