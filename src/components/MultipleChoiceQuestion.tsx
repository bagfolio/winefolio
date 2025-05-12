
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { useWineTasting } from '@/context/WineTastingContext';
import { questions } from '@/data/questions';
import { ArrowLeft, ArrowRight } from 'lucide-react';

interface MultipleChoiceQuestionProps {
  questionId: number;
}

const MultipleChoiceQuestion: React.FC<MultipleChoiceQuestionProps> = ({ questionId }) => {
  const { wineTastingResponse, setFruitFlavors, nextQuestion, previousQuestion } = useWineTasting();
  const question = questions.find(q => q.id === questionId);
  const [selectedOptions, setSelectedOptions] = useState<string[]>([]);
  
  useEffect(() => {
    setSelectedOptions(wineTastingResponse.fruitFlavors);
  }, [wineTastingResponse.fruitFlavors]);
  
  const handleOptionChange = (option: string) => {
    setSelectedOptions(prev => {
      if (prev.includes(option)) {
        return prev.filter(item => item !== option);
      } else {
        return [...prev, option];
      }
    });
  };
  
  const handleNext = () => {
    setFruitFlavors(selectedOptions);
    nextQuestion();
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
        
        <div className="space-y-4">
          {question?.options?.map((option) => (
            <div 
              key={option}
              className={`p-4 rounded-lg cursor-pointer transition-all ${
                selectedOptions.includes(option)
                  ? 'bg-white text-purple-900'
                  : 'bg-purple-800/30 text-white hover:bg-purple-700/40'
              }`}
              onClick={() => handleOptionChange(option)}
            >
              <div className="flex items-center space-x-3">
                <Checkbox
                  id={option}
                  checked={selectedOptions.includes(option)}
                  className={
                    selectedOptions.includes(option)
                      ? 'border-purple-900 data-[state=checked]:bg-purple-900'
                      : 'border-white'
                  }
                />
                <label
                  htmlFor={option}
                  className="cursor-pointer font-medium flex-grow"
                >
                  {option}
                </label>
              </div>
            </div>
          ))}
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
            onClick={handleNext}
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

export default MultipleChoiceQuestion;
