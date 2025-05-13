
import React, { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { useWineTasting } from '@/context/WineTastingContext';
import { questions } from '@/data/questions';
import { ArrowLeft, ArrowRight, Wine } from 'lucide-react';
import WineFaq from './WineFaq';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/components/ui/use-toast';

interface MultipleChoiceQuestionProps {
  questionId: number;
}

const MultipleChoiceQuestion: React.FC<MultipleChoiceQuestionProps> = ({ questionId }) => {
  const { 
    wineTastingResponse, 
    setFruitFlavors, 
    nextQuestion, 
    previousQuestion,
    sessionId,
    currentSession
  } = useWineTasting();
  
  const { toast } = useToast();
  const question = questions.find(q => q.id === questionId);
  const bottleNumber = question?.bottleNumber || 1;
  const options = question?.options || [];
  
  const isSelected = (option: string) => {
    return wineTastingResponse[bottleNumber]?.fruitFlavors?.includes(option) || false;
  };
  
  const toggleOption = async (option: string) => {
    const currentFlavors = wineTastingResponse[bottleNumber]?.fruitFlavors || [];
    let newFlavors;
    
    if (isSelected(option)) {
      newFlavors = currentFlavors.filter(item => item !== option);
    } else {
      newFlavors = [...currentFlavors, option];
    }
    
    // Update local state
    setFruitFlavors(newFlavors, bottleNumber);
    
    // If connected to Supabase and we have a session ID, store the response
    if (sessionId && currentSession?.dbQuestionId) {
      const { error } = await supabase
        .from('user_responses')
        .upsert({
          user_id: (await supabase.auth.getUser()).data.user?.id || '',
          session_id: sessionId,
          question_id: currentSession.dbQuestionId,
          bottle_id: currentSession.dbBottleId || null,
          selected_options: newFlavors,
        }, { onConflict: 'user_id, session_id, question_id' });
        
      if (error) {
        toast({
          title: "Error saving response",
          description: "Your selection couldn't be saved to the database.",
          variant: "destructive"
        });
        console.error("Error saving response:", error);
      }
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
        
        <div className="space-y-3 my-6">
          {options.map((option, index) => (
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
            disabled={!(wineTastingResponse[bottleNumber]?.fruitFlavors?.length > 0)}
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
