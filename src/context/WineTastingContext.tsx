import React, { createContext, useContext, ReactNode, useEffect, useState, useRef } from 'react';
import { UserInfo, PackageInfo } from '../types';
import { WineTastingContextType } from './types';
import { useWineTastingState } from '../hooks/useWineTastingState';
import { getAvailableQuestions, getQuestionType, parseOptions } from '@/utils/questionUtils';
import { useDataPreload } from '../hooks/useDataPreload';

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
  
  // Remove useBottlesData
  // const { bottlesData, loading, setLoading, setBottlesData } = useBottlesData(packageInfo);
  const [bottlesData, setBottlesData] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [dynamicQuestions, setDynamicQuestions] = useState<any[]>([]);
  const [responsesInitialized, setResponsesInitialized] = useState(false);
  const { preloadData } = useDataPreload();
  const lastLoadedPackageId = useRef<string | null>(null);

  // Fetch bottles and questions when packageInfo changes
  useEffect(() => {
    const fetchData = async () => {
      if (packageInfo && packageInfo.package_id && lastLoadedPackageId.current !== packageInfo.package_id) {
        lastLoadedPackageId.current = packageInfo.package_id;
        setLoading(true);
        const result = await preloadData(packageInfo);
        if (result.success) {
          if (result.bottles) setBottlesData(result.bottles);
          if (result.questions) setDynamicQuestions(result.questions);
        }
        setLoading(false);
      }
    };
    fetchData();
  }, [packageInfo]);

  // Log key state changes
  useEffect(() => {
    console.log('�� WineTastingContext state update:');
    console.log(`  - Current question index: ${currentQuestionIndex}`);
    console.log(`  - User info: ${userInfo ? 'Present' : 'Missing'}`);
    console.log(`  - Package info: ${packageInfo ? 'Present' : 'Missing'}`);
    console.log(`  - Bottles data: ${bottlesData.length} bottles`);
    console.log(`  - Loading state: ${loading ? 'Loading' : 'Not loading'}`);
  }, [currentQuestionIndex, userInfo, packageInfo, bottlesData.length, loading]);

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
    dynamicQuestions,
    setDynamicQuestions,
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

function generateDynamicQuestionsFromData(bottles: any[]): any[] {
  const dynamicQuestions: any[] = [];
  dynamicQuestions.push({
    id: 1,
    type: 'signin',
    question: 'Welcome to the Wine Tasting Experience',
    description: 'Please sign in to get started'
  });

  bottles.forEach((bottle, bottleIndex) => {
    const bottleNumber = bottleIndex + 1;
    const bottleName = bottle.name || `Bottle ${bottleNumber}`;
    const bottleQuestions = bottle.questions || [];

    // Interlude
    dynamicQuestions.push({
      id: 100 + (bottleNumber * 10),
      type: 'interlude',
      question: `Now let's taste bottle #${bottleNumber}: ${bottleName}`,
      description: 'Prepare your palate for the next wine',
      bottleNumber
    });

    // Render every question for this bottle, in the order they appear in the DB
    bottleQuestions.forEach((q, qIndex) => {
      const dynamicQuestion = {
        id: 100 + (bottleNumber * 10) + qIndex + 1,
        type: q.question_type,
        question: q.question_text,
        description: '', // Add if you have it
        options: q.options,
        bottleNumber,
        for_host: q.for_host === true || q.for_host === 'true'
      };
      console.log('DynamicQuestion for_host:', dynamicQuestion.for_host, dynamicQuestion);
      dynamicQuestions.push(dynamicQuestion);
    });
  });

  // Thanks screen
  dynamicQuestions.push({
    id: 9999,
    type: 'thanks',
    question: 'Thank you for participating!',
    description: 'Your responses have been recorded.'
  });

  return dynamicQuestions;
}
