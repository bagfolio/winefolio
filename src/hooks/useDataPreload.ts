
import { useState } from 'react';
import { PackageInfo } from '@/types';
import { usePackageBottles } from './usePackageBottles';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { getQuestionType, parseOptions, getJsonProperty } from '@/utils/questionUtils';
import { BottleData } from '@/context/types';
import { Question } from '@/types';

export const useDataPreload = () => {
  const [preloading, setPreloading] = useState(false);
  const [preloadError, setPreloadError] = useState<string | null>(null);
  const [preloadSuccess, setPreloadSuccess] = useState(false);
  const { fetchBottlesForPackage } = usePackageBottles(null);

  const fetchQuestionsForBottles = async (bottles: BottleData[]) => {
    if (!bottles || bottles.length === 0) {
      console.log('❌ No bottles provided to fetchQuestionsForBottles');
      return { success: false, error: 'No bottles provided' };
    }
    
    try {
      console.log(`🍷 Fetching questions for ${bottles.length} bottles...`);
      
      // Collect all bottle names for the query
      const bottleNames = bottles.map(bottle => bottle.Name).filter(name => name !== null) as string[];
      
      if (bottleNames.length === 0) {
        console.warn('⚠️ No valid bottle names to fetch questions for');
        return { success: false, error: 'No valid bottle names' };
      }
      
      console.log('🍾 Fetching questions for bottles:', bottleNames);
      
      // Fetch all questions to debug
      console.log('🔍 Fetching all available questions from database...');
      const { data: allQuestions, error: allQuestionsError } = await supabase
        .from('Questions')
        .select('*');
        
      if (allQuestionsError) {
        console.error('❌ Error fetching all questions:', allQuestionsError);
        return { success: false, error: `Database error: ${allQuestionsError.message}` };
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
        // Still a success since we can use default questions
        return { 
          success: true, 
          questions: [], 
          message: 'No specific questions found for these bottles, will use default questions' 
        };
      }
      
      // Generate dynamic questions based on bottle and question data
      const dynamicQuestions = generateDynamicQuestionsFromData(bottles, relevantQuestions);
      
      return { success: true, questions: dynamicQuestions };
    } catch (err: any) {
      console.error('❌ Failed to fetch questions:', err);
      return { success: false, error: err.message || 'Unknown error occurred' };
    }
  };

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
      const introType = getQuestionType(introQ?.["Response Type"] || "text") as Question['type'];
      const introQuestion: Question = {
        id: 100 + (bottleNumber * 10) + 1,
        type: introType,
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
      const deepType = getQuestionType(deepQ?.["Response Type"] || "scale") as Question['type'];
      const deepQuestion: Question = {
        id: 100 + (bottleNumber * 10) + 2,
        type: deepType,
        question: deepQ?.["Question Text"] || 
                 getJsonProperty(bottle["Deep Question"], 'question', 'How would you rate this wine overall?'),
        description: getJsonProperty(bottle["Deep Question"], 'description', 'Rate from 1 (poor) to 10 (excellent)'),
        options: parseOptions(deepQ?.choices),
        bottleNumber
      };
      
      console.log(`📝 Added deep question for bottle #${bottleNumber}: ${deepQuestion.question}`);
      dynamicQuestions.push(deepQuestion);
      
      // Add flavor questions (always multiple choice)
      const flavorQuestion: Question = {
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
      const finalType = getQuestionType(finalQ?.["Response Type"] || "text") as Question['type'];
      const finalQuestion: Question = {
        id: 100 + (bottleNumber * 10) + 4,
        type: finalType,
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

  const preloadData = async (packageInfo: PackageInfo): Promise<{success: boolean, message: string}> => {
    setPreloading(true);
    setPreloadError(null);
    setPreloadSuccess(false);
    
    console.log('🔄 Preloading data for package:', packageInfo.package_id);
    
    try {
      // Step 1: Fetch bottles
      console.log('🍷 Step 1: Fetching bottles...');
      const bottlesResult = await fetchBottlesForPackage(packageInfo);
      
      if (!bottlesResult.success) {
        console.error('❌ Failed to fetch bottles:', bottlesResult.error);
        setPreloadError(`Failed to fetch bottles: ${bottlesResult.error}`);
        setPreloading(false);
        toast.error(`Data preload failed: ${bottlesResult.error}`);
        return { success: false, message: `Failed to fetch bottles: ${bottlesResult.error}` };
      }
      
      const bottles = bottlesResult.bottles;
      console.log(`✅ Successfully fetched ${bottles.length} bottles`);
      
      // Step 2: Fetch questions
      console.log('📝 Step 2: Fetching questions for bottles...');
      const questionsResult = await fetchQuestionsForBottles(bottles);
      
      if (!questionsResult.success) {
        console.error('❌ Failed to fetch questions:', questionsResult.error);
        // Not treating this as fatal since we can use default questions
        console.log('⚠️ Will use default questions instead');
        toast.warning('Using default questions for the tasting');
        setPreloadSuccess(true);
        setPreloading(false);
        return { 
          success: true, 
          message: 'Data preloaded with default questions. Ready to start tasting.'
        };
      }
      
      console.log(`✅ Successfully preloaded ${questionsResult.questions.length} questions`);
      
      // Data preload successful
      setPreloadSuccess(true);
      setPreloading(false);
      toast.success('Data preloaded successfully. Ready to start tasting.');
      return { success: true, message: 'Data preloaded successfully. Ready to start tasting.' };
      
    } catch (error: any) {
      console.error('❌ Error during data preload:', error);
      setPreloadError(error.message || 'Unknown error occurred during data preload');
      setPreloading(false);
      toast.error('Failed to preload data. Please try again.');
      return { success: false, message: error.message || 'Unknown error occurred during data preload' };
    }
  };

  return {
    preloadData,
    preloading,
    preloadError,
    preloadSuccess
  };
};
