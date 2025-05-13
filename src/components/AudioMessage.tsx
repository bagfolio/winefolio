
import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { useWineTasting } from '@/context/WineTastingContext';
import { questions } from '@/data/questions';
import { ArrowLeft, ArrowRight, Play, Pause, Volume2, Wine } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { useToast } from '@/components/ui/use-toast';

interface AudioMessageProps {
  questionId: number;
}

const AudioMessage: React.FC<AudioMessageProps> = ({ questionId }) => {
  const { nextQuestion, previousQuestion, sessionId, currentSession } = useWineTasting();
  const question = questions.find(q => q.id === questionId);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [mediaData, setMediaData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const fetchMediaData = async () => {
      if (!isSupabaseConfigured()) {
        setLoading(false);
        return;
      }
      
      if (sessionId && currentSession?.dbQuestionId) {
        try {
          setLoading(true);
          
          // First get the question media relationship
          const { data: questionMedia, error: questionMediaError } = await supabase
            .from('question_media')
            .select('media_id')
            .eq('question_id', currentSession.dbQuestionId)
            .single();
            
          if (questionMediaError) {
            throw new Error(`Error fetching question media: ${questionMediaError.message}`);
          }
          
          if (questionMedia?.media_id) {
            // Now get the actual media data
            const { data: media, error: mediaError } = await supabase
              .from('media')
              .select('*')
              .eq('id', questionMedia.media_id)
              .single();
              
            if (mediaError) {
              throw new Error(`Error fetching media: ${mediaError.message}`);
            }
            
            if (media) {
              setMediaData(media);
            }
          }
        } catch (error) {
          console.error("Error loading media:", error);
          toast({
            title: "Error",
            description: "Failed to load audio content",
            variant: "destructive"
          });
        } finally {
          setLoading(false);
        }
      } else {
        // Fallback to the hardcoded data if no session or question ID
        setLoading(false);
      }
    };
    
    fetchMediaData();
  }, [sessionId, currentSession, toast]);
  
  // Record that the user has listened to this audio
  useEffect(() => {
    const recordAudioInteraction = async () => {
      if (!isSupabaseConfigured()) return;
      
      if (sessionId && currentSession?.dbQuestionId) {
        try {
          const { error } = await supabase
            .from('user_responses')
            .upsert({
              user_id: 'demo-user',
              session_id: sessionId,
              question_id: currentSession.dbQuestionId,
              bottle_id: currentSession.dbBottleId || null,
              response_text: 'audio_accessed',
            }, { onConflict: 'user_id, session_id, question_id' });
              
          if (error) {
            console.error("Error recording audio interaction:", error);
          }
        } catch (error) {
          console.error("Error in recordAudioInteraction:", error);
        }
      }
    };
    
    recordAudioInteraction();
  }, [sessionId, currentSession]);

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

  // Use either database data or fallback to hardcoded data
  const title = mediaData?.title || question?.title || 'Sommelier Audio Message';
  const description = mediaData?.description || question?.description || 'Listen to hear special insights about this wine';
  const sommelierName = mediaData?.sommelier_name || question?.sommelierName || 'Sommelier';
  const audioUrl = mediaData?.media_url || question?.mediaUrl;

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
        <p className="text-white mt-4">Loading audio content...</p>
      </div>
    );
  }

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
              {title}
            </h2>
          </div>
        </div>

        <Card className="bg-purple-900/40 border-purple-700/50 backdrop-blur-sm p-6 mb-6 rounded-xl">
          <div className="text-center mb-4">
            <Volume2 className="mx-auto mb-2 text-purple-300" size={36} />
            <p className="text-white/90 mb-1">
              {sommelierName} has left you an audio message
            </p>
            <p className="text-white/70 text-sm">
              {description}
            </p>
          </div>

          <Button 
            onClick={handlePlayPause}
            size="lg"
            variant="secondary" 
            className="w-full flex items-center justify-center gap-2 mt-4 bg-white/10 hover:bg-white/20 text-white"
            disabled={!audioUrl}
          >
            {isPlaying ? (
              <>
                <Pause size={20} /> Pause Audio
              </>
            ) : (
              <>
                <Play size={20} /> Play Audio
              </>
            )}
          </Button>
          
          {/* Hidden audio element */}
          <audio 
            ref={audioRef} 
            src={audioUrl}
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
