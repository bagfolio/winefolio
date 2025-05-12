
import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { useWineTasting } from '@/context/WineTastingContext';
import { questions } from '@/data/questions';
import { ArrowLeft, ArrowRight, Play, Pause, Volume2, Wine } from 'lucide-react';
import { Card } from '@/components/ui/card';

interface AudioMessageProps {
  questionId: number;
}

const AudioMessage: React.FC<AudioMessageProps> = ({ questionId }) => {
  const { nextQuestion, previousQuestion } = useWineTasting();
  const question = questions.find(q => q.id === questionId);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const handlePlayPause = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center px-6 py-8 mx-auto min-h-[60vh]">
      <div className="w-full max-w-md">
        {/* Header with bottle icon */}
        <div className="flex justify-center mb-6">
          <div className="flex items-center gap-2">
            {question?.bottleNumber && (
              <div className="relative">
                <Wine size={28} className="text-purple-300" />
                <div className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-purple-500 flex items-center justify-center text-white text-xs font-bold">
                  {question.bottleNumber}
                </div>
              </div>
            )}
            <h2 className="text-2xl font-bold text-white">
              {question?.title || 'Sommelier Audio Message'}
            </h2>
          </div>
        </div>

        <Card className="bg-purple-900/40 border-purple-700/50 backdrop-blur-sm p-6 mb-6 rounded-xl">
          <div className="text-center mb-4">
            <Volume2 className="mx-auto mb-2 text-purple-300" size={36} />
            <p className="text-white/90 mb-1">
              {question?.sommelierName || 'Sommelier'} has left you an audio message
            </p>
            <p className="text-white/70 text-sm">
              {question?.description || 'Listen to hear special insights about this wine'}
            </p>
          </div>

          <div className="bg-black/30 rounded-lg p-3 flex items-center justify-between">
            <Button 
              onClick={handlePlayPause}
              size="icon"
              variant="ghost" 
              className="h-10 w-10 rounded-full bg-white/10 hover:bg-white/20 text-white"
            >
              {isPlaying ? <Pause size={20} /> : <Play size={20} />}
            </Button>
            <div className="flex-1 mx-3">
              <div className="h-1.5 bg-white/20 rounded-full overflow-hidden">
                <div className="h-full bg-purple-400 rounded-full" style={{ width: '0%' }}></div>
              </div>
            </div>
            <span className="text-xs text-white/60">00:00</span>
          </div>
          
          {/* Hidden audio element */}
          <audio 
            ref={audioRef} 
            src={question?.mediaUrl}
            onEnded={() => setIsPlaying(false)}
            className="hidden"
          />
        </Card>

        <div className="flex justify-between">
          <Button
            onClick={previousQuestion}
            className="flex items-center gap-2 bg-transparent hover:bg-purple-700/30 text-white"
          >
            <ArrowLeft size={16} />
            Previous
          </Button>
          
          <Button
            onClick={nextQuestion}
            className="flex items-center gap-2 bg-white hover:bg-gray-200 text-purple-900"
          >
            Continue
            <ArrowRight size={16} />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AudioMessage;
