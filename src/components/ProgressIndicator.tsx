import React from 'react';
import { useWineTasting } from '@/context/WineTastingContext';

interface ProgressIndicatorProps {
  questions?: any[];
}

const ProgressIndicator: React.FC<ProgressIndicatorProps> = ({ questions }) => {
  const context = useWineTasting();
  const currentQuestionIndex = context.currentQuestionIndex;
  const dynamicQuestions = questions || context.dynamicQuestions;
  const totalQuestions = dynamicQuestions.length;
  
  return (
    <div className="progress-dots">
      {dynamicQuestions.map((_, index) => (
        <div
          key={index}
          className={`progress-dot ${index <= currentQuestionIndex ? 'active' : ''}`}
        />
      ))}
    </div>
  );
};

export default ProgressIndicator;
