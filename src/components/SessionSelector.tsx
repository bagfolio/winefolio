
import React, { useEffect, useState } from 'react';
import { useWineTasting } from '@/context/WineTastingContext';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Wine, ChevronRight } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

interface Session {
  id: number;
  name: string;
  description: string | null;
}

const SessionSelector: React.FC = () => {
  const { fetchSessions, setSessionId, nextQuestion } = useWineTasting();
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const loadSessions = async () => {
      try {
        setLoading(true);
        const data = await fetchSessions();
        setSessions(data);
      } catch (error) {
        console.error("Error loading sessions:", error);
        toast({
          title: "Error",
          description: "Failed to load available tasting sessions",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };

    loadSessions();
  }, [fetchSessions, toast]);

  const selectSession = (sessionId: number) => {
    setSessionId(sessionId);
    nextQuestion(); // Move to the next question after selecting a session
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
        <p className="text-white mt-4">Loading available wine tastings...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center px-6 py-8 mx-auto min-h-[60vh]">
      <div className="w-full max-w-md text-center">
        <h2 className="text-2xl font-bold text-white mb-6">
          Select a Wine Tasting Experience
        </h2>
        
        <p className="text-white/80 mb-8">
          Choose from the available tastings below to get started.
        </p>
        
        {sessions.length === 0 ? (
          <Card className="bg-purple-900/40 border-purple-700/50 backdrop-blur-sm p-6 mb-6">
            <p className="text-white">No wine tastings are currently available.</p>
          </Card>
        ) : (
          <div className="space-y-4">
            {sessions.map((session) => (
              <Card 
                key={session.id}
                className="bg-purple-900/40 border-purple-700/50 backdrop-blur-sm p-4 cursor-pointer hover:bg-purple-800/50 transition-colors"
                onClick={() => selectSession(session.id)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Wine size={24} className="text-purple-300" />
                    <div className="text-left">
                      <h3 className="font-medium text-white">{session.name}</h3>
                      {session.description && (
                        <p className="text-sm text-white/70">{session.description}</p>
                      )}
                    </div>
                  </div>
                  <ChevronRight size={20} className="text-purple-300" />
                </div>
              </Card>
            ))}
          </div>
        )}
        
        {sessions.length === 0 && (
          <Button
            onClick={() => window.location.reload()}
            className="mt-6 bg-white hover:bg-gray-200 text-purple-900"
          >
            Refresh
          </Button>
        )}
      </div>
    </div>
  );
};

export default SessionSelector;
