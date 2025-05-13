
import React, { useEffect } from 'react';
import { useWineTasting } from '@/context/WineTastingContext';
import { questions } from '@/data/questions';
import SignInForm from './SignInForm';
import TextQuestion from './TextQuestion';
import ScaleQuestion from './ScaleQuestion';
import MultipleChoiceQuestion from './MultipleChoiceQuestion';
import Interlude from './Interlude';
import ThanksScreen from './ThanksScreen';
import AudioMessage from './AudioMessage';
import VideoMessage from './VideoMessage';
import ProgressIndicator from './ProgressIndicator';
import LoadingScreen from './LoadingScreen';

const WineTastingFlow = () => {
  const { currentQuestionIndex, loading, bottlesData } = useWineTasting();
  const currentQuestion = questions[currentQuestionIndex];
  
  useEffect(() => {
    // Log bottles data for debugging
    if (bottlesData && bottlesData.length > 0) {
      console.log('WineTastingFlow has access to bottles:', bottlesData);
      bottlesData.forEach((bottle, index) => {
        console.log(`Bottle ${index + 1}: ${bottle.Name}`, {
          introQuestions: bottle.introQuestions,
          deepQuestions: bottle.deepQuestions,
          finalQuestions: bottle.finalQuestions
        });
      });
    } else {
      console.log('No bottles data available in WineTastingFlow');
    }
  }, [bottlesData]);

  const renderQuestionComponent = () => {
    switch (currentQuestion.type) {
      case 'signin':
        return <SignInForm />;
      case 'text':
        return <TextQuestion questionId={currentQuestion.id} />;
      case 'scale':
        return <ScaleQuestion questionId={currentQuestion.id} />;
      case 'multipleChoice':
        return <MultipleChoiceQuestion questionId={currentQuestion.id} />;
      case 'interlude':
        return <Interlude questionId={currentQuestion.id} />;
      case 'audio':
        return <AudioMessage questionId={currentQuestion.id} />;
      case 'video':
        return <VideoMessage questionId={currentQuestion.id} />;
      case 'thanks':
        return <ThanksScreen questionId={currentQuestion.id} />;
      default:
        return <div>Unknown question type</div>;
    }
  };

  // Show loading screen if loading is true
  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-grow flex items-center justify-center">
        {renderQuestionComponent()}
      </main>
      <footer className="mt-auto pb-6">
        <ProgressIndicator />
      </footer>
    </div>
  );
};

export default WineTastingFlow;
