
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useWineTasting } from '@/context/WineTastingContext';
import { questions } from '@/data/questions';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import WineFaq from './WineFaq';

interface TextQuestionProps {
  questionId: number;
}

const TextQuestion: React.FC<TextQuestionProps> = ({ questionId }) => {
  const { 
    wineTastingResponse, 
    setInitialThoughts, 
    setAdditionalThoughts, 
    nextQuestion,
    previousQuestion 
  } = useWineTasting();
  
  const question = questions.find(q => q.id === questionId);
  const [text, setText] = useState('');
  
  useEffect(() => {
    // Set initial text based on which question we're on
    if (questionId === 1) {
      setText(wineTastingResponse.initialThoughts);
    } else if (questionId === 6) {
      setText(wineTastingResponse.additionalThoughts);
    }
  }, [questionId, wineTastingResponse]);
  
  const handleNext = () => {
    if (questionId === 1) {
      setInitialThoughts(text);
    } else if (questionId === 6) {
      setAdditionalThoughts(text);
    }
    nextQuestion();
  };

  return (
    <div className="flex flex-col items-center justify-center px-6 py-8 mx-auto">
      <div className="w-full max-w-md">
        <div className="mb-4">
          <div className="inline-block bg-purple-900/70 rounded-full px-4 py-1 mb-4">
            <span className="text-sm text-white">Question {questionId}</span>
          </div>
          <h2 className="text-2xl font-bold text-white mb-4">
            {question?.question}
          </h2>
          <WineFaq currentQuestionId={questionId} />
        </div>
        
        <Textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Your answer"
          className="h-40 bg-purple-800/30 border-purple-700 text-white placeholder-purple-300"
        />
        
        <div className="flex justify-between mt-10">
          <Button
            onClick={previousQuestion}
            className="flex items-center gap-2 bg-transparent hover:bg-purple-800/30 text-white"
          >
            <ArrowLeft size={16} />
            Previous
          </Button>
          
          <Button
            onClick={handleNext}
            className="flex items-center gap-2 bg-white hover:bg-gray-200 text-purple-950"
            disabled={!text.trim()}
          >
            Next
            <ArrowRight size={16} />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default TextQuestion;
