
import React, { createContext, useContext, ReactNode, useEffect, useState } from 'react';
import { UserInfo, PackageInfo } from '../types';
import { WineTastingContextType } from './types';
import { useBottlesData } from '../hooks/useBottlesData';
import { useWineTastingState } from '../hooks/useWineTastingState';
import { getAvailableQuestions } from '@/utils/questionUtils';

const WineTastingContext = createContext<WineTastingContextType | undefined>(undefined);

export const WineTastingProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Get packageInfo and userInfo from the state
  const {
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
  } = useWineTastingState([]);
  
  // Load bottles data when package info changes
  const { bottlesData, loading, setLoading, setBottlesData } = useBottlesData(packageInfo);
  
  // State for dynamic questions
  const [dynamicQuestions, setDynamicQuestions] = useState<any[]>([]);

  // Initialize responses when bottles data changes
  useEffect(() => {
    if (bottlesData.length > 0) {
      console.log('Initializing tasting responses with bottles:', bottlesData);
      initializeTastingResponses(bottlesData);
      
      // Generate dynamic questions based on bottle data
      const questions = getAvailableQuestions(bottlesData);
      setDynamicQuestions(questions);
      console.log('Generated dynamic questions:', questions);
    }
  }, [bottlesData]);

  // Log key state changes
  useEffect(() => {
    console.log('📊 WineTastingContext state update:');
    console.log(`  - Current question index: ${currentQuestionIndex}`);
    console.log(`  - User info: ${userInfo ? 'Present' : 'Missing'}`);
    console.log(`  - Package info: ${packageInfo ? 'Present' : 'Missing'}`);
    console.log(`  - Bottles data: ${bottlesData.length} bottles`);
  }, [currentQuestionIndex, userInfo, packageInfo, bottlesData.length]);

  const value: WineTastingContextType = {
    currentQuestionIndex,
    userInfo,
    packageInfo,
    bottlesData,
    wineTastingResponse,
    loading,
    setLoading,
    setUserInfo: (info: UserInfo) => setUserInfo(info),
    setPackageInfo: (info: PackageInfo) => setPackageInfo(info),
    setBottlesData, 
    setInitialThoughts,
    setRating,
    setFruitFlavors,
    setAcidityRating,
    setAdditionalThoughts,
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
