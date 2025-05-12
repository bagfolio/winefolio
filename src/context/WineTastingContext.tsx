
import React, { createContext, useState, useContext, ReactNode } from 'react';
import { UserInfo, WineTastingResponse } from '../types';
import { useToast } from '@/components/ui/use-toast';

interface WineTastingContextType {
  currentQuestionIndex: number;
  userInfo: UserInfo | null;
  wineTastingResponse: WineTastingResponse;
  loading: boolean;
  setUserInfo: (info: UserInfo) => void;
  setInitialThoughts: (thoughts: string) => void;
  setRating: (rating: number) => void;
  setFruitFlavors: (flavors: string[]) => void;
  setAcidityRating: (rating: number) => void;
  setAdditionalThoughts: (thoughts: string) => void;
  nextQuestion: () => void;
  previousQuestion: () => void;
  submitResponses: () => void;
}

const WineTastingContext = createContext<WineTastingContextType | undefined>(undefined);

export const WineTastingProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  
  // Auto-disable loading after 3 seconds
  React.useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 3000);
    
    return () => clearTimeout(timer);
  }, []);
  
  const [wineTastingResponse, setWineTastingResponse] = useState<WineTastingResponse>({
    initialThoughts: '',
    rating: 5,
    fruitFlavors: [],
    acidityRating: 5,
    additionalThoughts: '',
  });

  const nextQuestion = () => {
    setCurrentQuestionIndex((prev) => prev + 1);
  };

  const previousQuestion = () => {
    setCurrentQuestionIndex((prev) => Math.max(0, prev - 1));
  };

  const submitResponses = () => {
    // In a real app, this would send data to a backend API
    console.log('Submitting responses:', { userInfo, wineTastingResponse });
    
    // Show success toast
    toast({
      title: "Responses submitted!",
      description: "Your wine tasting responses have been saved.",
    });
  };

  const value = {
    currentQuestionIndex,
    userInfo,
    wineTastingResponse,
    loading,
    setUserInfo: (info: UserInfo) => setUserInfo(info),
    setInitialThoughts: (thoughts: string) => 
      setWineTastingResponse((prev) => ({ ...prev, initialThoughts: thoughts })),
    setRating: (rating: number) => 
      setWineTastingResponse((prev) => ({ ...prev, rating })),
    setFruitFlavors: (flavors: string[]) => 
      setWineTastingResponse((prev) => ({ ...prev, fruitFlavors: flavors })),
    setAcidityRating: (rating: number) => 
      setWineTastingResponse((prev) => ({ ...prev, acidityRating: rating })),
    setAdditionalThoughts: (thoughts: string) => 
      setWineTastingResponse((prev) => ({ ...prev, additionalThoughts: thoughts })),
    nextQuestion,
    previousQuestion,
    submitResponses,
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
