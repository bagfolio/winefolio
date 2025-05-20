import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { useWineTasting } from '@/context/WineTastingContext';
import CircularSlider from './CircularSlider';
import { ArrowLeft, ArrowRight, Wine } from 'lucide-react';
import WineFaq from './WineFaq';

interface ScaleQuestionProps {
  question: any;
  value: any;
  onChange: (val: any) => void;
}

const ScaleQuestion: React.FC<ScaleQuestionProps> = ({ question, value, onChange }) => {
  const { nextQuestion, previousQuestion } = useWineTasting();
  const bottleNumber = question?.bottleNumber || 1;

  const handleChange = (val: number) => {
    onChange(val);
  };

  return (
    <div className="flex flex-col items-center justify-center px-6 py-8 mx-auto">
      <div className="w-full max-w-md">
        <div className="mb-4">
          {bottleNumber && (
            <div className="inline-flex items-center gap-2 bg-purple-700/70 rounded-full px-4 py-1 mb-4 ml-2">
              <Wine size={14} className="text-white" />
              <span className="text-sm text-white">Bottle {bottleNumber}</span>
            </div>
          )}
          <h2 className="text-2xl font-bold text-white mb-4">
            {question?.title || question?.label || question?.question_text || question?.question}
          </h2>
          <WineFaq currentQuestionId={question?.id} />
        </div>
        <div className="my-6 py-4 relative">
          <CircularSlider 
            value={typeof value === 'number' ? value : 5}
            onChange={handleChange}
            min={0}
            max={10}
            step={1}
          />
        </div>
        <div className="flex justify-between mt-10">
          <Button
            onClick={previousQuestion}
            className="flex items-center gap-2 bg-transparent hover:bg-purple-800/30 text-white"
          >
            <ArrowLeft size={16} />
            Previous
          </Button>
          <Button
            onClick={nextQuestion}
            className="flex items-center gap-2 bg-white hover:bg-gray-200 text-purple-950"
          >
            Next
            <ArrowRight size={16} />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ScaleQuestion;
