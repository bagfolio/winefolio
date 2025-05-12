
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
  const [rotation, setRotation] = useState(valueToRotation(value, min, max));
  const sliderInstanceId = React.useMemo(() => 
    `circular-slider-${Math.random().toString(36).substring(2, 11)}`,
    []
  );
  
  // Update rotation whenever the value changes
  useEffect(() => {
    setRotation(valueToRotation(value, min, max));
  }, [value, min, max]);

  // Pass a stable reference for the value that will be passed to the drag hook
  const { handleMouseDown, handleTouchStart, handleTrackInteraction } = useCircularSliderDrag({
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
      className="circular-slider relative"
      ref={sliderRef}
      id={sliderInstanceId}
      data-value={value}
    >
      <div 
        className="circular-slider-bg cursor-pointer" 
        onClick={handleTrackInteraction}
        onTouchStart={handleTrackInteraction}
      >
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
      
      <div className="circular-slider-value absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-white text-xl font-bold">
        {value}/{max}
      </div>
      
      <div className="absolute bottom-[-40px] left-0 w-full flex justify-between text-white">
        <span>{min} = Yuck</span>
        <span>{max} = Amazing</span>
      </div>
    </div>
  );
};

export default CircularSlider;
