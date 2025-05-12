
import React from 'react';
import { Button } from '@/components/ui/button';
import { useWineTasting } from '@/context/WineTastingContext';
import { questions } from '@/data/questions';
import { ArrowLeft, ArrowRight, Wine } from 'lucide-react';

interface InterludeProps {
  questionId: number;
}

const Interlude: React.FC<InterludeProps> = ({ questionId }) => {
  const { nextQuestion, previousQuestion } = useWineTasting();
  const question = questions.find(q => q.id === questionId);

  return (
    <div className="flex flex-col items-center justify-center px-6 py-8 mx-auto min-h-[60vh]">
      <div className="w-full max-w-md text-center">
        {/* Show bottle icon if this is a bottle-specific interlude */}
        {question?.bottleNumber && (
          <div className="mb-8 flex justify-center">
            <div className="relative">
              <Wine size={48} className="text-purple-300" />
              <div className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-purple-500 flex items-center justify-center text-white text-sm font-bold">
                {question.bottleNumber}
              </div>
            </div>
          </div>
        )}
        
        <h2 className="text-2xl font-bold text-white mb-6">
          {question?.question}
        </h2>
        
        {question?.description && (
          <p className="text-white/80 mb-8">
            {question.description}
          </p>
        )}
        
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
            Continue
            <ArrowRight size={16} />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Interlude;
