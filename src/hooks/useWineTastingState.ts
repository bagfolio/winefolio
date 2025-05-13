
import { useState } from 'react';
import { UserInfo, WineTastingResponse, PackageInfo } from '../types';
import { BottleData } from '../context/types';
import { toast } from 'sonner';

export const useWineTastingState = (bottlesData: BottleData[]) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [packageInfo, setPackageInfo] = useState<PackageInfo | null>(null);
  
  // Initialize responses for multiple bottles
  const [wineTastingResponse, setWineTastingResponse] = useState<{
    [bottleNumber: number]: WineTastingResponse;
  }>({});

  // Initialize tasting responses when bottles data changes
  const initializeTastingResponses = (bottles: BottleData[]) => {
    const initialResponses: { [bottleNumber: number]: WineTastingResponse } = {};
    bottles.forEach((bottle, index) => {
      initialResponses[index + 1] = {
        initialThoughts: '',
        rating: 5,
        fruitFlavors: [],
        acidityRating: 5,
        additionalThoughts: '',
      };
    });
    
    setWineTastingResponse(initialResponses);
  };

  const nextQuestion = () => {
    setCurrentQuestionIndex((prev) => prev + 1);
  };

  const previousQuestion = () => {
    setCurrentQuestionIndex((prev) => Math.max(0, prev - 1));
  };

  const submitResponses = () => {
    // In a real app, this would send data to a backend API
    console.log('Submitting responses:', { userInfo, packageInfo, wineTastingResponse, bottlesData });
    
    // Show success toast using sonner format
    toast('Responses submitted!', {
      description: "Your wine tasting responses have been saved."
    });
  };

  const setInitialThoughts = (thoughts: string, bottleNumber = 1) => 
    setWineTastingResponse((prev) => ({
      ...prev,
      [bottleNumber]: {
        ...prev[bottleNumber],
        initialThoughts: thoughts
      }
    }));
  
  const setRating = (rating: number, bottleNumber = 1) => 
    setWineTastingResponse((prev) => ({
      ...prev,
      [bottleNumber]: {
        ...prev[bottleNumber],
        rating
      }
    }));
  
  const setFruitFlavors = (flavors: string[], bottleNumber = 1) => 
    setWineTastingResponse((prev) => ({
      ...prev,
      [bottleNumber]: {
        ...prev[bottleNumber],
        fruitFlavors: flavors
      }
    }));
  
  const setAcidityRating = (rating: number, bottleNumber = 1) => 
    setWineTastingResponse((prev) => ({
      ...prev,
      [bottleNumber]: {
        ...prev[bottleNumber],
        acidityRating: rating
      }
    }));
  
  const setAdditionalThoughts = (thoughts: string, bottleNumber = 1) => 
    setWineTastingResponse((prev) => ({
      ...prev,
      [bottleNumber]: {
        ...prev[bottleNumber],
        additionalThoughts: thoughts
      }
    }));

  return {
    currentQuestionIndex,
    userInfo,
    packageInfo,
    wineTastingResponse,
    setUserInfo,
    setPackageInfo,
    setInitialThoughts,
    setRating,
    setFruitFlavors,
    setAcidityRating,
    setAdditionalThoughts,
    nextQuestion,
    previousQuestion,
    submitResponses,
    initializeTastingResponses,
  };
};
