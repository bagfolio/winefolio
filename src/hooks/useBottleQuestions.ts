
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { BottleData } from '@/context/types';
import { Question } from '@/types';
import { toast } from 'sonner';
import { getQuestionType, parseOptions, getJsonProperty } from '@/utils/questionUtils';

export const useBottleQuestions = (bottles: BottleData[]) => {
  const [dynamicQuestions, setDynamicQuestions] = useState<Question[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    const fetchQuestionsForBottles = async () => {
      if (!bottles || bottles.length === 0) return;
      
      try {
        setIsLoading(true);
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
      } finally {
        setIsLoading(false);
      }
    };

    if (bottles.length > 0) {
      fetchQuestionsForBottles();
    }
  }, [bottles]);

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

  return {
    dynamicQuestions,
    isLoading
  };
};
