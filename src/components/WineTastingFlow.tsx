
import React, { useEffect } from 'react';
import { useWineTasting } from '@/context/WineTastingContext';
import { questions } from '@/data/questions';
import ProgressIndicator from './ProgressIndicator';
import LoadingScreen from './LoadingScreen';
import { usePackageBottles } from '@/hooks/usePackageBottles';
import { useBottleQuestions } from '@/hooks/useBottleQuestions';
import QuestionRenderer from './QuestionRenderer';

const WineTastingFlow = () => {
  const { 
    currentQuestionIndex, 
    loading, 
    setLoading,
    setBottlesData,
    packageInfo 
  } = useWineTasting();
  
  // Use custom hooks to manage bottle data and questions
  const { 
    bottlesData, 
    loading: bottlesLoading 
  } = usePackageBottles(packageInfo);
  
  const { 
    dynamicQuestions, 
    isLoading: questionsLoading 
  } = useBottleQuestions(bottlesData);
  
  // Set the current question based on dynamic questions or fallback to default questions
  const currentQuestion = dynamicQuestions[currentQuestionIndex] || questions[currentQuestionIndex];
  
  // Log bottles data for debugging
  useEffect(() => {
    if (bottlesData && bottlesData.length > 0) {
      console.log('WineTastingFlow has access to bottles:', bottlesData);
      bottlesData.forEach((bottle, index) => {
        console.log(`Bottle ${index + 1}: ${bottle.Name}`, {
          // Log both naming conventions to help debug
          introQuestions: bottle.introQuestions || bottle["Intro Questions"],
          deepQuestions: bottle.deepQuestions || bottle["Deep Question"],
          finalQuestions: bottle.finalQuestions || bottle["Final Questions"]
        });
      });
      
      // Update the context with the bottles data
      setBottlesData(bottlesData);
    } else {
      console.log('No bottles data available in WineTastingFlow yet');
    }
  }, [bottlesData, setBottlesData]);
  
  // Show loading screen if any data is being loaded
  const isLoading = loading || bottlesLoading || questionsLoading;
  
  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-grow flex items-center justify-center">
        <QuestionRenderer question={currentQuestion} />
      </main>
      <footer className="mt-auto pb-6">
        <ProgressIndicator />
      </footer>
    </div>
  );
};

export default WineTastingFlow;
