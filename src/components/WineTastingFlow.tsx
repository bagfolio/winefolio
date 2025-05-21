
import React, { useEffect, useState } from 'react';
import { useWineTasting } from '@/context/WineTastingContext';
import { demoQuestions } from '@/data/demoQuestions'; // Import our demo questions
import ProgressIndicator from './ProgressIndicator';
import LoadingScreen from './LoadingScreen';
import QuestionRenderer from './QuestionRenderer';
import { toast } from 'sonner';
import SignInForm from './SignInForm';
import DividerScreen from './DividerScreen';

const WineTastingFlow = () => {
  const { 
    currentQuestionIndex, 
    loading: contextLoading, 
    setLoading,
    setBottlesData,
    packageInfo,
    userInfo,
    setDynamicQuestions,
    dynamicQuestions,
    bottlesData
  } = useWineTasting();
  
  const [initialLoadAttempted, setInitialLoadAttempted] = useState(false);
  const [answers, setAnswers] = useState<{ [questionId: number]: any }>({});
  const [isDemo, setIsDemo] = useState(true); // Flag to determine if we're using demo questions
  
  // For debugging
  useEffect(() => {
    console.log('🚀 WineTastingFlow initialized');
    console.log('📦 Package info:', packageInfo ? JSON.stringify(packageInfo, null, 2) : 'None');
    console.log('👤 User info:', userInfo ? JSON.stringify(userInfo, null, 2) : 'None');
    console.log('🔢 Current question index:', currentQuestionIndex);
  }, [packageInfo, userInfo, currentQuestionIndex]);
  
  // Set demo questions on first load
  useEffect(() => {
    if (isDemo) {
      console.log('🎮 Setting demo questions');
      setDynamicQuestions(demoQuestions);
      setInitialLoadAttempted(true);
      toast.success('Demo mode activated');
    }
  }, [isDemo, setDynamicQuestions]);
  
  // Filter and sort questions for the current user
  const sortedQuestions = [...dynamicQuestions].sort((a, b) => (a.sequence || a.id || 0) - (b.sequence || b.id || 0));
  const filteredQuestions = sortedQuestions.filter(q => !q.for_host || (q.for_host && (userInfo?.isHost ?? false)));
  const currentQuestion = filteredQuestions[currentQuestionIndex];
  
  // Debug: Log dynamicQuestions and currentQuestion structure
  useEffect(() => {
    console.log('DEBUG dynamicQuestions:', dynamicQuestions);
    console.log('DEBUG currentQuestion:', currentQuestion);
  }, [dynamicQuestions, currentQuestionIndex]);
  
  // Handler for answer changes
  const handleAnswerChange = (val: any) => {
    if (!currentQuestion) return;
    setAnswers(prev => ({ ...prev, [currentQuestion.id]: val }));
  };
  
  // Set initialLoadAttempted to true when we're in demo mode to skip loading screens
  useEffect(() => {
    if (isDemo) {
      setInitialLoadAttempted(true);
    }
  }, [isDemo]);
  
  // Force the first question (sign-in) if currentQuestionIndex is 0
  useEffect(() => {
    if (currentQuestionIndex === 0) {
      console.log('🔐 Ensuring sign-in screen is shown first');
      setInitialLoadAttempted(true);
    }
  }, [currentQuestionIndex]);
  
  // Show loading screen if any data is being loaded and we haven't tried loading yet
  // Only show loading after login (currentQuestionIndex > 0)
  const isLoading = (contextLoading) && 
                   !initialLoadAttempted && 
                   currentQuestionIndex > 0;
  
  // If loading takes too long but we have no data and we've already attempted to load
  // Only show error screen if we're past the login step (currentQuestionIndex > 0)
  const noDataAfterLoading = bottlesData.length === 0 && 
                             initialLoadAttempted && 
                             !isDemo && // Skip this check for demo mode
                             !isLoading && 
                             currentQuestionIndex > 0 && 
                             packageInfo;

  // Log the current application state
  useEffect(() => {
    console.log('🔄 App State Update:');
    console.log(`  - isLoading: ${isLoading}`);
    console.log(`  - noDataAfterLoading: ${noDataAfterLoading}`);
    console.log(`  - dynamicQuestions: ${dynamicQuestions.length}`);
    console.log(`  - currentQuestionIndex: ${currentQuestionIndex}`);
    console.log(`  - userInfo present: ${!!userInfo}`);
    console.log(`  - isDemo: ${isDemo}`);
  }, [isLoading, noDataAfterLoading, dynamicQuestions.length, currentQuestionIndex, userInfo, isDemo]);
  
  if (!currentQuestion || currentQuestion.type === 'signin') {
    return <SignInForm isDemo={isDemo} />;
  }

  if (isLoading) {
    console.log('⏳ Showing loading screen...');
    return <LoadingScreen />;
  }
  
  if (noDataAfterLoading && !isDemo) {
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

  // Render divider screens
  if (currentQuestion.type === 'divider' || currentQuestion.divider) {
    return <DividerScreen label={currentQuestion.title || currentQuestion.question || 'Section'} />;
  }

  console.log(`🎬 Rendering question: ${currentQuestion?.question || 'No question available'}`);
  
  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-grow flex items-center justify-center">
        <QuestionRenderer 
          question={currentQuestion} 
          value={answers[currentQuestion.id]}
          onChange={handleAnswerChange}
        />
      </main>
      <footer className="mt-auto pb-6">
        <ProgressIndicator questions={filteredQuestions} />
      </footer>
    </div>
  );
};

export default WineTastingFlow;
