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
    case 'multiple_choice':
      return <MultipleChoiceQuestion question={question} value={value} onChange={onChange} />;
    case 'interlude':
      return <Interlude questionId={question.id} />;
    case 'audio':
      return <AudioMessage questionId={question.id} />;
    case 'video':
      return <VideoMessage questionId={question.id} />;
    case 'thanks':
      return <ThanksScreen questionId={question.id} />;
    case '1-10 sliding scale':
      return (
        <div>
          <p>{question.question}</p>
          <input
            type="range"
            min={1}
            max={10}
            value={value || 5}
            onChange={e => onChange(Number(e.target.value))}
          />
          <span>{value || 5}</span>
        </div>
      );
    default:
      return (
        <div>
          <p>{question.question}</p>
          <textarea
            value={value || ''}
            onChange={e => onChange(e.target.value)}
            rows={3}
            style={{ width: '100%' }}
          />
        </div>
      );
  }
};

export default QuestionRenderer;
