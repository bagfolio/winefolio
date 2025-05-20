import React from 'react';
import { Button } from '@/components/ui/button';
import { useWineTasting } from '@/context/WineTastingContext';
import { ArrowLeft, ArrowRight, Wine } from 'lucide-react';
import WineFaq from './WineFaq';

interface MultipleChoiceQuestionProps {
  question: any;
  value: any;
  onChange: (val: any) => void;
}

const MultipleChoiceQuestion: React.FC<MultipleChoiceQuestionProps> = ({ question, value, onChange }) => {
  const { nextQuestion, previousQuestion } = useWineTasting();
  const bottleNumber = question?.bottleNumber || 1;
  const options = question?.options || [];

  const isSelected = (option: string) => {
    return Array.isArray(value) && value.includes(option);
  };

  const toggleOption = (option: string) => {
    let newValue = Array.isArray(value) ? [...value] : [];
    if (isSelected(option)) {
      newValue = newValue.filter((item) => item !== option);
    } else {
      newValue.push(option);
    }
    onChange(newValue);
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
        <div className="space-y-3 my-6">
          {options.map((option: string, index: number) => (
            <button
              key={index}
              onClick={() => toggleOption(option)}
              className={`w-full text-left p-4 rounded-lg transition-all ${
                isSelected(option)
                  ? 'bg-purple-600 text-white border-2 border-white'
                  : 'bg-purple-800/40 text-white hover:bg-purple-700/50 border-2 border-transparent'
              }`}
            >
              {option}
            </button>
          ))}
        </div>
        <div className="flex justify-between mt-8">
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
            disabled={!(Array.isArray(value) && value.length > 0)}
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
