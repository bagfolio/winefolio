
import React from 'react';
import { Button } from '@/components/ui/button';
import { useWineTasting } from '@/context/WineTastingContext';
import { questions } from '@/data/questions';
import CircularSlider from './CircularSlider';
import { ArrowLeft, ArrowRight } from 'lucide-react';

interface ScaleQuestionProps {
  questionId: number;
}

const ScaleQuestion: React.FC<ScaleQuestionProps> = ({ questionId }) => {
  const { 
    wineTastingResponse, 
    setRating, 
    setAcidityRating, 
    nextQuestion, 
    previousQuestion 
  } = useWineTasting();
  
  const question = questions.find(q => q.id === questionId);
  
  const getValue = () => {
    if (questionId === 2) return wineTastingResponse.rating;
    if (questionId === 5) return wineTastingResponse.acidityRating;
    return 5; // Default
  };
  
  const handleChange = (value: number) => {
    if (questionId === 2) {
      setRating(value);
    } else if (questionId === 5) {
      setAcidityRating(value);
    }
  };
  
  return (
    <div className="flex flex-col items-center justify-center px-6 py-8 mx-auto">
      <div className="w-full max-w-md">
        <div className="mb-6">
          <div className="inline-block bg-purple-800/70 rounded-full px-4 py-1 mb-6">
            <span className="text-sm text-white">Question {questionId}</span>
          </div>
          <h2 className="text-2xl font-bold text-white mb-8">
            {question?.question}
          </h2>
        </div>
        
        <div className="my-6 py-4 relative">
          <CircularSlider 
            value={getValue()} 
            onChange={handleChange}
            min={0}
            max={10}
            step={1}
          />
        </div>
        
        <div className="flex justify-between mt-10">
          <Button
            onClick={previousQuestion}
            className="flex items-center gap-2 bg-transparent hover:bg-purple-700/30 text-white"
          >
            <ArrowLeft size={16} />
            Previous
          </Button>
          
          <Button
            onClick={nextQuestion}
            className="flex items-center gap-2 bg-white hover:bg-gray-200 text-purple-900"
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
