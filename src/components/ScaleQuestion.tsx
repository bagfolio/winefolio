
import React from 'react';
import { Button } from '@/components/ui/button';
import { useWineTasting } from '@/context/WineTastingContext';
import { questions } from '@/data/questions';
import CircularSlider from './CircularSlider';
import { ArrowLeft, ArrowRight, Wine } from 'lucide-react';
import WineFaq from './WineFaq';

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
  const bottleNumber = question?.bottleNumber || 1;
  
  const getValue = () => {
    // Get rating for the current bottle
    if (questionId === 2 || questionId === 9) { // Overall rating questions
      return wineTastingResponse[bottleNumber]?.rating || 5;
    }
    if (questionId === 5 || questionId === 12) { // Acidity rating questions
      return wineTastingResponse[bottleNumber]?.acidityRating || 5;
    }
    return 5; // Default
  };
  
  const handleChange = (value: number) => {
    if (questionId === 2 || questionId === 9) { // Overall rating
      setRating(value, bottleNumber);
    } else if (questionId === 5 || questionId === 12) { // Acidity rating
      setAcidityRating(value, bottleNumber);
    }
  };
  
  return (
    <div className="flex flex-col items-center justify-center px-6 py-8 mx-auto">
      <div className="w-full max-w-md">
        <div className="mb-4">
          <div className="inline-block bg-purple-900/70 rounded-full px-4 py-1 mb-4">
            <span className="text-sm text-white">Question {questionId}</span>
          </div>
          
          {bottleNumber && (
            <div className="inline-flex items-center gap-2 bg-purple-700/70 rounded-full px-4 py-1 mb-4 ml-2">
              <Wine size={14} className="text-white" />
              <span className="text-sm text-white">Bottle {bottleNumber}</span>
            </div>
          )}
          
          <h2 className="text-2xl font-bold text-white mb-4">
            {question?.question}
          </h2>
          <WineFaq currentQuestionId={questionId} />
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
