import React from 'react';
import { Button } from '@/components/ui/button';
import { useWineTasting } from '@/context/WineTastingContext';

interface DividerScreenProps {
  label: string;
}

const DividerScreen: React.FC<DividerScreenProps> = ({ label }) => {
  const { nextQuestion, previousQuestion } = useWineTasting();
  return (
    <div className="flex flex-col items-center justify-center px-6 py-8 mx-auto min-h-[60vh]">
      <div className="w-full max-w-md text-center">
        <h2 className="text-3xl font-bold text-white mb-8">{label}</h2>
        <div className="flex justify-between mt-10">
          <Button
            onClick={previousQuestion}
            className="flex items-center gap-2 bg-transparent hover:bg-purple-700/30 text-white"
          >
            Previous
          </Button>
          <Button
            onClick={nextQuestion}
            className="flex items-center gap-2 bg-white hover:bg-gray-200 text-purple-900"
          >
            Continue
          </Button>
        </div>
      </div>
    </div>
  );
};

export default DividerScreen; 