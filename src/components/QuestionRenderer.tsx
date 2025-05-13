
import React from 'react';
import { Question } from '@/types';
import SignInForm from './SignInForm';
import TextQuestion from './TextQuestion';
import ScaleQuestion from './ScaleQuestion';
import MultipleChoiceQuestion from './MultipleChoiceQuestion';
import Interlude from './Interlude';
import AudioMessage from './AudioMessage';
import VideoMessage from './VideoMessage';
import ThanksScreen from './ThanksScreen';

interface QuestionRendererProps {
  question: Question;
}

const QuestionRenderer: React.FC<QuestionRendererProps> = ({ question }) => {
  switch (question?.type) {
    case 'signin':
      return <SignInForm />;
    case 'text':
      return <TextQuestion questionId={question.id} />;
    case 'scale':
      return <ScaleQuestion questionId={question.id} />;
    case 'multipleChoice':
      return <MultipleChoiceQuestion questionId={question.id} />;
    case 'interlude':
      return <Interlude questionId={question.id} />;
    case 'audio':
      return <AudioMessage questionId={question.id} />;
    case 'video':
      return <VideoMessage questionId={question.id} />;
    case 'thanks':
      return <ThanksScreen questionId={question.id} />;
    default:
      return <div>Unknown question type</div>;
  }
};

export default QuestionRenderer;
