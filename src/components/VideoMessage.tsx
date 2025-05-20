import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { useWineTasting } from '@/context/WineTastingContext';
import { ArrowLeft, ArrowRight, Play, Pause, Video, Wine } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { AspectRatio } from '@/components/ui/aspect-ratio';

interface VideoMessageProps {
  questionId: number;
}

const VideoMessage: React.FC<VideoMessageProps> = ({ questionId }) => {
  const { nextQuestion, previousQuestion, dynamicQuestions } = useWineTasting();
  const question = dynamicQuestions.find(q => q.id === questionId);
  const [isPlaying, setIsPlaying] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  const handlePlayPause = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center px-6 py-6 mx-auto min-h-[60vh]">
      <div className="w-full max-w-md">
        {/* Header with bottle icon */}
        <div className="flex justify-center mb-4">
          <div className="flex items-center gap-2">
            {question?.bottleNumber && (
              <div className="relative">
                <Wine size={24} className="text-purple-300" />
                <div className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-purple-500 flex items-center justify-center text-white text-xs font-bold">
                  {question.bottleNumber}
                </div>
              </div>
            )}
            <h2 className="text-xl font-semibold text-white">
              {question?.title || 'Sommelier Video Message'}
            </h2>
          </div>
        </div>

        <Card className="bg-purple-900/40 border-purple-700/30 backdrop-blur-sm p-4 mb-5 rounded-xl shadow-lg">
          <div className="text-center mb-3">
            <Video className="mx-auto mb-2 text-purple-300" size={28} />
            <p className="text-white/90 text-sm">
              {question?.sommelierName || 'Sommelier'} has a video message for you
            </p>
          </div>

          <AspectRatio ratio={16/9} className="bg-black/30 rounded-lg overflow-hidden relative mb-3">
            <video 
              ref={videoRef}
              className="w-full h-full object-cover"
              src={question?.mediaUrl}
              onEnded={() => setIsPlaying(false)}
            />
            {!isPlaying && (
              <Button 
                onClick={handlePlayPause}
                size="icon"
                variant="ghost" 
                className="absolute inset-0 m-auto h-14 w-14 rounded-full bg-white/20 hover:bg-white/30 text-white transition-all hover:scale-105"
              >
                <Play size={24} />
              </Button>
            )}
          </AspectRatio>
          
          <div className="flex items-center justify-center">
            <Button 
              onClick={handlePlayPause}
              variant="ghost" 
              className="bg-black/20 hover:bg-black/30 text-white px-4 py-2 rounded-full transition-colors"
            >
              {isPlaying ? (
                <>
                  <Pause size={16} className="mr-2" /> Pause
                </>
              ) : (
                <>
                  <Play size={16} className="mr-2" /> Play Video
                </>
              )}
            </Button>
          </div>
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

export default VideoMessage;
