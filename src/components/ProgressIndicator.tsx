
import React from 'react';
import { questions } from '@/data/questions';
import { useWineTasting } from '@/context/WineTastingContext';

const ProgressIndicator = () => {
  const { currentQuestionIndex } = useWineTasting();
  const totalQuestions = questions.length;
  
  return (
    <div className="progress-dots">
      {questions.map((_, index) => (
        <div
          key={index}
          className={`progress-dot ${index <= currentQuestionIndex ? 'active' : ''}`}
        />
      ))}
    </div>
  );
};

export default ProgressIndicator;
