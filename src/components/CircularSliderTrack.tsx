
import React from 'react';

interface CircularSliderTrackProps {
  radius: number;
  rotation: number;
}

const CircularSliderTrack: React.FC<CircularSliderTrackProps> = ({
  radius,
  rotation
}) => {
  return (
    <>
      <circle 
        cx="150" 
        cy="150" 
        r={radius} 
        stroke="rgba(255,255,255,0.2)" 
        strokeWidth="4" 
        fill="none" 
      />
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
    </>
  );
};

export default CircularSliderTrack;
