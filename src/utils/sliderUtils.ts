
/**
 * Utilities for circular slider calculations
 */

/**
 * Converts a value to rotation degrees (0-360)
 */
export const valueToRotation = (value: number, min: number, max: number): number => {
  return ((value - min) / (max - min)) * 360;
};

/**
 * Calculates the thumb position based on rotation
 */
export const calculateThumbPosition = (rotation: number, radius: number): { x: number, y: number } => {
  const theta = ((rotation - 90) * Math.PI) / 180; // convert to radians and adjust to start from top
  const x = 150 + radius * Math.cos(theta);
  const y = 150 + radius * Math.sin(theta);
  
  return { x, y };
};

/**
 * Calculates tick positions for the slider
 */
export const calculateTicks = (min: number, max: number, radius: number) => {
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
    
    ticks.push({
      key: i,
      x1: tickX1,
      y1: tickY1,
      x2: tickX2,
      y2: tickY2,
      isLarge: i % 5 === 0
    });
  }
  
  return ticks;
};

/**
 * Triggers haptic feedback if available
 */
export const triggerHapticFeedback = () => {
  if (navigator.vibrate) {
    navigator.vibrate(10); // 10ms vibration
  }
};
