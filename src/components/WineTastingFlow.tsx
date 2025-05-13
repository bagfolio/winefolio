
import React, { useEffect, useState } from 'react';
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
import { Question } from '@/types';

const WineTastingFlow = () => {
  const { 
    currentQuestionIndex, 
    loading, 
    setLoading,
    bottlesData,
    setBottlesData,
    packageInfo 
  } = useWineTasting();
  
  // State to hold dynamic questions based on fetched data
  const [dynamicQuestions, setDynamicQuestions] = useState<Question[]>(questions);
  
  const currentQuestion = dynamicQuestions[currentQuestionIndex] || questions[currentQuestionIndex];
  
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
        
        // Now fetch questions for these bottles
        await fetchQuestionsForBottles(sortedBottles as unknown as BottleData[]);
        
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
  
  // New function to fetch questions for bottles
  const fetchQuestionsForBottles = async (bottles: BottleData[]) => {
    if (!bottles || bottles.length === 0) return;
    
    try {
      // Collect all bottle names for the query
      const bottleNames = bottles.map(bottle => bottle.Name).filter(name => name !== null) as string[];
      
      if (bottleNames.length === 0) {
        console.warn('No valid bottle names to fetch questions for');
        return;
      }
      
      console.log('Fetching questions for bottles:', bottleNames);
      
      // Fetch questions related to these bottles
      const { data: questionData, error } = await supabase
        .from('Questions')
        .select('*')
        .in('Bottles', bottleNames);
        
      if (error) {
        console.error('Error fetching questions:', error);
        toast.error('Failed to load bottle questions');
        return;
      }
      
      if (!questionData || questionData.length === 0) {
        console.warn('No questions found for the selected bottles');
        // Continue with default questions
        return;
      }
      
      console.log('Fetched questions data:', questionData);
      
      // Map the questions to the bottles and generate dynamic questions
      const mappedQuestions = generateDynamicQuestionsFromData(bottles, questionData);
      setDynamicQuestions(mappedQuestions);
      
    } catch (err) {
      console.error('Failed to fetch questions:', err);
      toast.error('An error occurred while loading questions');
    }
  };
  
  // Function to generate dynamic questions based on bottle and question data
  const generateDynamicQuestionsFromData = (bottles: BottleData[], questionData: any[]): Question[] => {
    const dynamicQuestions: Question[] = [];
    
    // Start with signin question
    dynamicQuestions.push({
      id: 1,
      type: 'signin',
      question: 'Welcome to the Wine Tasting Experience',
      description: 'Please sign in to get started'
    });
    
    // Generate questions for each bottle
    bottles.forEach((bottle, bottleIndex) => {
      const bottleNumber = bottleIndex + 1;
      const bottleName = bottle.Name || `Bottle ${bottleNumber}`;
      
      // Add bottle interlude
      dynamicQuestions.push({
        id: 100 + (bottleNumber * 10),
        type: 'interlude',
        question: `Now let's taste bottle #${bottleNumber}: ${bottleName}`,
        description: 'Prepare your palate for the next wine',
        bottleNumber
      });
      
      // Find questions for this specific bottle
      const bottleQuestions = questionData.filter(q => 
        q.Bottles === bottleName || 
        (q.Bottles && q.Bottles.includes(bottleName))
      );
      
      // Add intro questions
      const introQ = bottleQuestions.find(q => q["Question Set Type"] === "Intro");
      dynamicQuestions.push({
        id: 100 + (bottleNumber * 10) + 1,
        type: getQuestionType(introQ?.["Response Type"] || "text"),
        question: introQ?.["Question Text"] || 
                 (bottle.introQuestions ? 
                  getJsonProperty(bottle.introQuestions, 'question', 'What are your initial thoughts about this wine?') : 
                  'What are your initial thoughts about this wine?'),
        description: bottle.introQuestions ? 
                     getJsonProperty(bottle.introQuestions, 'description', 'Share your first impressions') : 
                     'Share your first impressions',
        options: parseOptions(introQ?.choices),
        bottleNumber
      });
      
      // Add deep dive questions  
      const deepQ = bottleQuestions.find(q => q["Question Set Type"] === "Deep Dive");
      dynamicQuestions.push({
        id: 100 + (bottleNumber * 10) + 2,
        type: getQuestionType(deepQ?.["Response Type"] || "scale"),
        question: deepQ?.["Question Text"] || 
                 (bottle.deepQuestions ? 
                  getJsonProperty(bottle.deepQuestions, 'question', 'How would you rate this wine overall?') : 
                  'How would you rate this wine overall?'),
        description: bottle.deepQuestions ? 
                    getJsonProperty(bottle.deepQuestions, 'description', 'Rate from 1 (poor) to 10 (excellent)') : 
                    'Rate from 1 (poor) to 10 (excellent)',
        options: parseOptions(deepQ?.choices),
        bottleNumber
      });
      
      // Add flavor questions (always multiple choice)
      dynamicQuestions.push({
        id: 100 + (bottleNumber * 10) + 3,
        type: 'multipleChoice',
        question: 'What fruit flavors do you detect in this wine?',
        options: [
          'Apple', 'Pear', 'Citrus', 'Tropical', 
          'Cherry', 'Strawberry', 'Raspberry', 'Blueberry',
          'Plum', 'Blackberry', 'Currant', 'Other'
        ],
        bottleNumber
      });
      
      // Add final questions
      const finalQ = bottleQuestions.find(q => q["Question Set Type"] === "Final");
      dynamicQuestions.push({
        id: 100 + (bottleNumber * 10) + 4,
        type: getQuestionType(finalQ?.["Response Type"] || "text"),
        question: finalQ?.["Question Text"] || 
                 (bottle.finalQuestions ? 
                  getJsonProperty(bottle.finalQuestions, 'question', 'Any additional thoughts about this wine?') : 
                  'Any additional thoughts about this wine?'),
        description: bottle.finalQuestions ? 
                    getJsonProperty(bottle.finalQuestions, 'description', 'Share your final impressions') : 
                    'Share your final impressions',
        options: parseOptions(finalQ?.choices),
        bottleNumber
      });
    });
    
    // Add final thanks screen
    dynamicQuestions.push({
      id: 9999,
      type: 'thanks',
      question: 'Thank you for participating!',
      description: 'Your responses have been recorded.'
    });
    
    console.log('Generated dynamic questions:', dynamicQuestions);
    return dynamicQuestions;
  };
  
  // Helper function to get question type based on response type
  const getQuestionType = (responseType: string): Question['type'] => {
    switch (responseType?.toLowerCase()) {
      case 'scale':
      case '1-10':
      case 'rating':
        return 'scale';
      case 'multiple choice':
      case 'multipleChoice':
      case 'multiple':
        return 'multipleChoice';
      case 'text':
      case 'textarea':
      default:
        return 'text';
    }
  };
  
  // Helper function to parse options from choices string
  const parseOptions = (choices: string | null | undefined): string[] | undefined => {
    if (!choices) return undefined;
    
    try {
      // Try to parse as JSON
      return JSON.parse(choices);
    } catch (e) {
      // If not valid JSON, split by comma
      return choices.split(',').map(c => c.trim());
    }
  };
  
  // Helper function to safely extract properties from Json
  const getJsonProperty = (json: any, property: string, defaultValue: string): string => {
    if (!json) return defaultValue;
    
    // If json is an object, try to get the property
    if (typeof json === 'object' && json !== null) {
      const value = (json as Record<string, any>)[property];
      return typeof value === 'string' ? value : defaultValue;
    }
    
    // If json is a string, return it as is
    if (typeof json === 'string') {
      return json;
    }
    
    return defaultValue;
  };

  const renderQuestionComponent = () => {
    switch (currentQuestion?.type) {
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
