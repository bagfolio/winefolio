
import React, { useEffect } from 'react';
import { useWineTasting } from '@/context/WineTastingContext';
import { questions } from '@/data/questions';
import SignInForm from './SignInForm';
import TextQuestion from './TextQuestion';
import ScaleQuestion from './ScaleQuestion';
import MultipleChoiceQuestion from './MultipleChoiceQuestion';
import Interlude from './Interlude';
import ThanksScreen from './ThanksScreen';
import AudioMessage from './AudioMessage';
import VideoMessage from './VideoMessage';
import ProgressIndicator from './ProgressIndicator';
import LoadingScreen from './LoadingScreen';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { BottleData } from '@/context/types';

const WineTastingFlow = () => {
  const { 
    currentQuestionIndex, 
    loading, 
    setLoading,
    bottlesData,
    setBottlesData,
    packageInfo 
  } = useWineTasting();
  
  const currentQuestion = questions[currentQuestionIndex];
  
  useEffect(() => {
    // Log bottles data for debugging
    if (bottlesData && bottlesData.length > 0) {
      console.log('WineTastingFlow has access to bottles:', bottlesData);
      bottlesData.forEach((bottle, index) => {
        console.log(`Bottle ${index + 1}: ${bottle.Name}`, {
          introQuestions: bottle.introQuestions,
          deepQuestions: bottle.deepQuestions,
          finalQuestions: bottle.finalQuestions
        });
      });
    } else {
      console.log('No bottles data available in WineTastingFlow yet');
    }
  }, [bottlesData]);

  // Load bottles data when packageInfo changes
  useEffect(() => {
    const fetchBottlesForPackage = async () => {
      if (!packageInfo || !packageInfo.package_id) {
        console.log('No package info available, skipping bottle fetch');
        return;
      }

      try {
        setLoading(true);
        console.log('Fetching bottles for package:', packageInfo.package_id);
        
        // Parse bottle names from package
        const bottleNames = packageInfo.bottles?.split(',').map(b => b.trim()) || [];
        if (bottleNames.length === 0) {
          console.warn('No bottles found in package info');
          toast.warning('No bottles found for this tasting session');
          setLoading(false);
          return;
        }
        
        console.log('Looking for these bottles:', bottleNames);

        // Fetch bottles from Supabase
        const { data: bottlesData, error } = await supabase
          .from('Bottles')
          .select('*')
          .in('Name', bottleNames);
          
        if (error) {
          console.error('Error fetching bottles:', error);
          toast.error('Failed to load wine bottles data');
          setLoading(false);
          return;
        }
        
        if (!bottlesData || bottlesData.length === 0) {
          console.warn('No matching bottles found in database');
          toast.warning('No matching bottles found for this tasting');
          setLoading(false);
          return;
        }
        
        console.log('Fetched bottles data:', bottlesData);
        
        // Sort bottles according to the sequence field or original package order
        const sortedBottles = bottlesData.sort((a, b) => {
          // If sequence is available, use it
          if (a.sequence !== null && b.sequence !== null) {
            return (a.sequence || 0) - (b.sequence || 0);
          }
          
          // Otherwise sort by the order they appear in the package bottles string
          const aIndex = bottleNames.indexOf(a.Name || '');
          const bIndex = bottleNames.indexOf(b.Name || '');
          return aIndex - bIndex;
        });
        
        // Cast the sorted bottles to BottleData type
        setBottlesData(sortedBottles as unknown as BottleData[]);
        console.log('Sorted bottles:', sortedBottles);
        
      } catch (err) {
        console.error('Failed to fetch bottles:', err);
        toast.error('An error occurred while loading bottle data');
      } finally {
        setLoading(false);
      }
    };

    if (packageInfo?.package_id) {
      fetchBottlesForPackage();
    }
  }, [packageInfo, setLoading, setBottlesData]);

  const renderQuestionComponent = () => {
    switch (currentQuestion.type) {
      case 'signin':
        return <SignInForm />;
      case 'text':
        return <TextQuestion questionId={currentQuestion.id} />;
      case 'scale':
        return <ScaleQuestion questionId={currentQuestion.id} />;
      case 'multipleChoice':
        return <MultipleChoiceQuestion questionId={currentQuestion.id} />;
      case 'interlude':
        return <Interlude questionId={currentQuestion.id} />;
      case 'audio':
        return <AudioMessage questionId={currentQuestion.id} />;
      case 'video':
        return <VideoMessage questionId={currentQuestion.id} />;
      case 'thanks':
        return <ThanksScreen questionId={currentQuestion.id} />;
      default:
        return <div>Unknown question type</div>;
    }
  };

  // Show loading screen if loading is true
  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-grow flex items-center justify-center">
        {renderQuestionComponent()}
      </main>
      <footer className="mt-auto pb-6">
        <ProgressIndicator />
      </footer>
    </div>
  );
};

export default WineTastingFlow;
