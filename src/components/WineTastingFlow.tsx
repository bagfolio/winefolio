
import React, { useEffect, useState } from 'react';
import { useWineTasting } from '@/context/WineTastingContext';
import { questions } from '@/data/questions';
import ProgressIndicator from './ProgressIndicator';
import LoadingScreen from './LoadingScreen';
import { usePackageBottles } from '@/hooks/usePackageBottles';
import { useBottleQuestions } from '@/hooks/useBottleQuestions';
import QuestionRenderer from './QuestionRenderer';
import { toast } from 'sonner';

const WineTastingFlow = () => {
  const { 
    currentQuestionIndex, 
    loading: contextLoading, 
    setLoading,
    setBottlesData,
    packageInfo 
  } = useWineTasting();
  
  const [initialLoadAttempted, setInitialLoadAttempted] = useState(false);
  
  // For debugging
  useEffect(() => {
    console.log('🚀 WineTastingFlow initialized');
    console.log('📦 Package info:', packageInfo ? JSON.stringify(packageInfo, null, 2) : 'None');
    
    // Add a debugging interval
    const debugInterval = setInterval(() => {
      console.log('⏱️ Loading status check:');
      console.log(`  - Context loading: ${contextLoading ? 'YES' : 'NO'}`);
      console.log(`  - Initial load attempted: ${initialLoadAttempted ? 'YES' : 'NO'}`);
    }, 5000);
    
    return () => clearInterval(debugInterval);
  }, [packageInfo, contextLoading, initialLoadAttempted]);
  
  // Use custom hooks to manage bottle data and questions
  const { 
    bottlesData, 
    loading: bottlesLoading 
  } = usePackageBottles(packageInfo);
  
  const { 
    dynamicQuestions, 
    isLoading: questionsLoading 
  } = useBottleQuestions(bottlesData);
  
  // Set the current question based on dynamic questions or fallback to default questions
  const currentQuestion = dynamicQuestions[currentQuestionIndex] || questions[currentQuestionIndex];
  
  // Log bottles data for debugging
  useEffect(() => {
    console.log(`🍷 Bottles data updated - ${bottlesData.length} bottles`);
    
    if (bottlesData && bottlesData.length > 0) {
      console.log('🍾 WineTastingFlow has access to bottles:', bottlesData.map(b => b.Name));
      setBottlesData(bottlesData);
      
      // Debug the bottle data fields
      bottlesData.forEach((bottle, index) => {
        console.log(`🍷 Bottle ${index + 1}: ${bottle.Name}`, {
          introQuestions: bottle.introQuestions ? 'Present' : 'Missing',
          deepQuestions: bottle.deepQuestions ? 'Present' : 'Missing', 
          finalQuestions: bottle.finalQuestions ? 'Present' : 'Missing'
        });
      });
      
      setInitialLoadAttempted(true);
    } else if (bottlesData && bottlesData.length === 0 && !bottlesLoading) {
      console.log('⚠️ No bottles data available in WineTastingFlow');
      setInitialLoadAttempted(true);
      
      // If we have a package but no bottles, show a toast
      if (packageInfo && packageInfo.package_id) {
        toast.error('Could not load wine data. Please check your connection and try again.');
      }
    }
  }, [bottlesData, setBottlesData, bottlesLoading, packageInfo]);
  
  // Log questions data for debugging
  useEffect(() => {
    console.log(`📝 Questions updated - ${dynamicQuestions.length} questions`);
    
    if (dynamicQuestions.length > 0) {
      console.log('📋 Question types breakdown:');
      const types = dynamicQuestions.reduce((acc: Record<string, number>, q) => {
        acc[q.type] = (acc[q.type] || 0) + 1;
        return acc;
      }, {});
      
      Object.entries(types).forEach(([type, count]) => {
        console.log(`  - ${type}: ${count}`);
      });
    }
  }, [dynamicQuestions]);
  
  // Add a timer to automatically hide the loading screen after 15 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      if (contextLoading || bottlesLoading || questionsLoading) {
        console.log('⏱️ Loading timeout reached, forcing loading state to false');
        if (setLoading) setLoading(false);
        setInitialLoadAttempted(true);
        toast.warning('Loading took longer than expected. Proceeding with limited data.');
      }
    }, 15000); // 15 second timeout
    
    return () => clearTimeout(timer);
  }, [contextLoading, bottlesLoading, questionsLoading, setLoading]);
  
  // Show loading screen if any data is being loaded and we haven't tried loading yet
  const isLoading = (contextLoading || bottlesLoading || questionsLoading) && !initialLoadAttempted;
  
  // If loading takes too long but we have no data and we've already attempted to load
  const noDataAfterLoading = bottlesData.length === 0 && initialLoadAttempted && !isLoading;
  
  // Log the current application state
  useEffect(() => {
    console.log('🔄 App State Update:');
    console.log(`  - isLoading: ${isLoading}`);
    console.log(`  - noDataAfterLoading: ${noDataAfterLoading}`);
    console.log(`  - dynamicQuestions: ${dynamicQuestions.length}`);
    console.log(`  - currentQuestionIndex: ${currentQuestionIndex}`);
  }, [isLoading, noDataAfterLoading, dynamicQuestions.length, currentQuestionIndex]);
  
  if (isLoading) {
    console.log('⏳ Showing loading screen...');
    return <LoadingScreen />;
  }
  
  if (noDataAfterLoading) {
    console.log('⚠️ No data after loading, showing error screen');
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-purple-950">
        <div className="text-center p-8 bg-purple-900/60 rounded-lg max-w-md">
          <h2 className="text-2xl font-bold text-white mb-4">No Wine Data Available</h2>
          <p className="text-white/80 mb-6">
            We couldn't load your wine tasting data. This could be due to connectivity issues or missing data.
          </p>
          <button
            onClick={() => {
              console.log('🔄 Retry button clicked, reloading page...');
              window.location.reload();
            }}
            className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-md transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  console.log(`🎬 Rendering question: ${currentQuestion?.question || 'No question available'}`);
  
  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-grow flex items-center justify-center">
        <QuestionRenderer question={currentQuestion} />
      </main>
      <footer className="mt-auto pb-6">
        <ProgressIndicator />
      </footer>
    </div>
  );
};

export default WineTastingFlow;
