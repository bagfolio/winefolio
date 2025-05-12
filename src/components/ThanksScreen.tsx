
import React, { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { useWineTasting } from '@/context/WineTastingContext';
import { questions } from '@/data/questions';
import { ArrowLeft, Check, Wine } from 'lucide-react';

interface ThanksScreenProps {
  questionId: number;
}

const ThanksScreen: React.FC<ThanksScreenProps> = ({ questionId }) => {
  const { previousQuestion, submitResponses, wineTastingResponse } = useWineTasting();
  const question = questions.find(q => q.id === questionId);

  // Submit responses when this screen loads
  useEffect(() => {
    submitResponses();
  }, [submitResponses]);

  return (
    <div className="flex flex-col items-center justify-center px-6 py-8 mx-auto min-h-[60vh]">
      <div className="w-full max-w-md text-center">
        <div className="mb-6 flex justify-center">
          <div className="h-20 w-20 rounded-full bg-green-500 flex items-center justify-center">
            <Check size={40} className="text-white" />
          </div>
        </div>
        
        <h2 className="text-2xl font-bold text-white mb-4">
          {question?.question}
        </h2>
        
        <p className="text-white/80 mb-8">
          A sommelier will review your tasting notes and provide personalized feedback.
        </p>
        
        <div className="flex flex-col items-center gap-4 mt-8 mb-10 px-6">
          <div className="inline-flex items-center gap-3">
            <Wine size={20} className="text-purple-300" />
            <span className="font-semibold text-white">Wine 1: Pinot Noir</span>
          </div>
          
          <div className="w-full h-px bg-purple-700/50 my-2"></div>
          
          <div className="inline-flex items-center gap-3">
            <Wine size={20} className="text-purple-300" />
            <span className="font-semibold text-white">Wine 2: Chardonnay</span>
          </div>
        </div>
        
        <div className="flex justify-center mt-10">
          <Button
            onClick={previousQuestion}
            className="flex items-center gap-2 bg-transparent hover:bg-purple-700/30 text-white"
          >
            <ArrowLeft size={16} />
            Back to Previous
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ThanksScreen;
