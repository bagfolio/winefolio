
import React, { useState, useRef, useEffect } from 'react';

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
  const isDragging = useRef(false);
  const [rotation, setRotation] = useState(0);
  
  useEffect(() => {
    // Convert value to rotation (0-360 degrees)
    const newRotation = ((value - min) / (max - min)) * 360;
    setRotation(newRotation);
  }, [value, min, max]);

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    isDragging.current = true;
    handleMouseMove(e);
    
    document.addEventListener('mousemove', handleMouseMoveDocument);
    document.addEventListener('mouseup', handleMouseUp);
  };
  
  const handleMouseMoveDocument = (e: MouseEvent) => {
    if (isDragging.current && sliderRef.current) {
      const rect = sliderRef.current.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      
      const mouseX = e.clientX;
      const mouseY = e.clientY;
      
      // Calculate angle
      const angle = Math.atan2(mouseY - centerY, mouseX - centerX);
      let degrees = angle * (180 / Math.PI) + 90; // +90 to start from top
      
      if (degrees < 0) {
        degrees += 360;
      }
      
      // Keep rotation within 0-360
      let newRotation = degrees % 360;
      
      // Calculate new value based on rotation
      const range = max - min;
      let newValue = Math.round((newRotation / 360) * range / step) * step + min;
      
      // Ensure value is within bounds
      newValue = Math.max(min, Math.min(max, newValue));
      
      onChange(newValue);
    }
  };
  
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (isDragging.current && sliderRef.current) {
      const rect = sliderRef.current.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      
      // Calculate angle
      const angle = Math.atan2(e.clientY - centerY, e.clientX - centerX);
      let degrees = angle * (180 / Math.PI) + 90; // +90 to start from top
      
      if (degrees < 0) {
        degrees += 360;
      }
      
      // Calculate new value based on rotation
      const range = max - min;
      const newValue = Math.round((degrees / 360) * range / step) * step + min;
      
      onChange(Math.max(min, Math.min(max, newValue)));
    }
  };
  
  const handleMouseUp = () => {
    isDragging.current = false;
    document.removeEventListener('mousemove', handleMouseMoveDocument);
    document.removeEventListener('mouseup', handleMouseUp);
  };

  // Calculate thumb position
  const radius = 150 - 20; // subtract half of thumb size
  const theta = ((rotation - 90) * Math.PI) / 180; // convert to radians and adjust to start from top
  const thumbX = 150 + radius * Math.cos(theta);
  const thumbY = 150 + radius * Math.sin(theta);
  
  // Calculate fill percentage for the thumb
  const fillPercentage = ((value - min) / (max - min)) * 100;

  // Calculate tick positions
  const ticks = [];
  const tickCount = max - min + 1;
  for (let i = 0; i < tickCount; i++) {
    const tickRotation = (i / (tickCount - 1)) * 360;
    const tickTheta = ((tickRotation - 90) * Math.PI) / 180;
    const innerRadius = radius - 10;
    const outerRadius = radius + 5;
    const tickX1 = 150 + innerRadius * Math.cos(tickTheta);
    const tickY1 = 150 + innerRadius * Math.sin(tickTheta);
    const tickX2 = 150 + outerRadius * Math.cos(tickTheta);
    const tickY2 = 150 + outerRadius * Math.sin(tickTheta);
    
    ticks.push(
      <line
        key={i}
        x1={tickX1}
        y1={tickY1}
        x2={tickX2}
        y2={tickY2}
        stroke="rgba(255,255,255,0.5)"
        strokeWidth={i % 5 === 0 ? "2" : "1"}
      />
    );
  }

  return (
    <div 
      className="circular-slider" 
      ref={sliderRef}
    >
      <div className="circular-slider-bg">
        <svg width="300" height="300" viewBox="0 0 300 300">
          <circle cx="150" cy="150" r={radius} stroke="rgba(255,255,255,0.2)" strokeWidth="4" fill="none" />
          {ticks}
          <circle 
            cx="150" 
            cy="150" 
            r={radius} 
            stroke="white" 
            strokeWidth="4" 
            fill="none"
            strokeDasharray={`${(rotation / 360) * (2 * Math.PI * radius)} ${2 * Math.PI * radius}`}
            transform="rotate(-90, 150, 150)"
          />
        </svg>
      </div>
      <div 
        className="circular-slider-thumb" 
        style={{ 
          left: `${thumbX}px`, 
          top: `${thumbY}px`,
          background: `radial-gradient(circle, rgba(255,255,255,1) ${100 - fillPercentage}%, rgba(155,135,245,1) ${100 - fillPercentage}%)`
        }}
        onMouseDown={handleMouseDown}
      ></div>
      <div className="circular-slider-value">{value}/{max}</div>
      
      <div className="absolute bottom-[-40px] left-0 w-full flex justify-between text-white">
        <span>{min} = Yuck</span>
        <span>{max} = Amazing</span>
      </div>
    </div>
  );
};

export default CircularSlider;
