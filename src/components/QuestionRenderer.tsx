
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
  onChange: (value: any) => void;
  value: any;
}

const QuestionRenderer: React.FC<QuestionRendererProps> = ({ question, onChange, value }) => {
  switch (question.type) {
    case 'signin':
      return <SignInForm />;
    case 'text':
      return <TextQuestion question={question} value={value} onChange={onChange} />;
    case 'scale':
      return <ScaleQuestion question={question} value={value} onChange={onChange} />;
    case 'multipleChoice':
      return <MultipleChoiceQuestion question={question} value={value} onChange={onChange} />;
    case 'interlude':
      return <Interlude questionId={question.id} />;
    case 'audio':
      return <AudioMessage questionId={question.id} />;
    case 'video':
      return <VideoMessage questionId={question.id} />;
    case 'thanks':
      return <ThanksScreen questionId={question.id} />;
    default:
      return (
        <div className="p-6">
          <p className="text-white text-lg mb-4">Unsupported question type: {question.type}</p>
          <p className="text-white">{question.question}</p>
        </div>
      );
  }
};

export default QuestionRenderer;
