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
          // Log both naming conventions to help debug
          introQuestions: bottle.introQuestions || bottle["Intro Questions"],
          deepQuestions: bottle.deepQuestions || bottle["Deep Question"],
          finalQuestions: bottle.finalQuestions || bottle["Final Questions"]
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
        console.log('Fetching bottles for package:', packageInfo.package_id, packageInfo);
        
        // Parse bottle names from package
        const bottleNames = packageInfo.bottles?.split(',').map(b => b.trim()) || [];
        if (bottleNames.length === 0) {
          console.warn('No bottles found in package info');
          toast.warning('No bottles found for this tasting session');
          setLoading(false);
          return;
        }
        
        console.log('Looking for these bottles:', bottleNames);

        // Fetch all bottles first to debug
        const { data: allBottles, error: allBottlesError } = await supabase
          .from('Bottles')
          .select('*');
          
        if (allBottlesError) {
          console.error('Error fetching all bottles:', allBottlesError);
        } else {
          console.log('All available bottles in database:', allBottles);
        }

        // Now fetch the specific bottles we need
        const { data: bottlesData, error } = await supabase
          .from('Bottles')
          .select('*');
          
        if (error) {
          console.error('Error fetching bottles:', error);
          toast.error('Failed to load wine bottles data');
          setLoading(false);
          return;
        }
        
        // Filter bottles by name manually since the 'in' operator might not be working as expected
        const matchedBottles = bottlesData?.filter(bottle => 
          bottleNames.some(name => bottle.Name?.toLowerCase() === name.toLowerCase())
        );
        
        if (!matchedBottles || matchedBottles.length === 0) {
          console.warn('No matching bottles found in database after filtering');
          console.log('Available bottles:', bottlesData?.map(b => b.Name));
          console.log('Looking for:', bottleNames);
          toast.warning('No matching bottles found for this tasting');
          setLoading(false);
          return;
        }
        
        console.log('Matched bottles data:', matchedBottles);
        
        // Sort bottles according to the sequence field or original package order
        const sortedBottles = matchedBottles.sort((a, b) => {
          // If sequence is available, use it
          if (a.sequence !== null && b.sequence !== null) {
            return (a.sequence || 0) - (b.sequence || 0);
          }
          
          // Otherwise sort by the order they appear in the package bottles string
          const aIndex = bottleNames.indexOf(a.Name || '');
          const bIndex = bottleNames.indexOf(b.Name || '');
          return aIndex - bIndex;
        });
        
        // Process bottles to have consistent field names
        const mappedBottles = sortedBottles.map(bottle => {
          // Create a new object with both naming conventions
          return {
            ...bottle,
            // Map the intro questions field from either format
            introQuestions: bottle["Intro Questions"],
            // Map the deep questions field from either format
            deepQuestions: bottle["Deep Question"],
            // Map the final questions field from either format
            finalQuestions: bottle["Final Questions"],
          };
        });
        
        console.log('Processed bottles with mapped fields:', mappedBottles);
        setBottlesData(mappedBottles);
        
        // Now fetch questions for these bottles
        await fetchQuestionsForBottles(mappedBottles);
        
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
      
      // Fetch all questions first to debug
      const { data: allQuestions, error: allQuestionsError } = await supabase
        .from('Questions')
        .select('*');
        
      if (allQuestionsError) {
        console.error('Error fetching all questions:', allQuestionsError);
      } else {
        console.log('All available questions in database:', allQuestions);
      }
      
      // Fetch questions related to these bottles - try without the 'in' operator
      const { data: questionData, error } = await supabase
        .from('Questions')
        .select('*');
        
      if (error) {
        console.error('Error fetching questions:', error);
        toast.error('Failed to load bottle questions');
        return;
      }
      
      // Manually filter questions by bottle name
      const relevantQuestions = questionData?.filter(q => {
        if (!q.Bottles) return false;
        // Check if any of our bottle names are mentioned in the question's Bottles field
        return bottleNames.some(name => 
          q.Bottles?.includes(name)
        );
      });
      
      if (!relevantQuestions || relevantQuestions.length === 0) {
        console.warn('No questions found for the selected bottles after filtering');
        console.log('Looking for questions for bottles:', bottleNames);
        console.log('Available questions:', questionData?.map(q => ({bottle: q.Bottles, text: q["Question Text"]})));
        // Continue with default questions
        const defaultQuestions = generateDynamicQuestionsFromData(bottles, []);
        setDynamicQuestions(defaultQuestions);
        return;
      }
      
      console.log('Fetched relevant questions data:', relevantQuestions);
      
      // Map the questions to the bottles and generate dynamic questions
      const mappedQuestions = generateDynamicQuestionsFromData(bottles, relevantQuestions);
      setDynamicQuestions(mappedQuestions);
      
    } catch (err) {
      console.error('Failed to fetch questions:', err);
      toast.error('An error occurred while loading questions');
      
      // Fall back to default questions
      const defaultQuestions = generateDynamicQuestionsFromData(bottles, []);
      setDynamicQuestions(defaultQuestions);
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
                 getJsonProperty(bottle["Intro Questions"], 'question', 'What are your initial thoughts about this wine?'),
        description: getJsonProperty(bottle["Intro Questions"], 'description', 'Share your first impressions'),
        options: parseOptions(introQ?.choices),
        bottleNumber
      });
      
      // Add deep dive questions  
      const deepQ = bottleQuestions.find(q => q["Question Set Type"] === "Deep Dive");
      dynamicQuestions.push({
        id: 100 + (bottleNumber * 10) + 2,
        type: getQuestionType(deepQ?.["Response Type"] || "scale"),
        question: deepQ?.["Question Text"] || 
                 getJsonProperty(bottle["Deep Question"], 'question', 'How would you rate this wine overall?'),
        description: getJsonProperty(bottle["Deep Question"], 'description', 'Rate from 1 (poor) to 10 (excellent)'),
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
                 getJsonProperty(bottle["Final Questions"], 'question', 'Any additional thoughts about this wine?'),
        description: getJsonProperty(bottle["Final Questions"], 'description', 'Share your final impressions'),
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
    
    // If json is a string, try to parse it
    if (typeof json === 'string') {
      try {
        const parsed = JSON.parse(json);
        const value = parsed[property];
        return typeof value === 'string' ? value : defaultValue;
      } catch {
        // If parsing fails, just return the raw string
        return json;
      }
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
