
import React, { createContext, useState, useContext, ReactNode } from 'react';
import { UserInfo, WineTastingResponse, PackageInfo } from '../types';
import { useToast } from '@/components/ui/use-toast';

interface WineTastingContextType {
  currentQuestionIndex: number;
  userInfo: UserInfo | null;
  packageInfo: PackageInfo | null;
  wineTastingResponse: {
    [bottleNumber: number]: WineTastingResponse;
  };
  loading: boolean;
  setLoading: (isLoading: boolean) => void;
  setUserInfo: (info: UserInfo) => void;
  setPackageInfo: (info: PackageInfo) => void;
  setInitialThoughts: (thoughts: string, bottleNumber?: number) => void;
  setRating: (rating: number, bottleNumber?: number) => void;
  setFruitFlavors: (flavors: string[], bottleNumber?: number) => void;
  setAcidityRating: (rating: number, bottleNumber?: number) => void;
  setAdditionalThoughts: (thoughts: string, bottleNumber?: number) => void;
  nextQuestion: () => void;
  previousQuestion: () => void;
  submitResponses: () => void;
}

const WineTastingContext = createContext<WineTastingContextType | undefined>(undefined);

export const WineTastingProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [packageInfo, setPackageInfo] = useState<PackageInfo | null>(null);
  const [loading, setLoading] = useState(false);
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

  const submitResponses = () => {
    // In a real app, this would send data to a backend API
    console.log('Submitting responses:', { userInfo, packageInfo, wineTastingResponse });
    
    // Show success toast
    toast({
      title: "Responses submitted!",
      description: "Your wine tasting responses have been saved.",
    });
  };

  const value = {
    currentQuestionIndex,
    userInfo,
    packageInfo,
    wineTastingResponse,
    loading,
    setLoading,
    setUserInfo: (info: UserInfo) => setUserInfo(info),
    setPackageInfo: (info: PackageInfo) => setPackageInfo(info),
    setInitialThoughts: (thoughts: string, bottleNumber = 1) => 
      setWineTastingResponse((prev) => ({
        ...prev,
        [bottleNumber]: {
          ...prev[bottleNumber],
          initialThoughts: thoughts
        }
      })),
    setRating: (rating: number, bottleNumber = 1) => 
      setWineTastingResponse((prev) => ({
        ...prev,
        [bottleNumber]: {
          ...prev[bottleNumber],
          rating
        }
      })),
    setFruitFlavors: (flavors: string[], bottleNumber = 1) => 
      setWineTastingResponse((prev) => ({
        ...prev,
        [bottleNumber]: {
          ...prev[bottleNumber],
          fruitFlavors: flavors
        }
      })),
    setAcidityRating: (rating: number, bottleNumber = 1) => 
      setWineTastingResponse((prev) => ({
        ...prev,
        [bottleNumber]: {
          ...prev[bottleNumber],
          acidityRating: rating
        }
      })),
    setAdditionalThoughts: (thoughts: string, bottleNumber = 1) => 
      setWineTastingResponse((prev) => ({
        ...prev,
        [bottleNumber]: {
          ...prev[bottleNumber],
          additionalThoughts: thoughts
        }
      })),
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
