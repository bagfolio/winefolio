
import React from 'react';
import { useWineTasting } from '@/context/WineTastingContext';
import { questions } from '@/data/questions';
import SignInForm from './SignInForm';
import TextQuestion from './TextQuestion';
import ScaleQuestion from './ScaleQuestion';
import MultipleChoiceQuestion from './MultipleChoiceQuestion';
import Interlude from './Interlude';
import ThanksScreen from './ThanksScreen';
import ProgressIndicator from './ProgressIndicator';
import LoadingScreen from './LoadingScreen';

const WineTastingFlow = () => {
  const { currentQuestionIndex, loading } = useWineTasting();
  const currentQuestion = questions[currentQuestionIndex];

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
