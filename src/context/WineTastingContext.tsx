
import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import { UserInfo, WineTastingResponse, PackageInfo } from '../types';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface BottleData {
  Name: string;
  bottle_image_url: string;
  introQuestions: any;
  deepQuestions: any;
  finalQuestions: any;
  sequence: number;
  [key: string]: any;
}

interface WineTastingContextType {
  currentQuestionIndex: number;
  userInfo: UserInfo | null;
  packageInfo: PackageInfo | null;
  bottlesData: BottleData[];
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
  const [bottlesData, setBottlesData] = useState<BottleData[]>([]);
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

  // Load bottles data when package info changes
  useEffect(() => {
    const fetchBottlesData = async () => {
      if (!packageInfo || !packageInfo.bottles) return;
      
      setLoading(true);
      try {
        // Parse bottle IDs from the package
        const bottleIds = packageInfo.bottles.split(',').map(id => id.trim());
        console.log('Fetching bottles with IDs:', bottleIds);
        
        if (bottleIds.length === 0) {
          console.log('No bottle IDs found in package');
          return;
        }
        
        // Fetch bottles data
        const { data: bottles, error } = await supabase
          .from('Bottles')
          .select('*')
          .in('Name', bottleIds)
          .order('sequence', { ascending: true });
        
        if (error) {
          console.error('Error fetching bottles:', error);
          toast({
            title: 'Error',
            description: 'Failed to load bottle information.',
            variant: 'destructive',
          });
          return;
        }
        
        console.log('Fetched bottles:', bottles);
        setBottlesData(bottles || []);
        
        // Initialize tasting responses for all bottles
        const initialResponses: { [bottleNumber: number]: WineTastingResponse } = {};
        bottles?.forEach((bottle, index) => {
          initialResponses[index + 1] = {
            initialThoughts: '',
            rating: 5,
            fruitFlavors: [],
            acidityRating: 5,
            additionalThoughts: '',
          };
        });
        
        // Only set if we have bottles to avoid wiping out existing responses
        if (Object.keys(initialResponses).length > 0) {
          setWineTastingResponse(initialResponses);
        }
      } catch (error) {
        console.error('Error in fetchBottlesData:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchBottlesData();
  }, [packageInfo, toast]);

  const nextQuestion = () => {
    setCurrentQuestionIndex((prev) => prev + 1);
  };

  const previousQuestion = () => {
    setCurrentQuestionIndex((prev) => Math.max(0, prev - 1));
  };

  const submitResponses = () => {
    // In a real app, this would send data to a backend API
    console.log('Submitting responses:', { userInfo, packageInfo, wineTastingResponse, bottlesData });
    
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
    bottlesData,
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
