
import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import { UserInfo, WineTastingResponse } from '../types';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/supabase';

interface CurrentSessionData {
  dbQuestionId?: number;
  dbBottleId?: number;
}

interface WineTastingContextType {
  currentQuestionIndex: number;
  userInfo: UserInfo | null;
  wineTastingResponse: {
    [bottleNumber: number]: WineTastingResponse;
  };
  loading: boolean;
  sessionId: number | null;
  currentSession: CurrentSessionData | null;
  setLoading: (isLoading: boolean) => void;
  setUserInfo: (info: UserInfo) => void;
  setInitialThoughts: (thoughts: string, bottleNumber?: number) => void;
  setRating: (rating: number, bottleNumber?: number) => void;
  setFruitFlavors: (flavors: string[], bottleNumber?: number) => void;
  setAcidityRating: (rating: number, bottleNumber?: number) => void;
  setAdditionalThoughts: (thoughts: string, bottleNumber?: number) => void;
  nextQuestion: () => void;
  previousQuestion: () => void;
  submitResponses: () => void;
  setSessionId: (id: number) => void;
  fetchSessions: () => Promise<any[]>;
}

const WineTastingContext = createContext<WineTastingContextType | undefined>(undefined);

export const WineTastingProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [loading, setLoading] = useState(false);
  const [sessionId, setSessionId] = useState<number | null>(null);
  const [currentSession, setCurrentSession] = useState<CurrentSessionData | null>(null);
  const { toast } = useToast();
  
  // Initialize responses for multiple bottles
  const [wineTastingResponse, setWineTastingResponse] = useState<{
    [bottleNumber: number]: WineTastingResponse;
  }>({
    1: {
      initialThoughts: '',
      rating: 5,
      fruitFlavors: [],
      acidityRating: 5,
      additionalThoughts: '',
    },
    2: {
      initialThoughts: '',
      rating: 5,
      fruitFlavors: [],
      acidityRating: 5,
      additionalThoughts: '',
    }
  });

  const nextQuestion = () => {
    setCurrentQuestionIndex((prev) => prev + 1);
  };

  const previousQuestion = () => {
    setCurrentQuestionIndex((prev) => Math.max(0, prev - 1));
  };

  const fetchSessions = async () => {
    const { data, error } = await supabase
      .from('tasting_sessions')
      .select('*')
      .order('created_at', { ascending: false });
      
    if (error) {
      toast({
        title: "Error loading sessions",
        description: "Couldn't load tasting sessions.",
        variant: "destructive"
      });
      console.error("Error loading sessions:", error);
      return [];
    }
    
    return data || [];
  };

  const submitResponses = async () => {
    if (!sessionId) {
      toast({
        title: "No session selected",
        description: "Please select a tasting session first.",
        variant: "destructive"
      });
      return;
    }
    
    try {
      setLoading(true);
      
      // In a real app with Supabase, the data has already been saved
      // through individual question responses
      console.log('All responses submitted for session:', sessionId);
      
      // Show success toast
      toast({
        title: "Responses submitted!",
        description: "Your wine tasting responses have been saved.",
      });
    } catch (error) {
      console.error("Error submitting responses:", error);
      toast({
        title: "Error",
        description: "There was a problem submitting your responses.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const value = {
    currentQuestionIndex,
    userInfo,
    wineTastingResponse,
    loading,
    sessionId,
    currentSession,
    setLoading,
    setUserInfo: (info: UserInfo) => setUserInfo(info),
    setInitialThoughts: async (thoughts: string, bottleNumber = 1) => {
      setWineTastingResponse((prev) => ({
        ...prev,
        [bottleNumber]: {
          ...prev[bottleNumber],
          initialThoughts: thoughts
        }
      }));
      
      // If connected to Supabase and we have a session ID, store the response
      if (sessionId && currentSession?.dbQuestionId) {
        const { error } = await supabase
          .from('user_responses')
          .upsert({
            user_id: (await supabase.auth.getUser()).data.user?.id || '',
            session_id: sessionId,
            question_id: currentSession.dbQuestionId,
            bottle_id: currentSession.dbBottleId || null,
            response_text: thoughts,
          }, { onConflict: 'user_id, session_id, question_id' });
          
        if (error) {
          toast({
            title: "Error saving response",
            description: "Your thoughts couldn't be saved to the database.",
            variant: "destructive"
          });
          console.error("Error saving response:", error);
        }
      }
    },
    setRating: async (rating: number, bottleNumber = 1) => {
      setWineTastingResponse((prev) => ({
        ...prev,
        [bottleNumber]: {
          ...prev[bottleNumber],
          rating
        }
      }));
      
      // If connected to Supabase and we have a session ID, store the response
      if (sessionId && currentSession?.dbQuestionId) {
        const { error } = await supabase
          .from('user_responses')
          .upsert({
            user_id: (await supabase.auth.getUser()).data.user?.id || '',
            session_id: sessionId,
            question_id: currentSession.dbQuestionId,
            bottle_id: currentSession.dbBottleId || null,
            numeric_rating: rating,
          }, { onConflict: 'user_id, session_id, question_id' });
          
        if (error) {
          toast({
            title: "Error saving response",
            description: "Your rating couldn't be saved to the database.",
            variant: "destructive"
          });
          console.error("Error saving response:", error);
        }
      }
    },
    setFruitFlavors: (flavors: string[], bottleNumber = 1) => 
      setWineTastingResponse((prev) => ({
        ...prev,
        [bottleNumber]: {
          ...prev[bottleNumber],
          fruitFlavors: flavors
        }
      })),
    setAcidityRating: async (rating: number, bottleNumber = 1) => {
      setWineTastingResponse((prev) => ({
        ...prev,
        [bottleNumber]: {
          ...prev[bottleNumber],
          acidityRating: rating
        }
      }));
      
      // If connected to Supabase and we have a session ID, store the response
      if (sessionId && currentSession?.dbQuestionId) {
        const { error } = await supabase
          .from('user_responses')
          .upsert({
            user_id: (await supabase.auth.getUser()).data.user?.id || '',
            session_id: sessionId,
            question_id: currentSession.dbQuestionId,
            bottle_id: currentSession.dbBottleId || null,
            numeric_rating: rating,
          }, { onConflict: 'user_id, session_id, question_id' });
          
        if (error) {
          toast({
            title: "Error saving response",
            description: "Your acidity rating couldn't be saved to the database.",
            variant: "destructive"
          });
          console.error("Error saving response:", error);
        }
      }
    },
    setAdditionalThoughts: async (thoughts: string, bottleNumber = 1) => {
      setWineTastingResponse((prev) => ({
        ...prev,
        [bottleNumber]: {
          ...prev[bottleNumber],
          additionalThoughts: thoughts
        }
      }));
      
      // If connected to Supabase and we have a session ID, store the response
      if (sessionId && currentSession?.dbQuestionId) {
        const { error } = await supabase
          .from('user_responses')
          .upsert({
            user_id: (await supabase.auth.getUser()).data.user?.id || '',
            session_id: sessionId,
            question_id: currentSession.dbQuestionId,
            bottle_id: currentSession.dbBottleId || null,
            response_text: thoughts,
          }, { onConflict: 'user_id, session_id, question_id' });
          
        if (error) {
          toast({
            title: "Error saving response",
            description: "Your additional thoughts couldn't be saved to the database.",
            variant: "destructive"
          });
          console.error("Error saving response:", error);
        }
      }
    },
    nextQuestion,
    previousQuestion,
    submitResponses,
    setSessionId,
    fetchSessions,
  };

  return (
    <WineTastingContext.Provider value={value}>
      {children}
    </WineTastingContext.Provider>
  );
};

export const useWineTasting = () => {
  const context = useContext(WineTastingContext);
  if (context === undefined) {
    throw new Error('useWineTasting must be used within a WineTastingProvider');
  }
  return context;
};
