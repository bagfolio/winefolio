
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
      if (!bottles || bottles.length === 0) {
        console.log('❌ No bottles provided to useBottleQuestions');
        return;
      }
      
      try {
        setIsLoading(true);
        console.log(`🍷 Fetching questions for ${bottles.length} bottles...`);
        
        // Collect all bottle names for the query
        const bottleNames = bottles.map(bottle => bottle.Name).filter(name => name !== null) as string[];
        
        if (bottleNames.length === 0) {
          console.warn('⚠️ No valid bottle names to fetch questions for');
          setIsLoading(false);
          return;
        }
        
        console.log('🍾 Fetching questions for bottles:', bottleNames);
        
        // Fetch all questions to debug
        console.log('🔍 Fetching all available questions from database...');
        const { data: allQuestions, error: allQuestionsError } = await supabase
          .from('Questions')
          .select('*');
          
        if (allQuestionsError) {
          console.error('❌ Error fetching all questions:', allQuestionsError);
          toast.error('Failed to load question data');
          setIsLoading(false);
          return;
        } else {
          console.log(`✅ Successfully fetched ${allQuestions?.length || 0} questions from database`);
        }
        
        // Debug the structure of questions
        if (allQuestions && allQuestions.length > 0) {
          console.log('📝 Sample question structure:', JSON.stringify(allQuestions[0], null, 2));
        }
        
        // Manually filter questions by bottle name
        console.log('🔍 Filtering questions by bottle name...');
        const relevantQuestions = allQuestions?.filter(q => {
          if (!q.Bottles) return false;
          
          // Check if any of our bottle names are mentioned in the question's Bottles field
          const matches = bottleNames.some(name => {
            const match = q.Bottles?.includes(name);
            return match;
          });
          
          return matches;
        });
        
        console.log(`📊 Found ${relevantQuestions?.length || 0} relevant questions for these bottles`);
        
        // Count questions per bottle
        bottleNames.forEach(name => {
          const questionsForBottle = relevantQuestions?.filter(q => q.Bottles?.includes(name)) || [];
          console.log(`🍷 Bottle "${name}": ${questionsForBottle.length} questions`);
          
          // Group by question type
          const introQuestions = questionsForBottle.filter(q => q["Question Set Type"] === "Intro").length;
          const deepQuestions = questionsForBottle.filter(q => q["Question Set Type"] === "Deep Dive").length;
          const finalQuestions = questionsForBottle.filter(q => q["Question Set Type"] === "Final").length;
          
          console.log(`  - Intro questions: ${introQuestions}`);
          console.log(`  - Deep dive questions: ${deepQuestions}`);
          console.log(`  - Final questions: ${finalQuestions}`);
        });
        
        if (!relevantQuestions || relevantQuestions.length === 0) {
          console.warn('⚠️ No questions found for the selected bottles after filtering');
          console.log('🔍 Looking for questions for bottles:', bottleNames);
          
          console.log('📝 Using default questions instead...');
          // Continue with default questions
          const defaultQuestions = generateDynamicQuestionsFromData(bottles, []);
          setDynamicQuestions(defaultQuestions);
          setIsLoading(false);
          return;
        }
        
        // Map the questions to the bottles and generate dynamic questions
        console.log('🔄 Generating questions for the tasting flow...');
        const mappedQuestions = generateDynamicQuestionsFromData(bottles, relevantQuestions);
        console.log(`✅ Generated ${mappedQuestions.length} questions for the tasting flow`);
        setDynamicQuestions(mappedQuestions);
        
      } catch (err) {
        console.error('❌ Failed to fetch questions:', err);
        toast.error('An error occurred while loading questions');
        
        // Fall back to default questions
        console.log('📝 Falling back to default questions...');
        const defaultQuestions = generateDynamicQuestionsFromData(bottles, []);
        setDynamicQuestions(defaultQuestions);
      } finally {
        setIsLoading(false);
      }
    };

    if (bottles.length > 0) {
      console.log('🚀 Initiating question fetch for bottles:', bottles.map(b => b.Name));
      fetchQuestionsForBottles();
    }
  }, [bottles]);

  // Function to generate dynamic questions based on bottle and question data
  const generateDynamicQuestionsFromData = (bottles: BottleData[], questionData: any[]): Question[] => {
    console.log('📝 Generating dynamic questions...');
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
      
      console.log(`📝 Generating questions for bottle #${bottleNumber}: ${bottleName}`);
      
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
      
      console.log(`📊 Found ${bottleQuestions.length} custom questions for bottle "${bottleName}"`);
      
      // Add intro questions
      const introQ = bottleQuestions.find(q => q["Question Set Type"] === "Intro");
      const introQuestion = {
        id: 100 + (bottleNumber * 10) + 1,
        type: getQuestionType(introQ?.["Response Type"] || "text"),
        question: introQ?.["Question Text"] || 
                 getJsonProperty(bottle["Intro Questions"], 'question', 'What are your initial thoughts about this wine?'),
        description: getJsonProperty(bottle["Intro Questions"], 'description', 'Share your first impressions'),
        options: parseOptions(introQ?.choices),
        bottleNumber
      };
      
      console.log(`📝 Added intro question for bottle #${bottleNumber}: ${introQuestion.question}`);
      dynamicQuestions.push(introQuestion);
      
      // Add deep dive questions  
      const deepQ = bottleQuestions.find(q => q["Question Set Type"] === "Deep Dive");
      const deepQuestion = {
        id: 100 + (bottleNumber * 10) + 2,
        type: getQuestionType(deepQ?.["Response Type"] || "scale"),
        question: deepQ?.["Question Text"] || 
                 getJsonProperty(bottle["Deep Question"], 'question', 'How would you rate this wine overall?'),
        description: getJsonProperty(bottle["Deep Question"], 'description', 'Rate from 1 (poor) to 10 (excellent)'),
        options: parseOptions(deepQ?.choices),
        bottleNumber
      };
      
      console.log(`📝 Added deep question for bottle #${bottleNumber}: ${deepQuestion.question}`);
      dynamicQuestions.push(deepQuestion);
      
      // Add flavor questions (always multiple choice)
      const flavorQuestion = {
        id: 100 + (bottleNumber * 10) + 3,
        type: 'multipleChoice',
        question: 'What fruit flavors do you detect in this wine?',
        options: [
          'Apple', 'Pear', 'Citrus', 'Tropical', 
          'Cherry', 'Strawberry', 'Raspberry', 'Blueberry',
          'Plum', 'Blackberry', 'Currant', 'Other'
        ],
        bottleNumber
      };
      
      console.log(`📝 Added flavor question for bottle #${bottleNumber}`);
      dynamicQuestions.push(flavorQuestion);
      
      // Add final questions
      const finalQ = bottleQuestions.find(q => q["Question Set Type"] === "Final");
      const finalQuestion = {
        id: 100 + (bottleNumber * 10) + 4,
        type: getQuestionType(finalQ?.["Response Type"] || "text"),
        question: finalQ?.["Question Text"] || 
                 getJsonProperty(bottle["Final Questions"], 'question', 'Any additional thoughts about this wine?'),
        description: getJsonProperty(bottle["Final Questions"], 'description', 'Share your final impressions'),
        options: parseOptions(finalQ?.choices),
        bottleNumber
      };
      
      console.log(`📝 Added final question for bottle #${bottleNumber}: ${finalQuestion.question}`);
      dynamicQuestions.push(finalQuestion);
    });
    
    // Add final thanks screen
    dynamicQuestions.push({
      id: 9999,
      type: 'thanks',
      question: 'Thank you for participating!',
      description: 'Your responses have been recorded.'
    });
    
    console.log(`✅ Successfully created ${dynamicQuestions.length} questions for the tasting flow`);
    return dynamicQuestions;
  };

  return {
    dynamicQuestions,
    isLoading
  };
};
