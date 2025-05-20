import { useState, useRef } from 'react';
import { PackageInfo } from '@/types';
import { usePackageBottles } from './usePackageBottles';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { getQuestionType, parseOptions } from '@/utils/questionUtils';
import { BottleData } from '@/context/types';
import { Question } from '@/types';

export const useDataPreload = () => {
  const [preloading, setPreloading] = useState(false);
  const [preloadError, setPreloadError] = useState<string | null>(null);
  const [preloadSuccess, setPreloadSuccess] = useState(false);
  const { fetchBottlesForPackage } = usePackageBottles(null);
  const toastShownRef = useRef(false);

  const fetchQuestionsForBottles = async (bottles: BottleData[]) => {
    if (!bottles || bottles.length === 0) {
      console.log('❌ No bottles provided to fetchQuestionsForBottles');
      return { success: false, error: 'No bottles provided' };
    }

    try {
      console.log(`🍷 Fetching questions for ${bottles.length} bottles...`);

      const bottleIds = bottles.map(b => b.id);
      const bottleNames = bottles.map(b => b.name).filter(Boolean);

      if (bottleIds.length === 0) {
        console.warn('⚠️ No valid bottle IDs to fetch questions for');
        return { success: false, error: 'No valid bottle IDs' };
      }

      // Fetch all questions for these bottles
      const { data: questionsData, error: questionsError } = await (supabase as any)
        .from('questions')
        .select('*')
        .in('bottle_id', bottleIds);

      if (questionsError) {
        console.error('❌ Error fetching all questions:', questionsError);
        return { success: false, error: `Database error: ${questionsError.message}` };
      } else {
        console.log(`✅ Successfully fetched ${questionsData?.length || 0} questions from database`);
      }

      // Attach questions to bottles by bottle_id
      const bottlesWithQuestions = bottles.map(bottle => ({
        ...bottle,
        questions: (questionsData || []).filter((q: any) => String(q.bottle_id) === String(bottle.id))
      }));

      // Count questions per bottle
      const bottleQuestionCounts: Record<string, number> = {};
      bottlesWithQuestions.forEach(bottle => {
        bottleQuestionCounts[bottle.name] = bottle.questions.length;
        console.log(`🍷 Bottle "${bottle.name}": ${bottle.questions.length} questions`);
      });

      // Flatten all questions for dynamic question generation
      const allQuestions = bottlesWithQuestions.flatMap(bottle => bottle.questions);

      // Generate dynamic questions based on bottle and question data
      const dynamicQuestions = generateDynamicQuestionsFromData(bottlesWithQuestions);

      console.log('Bottles with questions:', bottlesWithQuestions);

      return {
        success: true,
        questions: dynamicQuestions,
        totalQuestions: allQuestions.length,
        bottlesCount: bottles.length,
        bottleNames,
        bottleQuestionCounts
      };
    } catch (err: any) {
      console.error('❌ Failed to fetch questions:', err);
      return { success: false, error: err.message || 'Unknown error occurred' };
    }
  };

  const generateDynamicQuestionsFromData = (bottles: BottleData[]): Question[] => {
    const dynamicQuestions: Question[] = [];

    // Helper to normalize question types
    function normalizeQuestionType(dbType: string) {
      if (dbType === 'multiple_choice') return 'multipleChoice';
      if (dbType === '1-10 sliding scale') return 'scale';
      return dbType; // fallback for 'text', etc.
    }

    // Start with signin question
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

      // Add bottle interlude
      dynamicQuestions.push({
        id: 100 + (bottleNumber * 10),
        type: 'interlude',
        question: `Now let's taste bottle #${bottleNumber}: ${bottleName}`,
        description: 'Prepare your palate for the next wine',
        bottleNumber
      });

      // Add each question for this bottle in order
      bottleQuestions.forEach((q: any, qIndex: number) => {
        const dynamicQuestion = {
          id: 100 + (bottleNumber * 10) + qIndex + 1,
          type: normalizeQuestionType(q.question_type) as 'multipleChoice' | 'scale' | 'signin' | 'text' | 'interlude' | 'thanks' | 'audio' | 'video',
          question: q.question_text,
          description: '',
          options: q.options,
          bottleNumber,
          for_host: q.for_host === true || q.for_host === 'true'
        };
        console.log('DynamicQuestion for_host:', dynamicQuestion.for_host, dynamicQuestion);
        dynamicQuestions.push(dynamicQuestion);
      });
    });

    // Add final thanks screen
    dynamicQuestions.push({
      id: 9999,
      type: 'thanks',
      question: 'Thank you for participating!',
      description: 'Your responses have been recorded.'
    });

    return dynamicQuestions;
  };

  const preloadData = async (packageInfo: PackageInfo): Promise<{success: boolean, bottles?: any[], questions?: any[], message: string}> => {
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

      // List bottles found by name
      const bottleNames = bottles.map(b => b.name).filter(Boolean);
      const bottleNamesStr = bottleNames.join(', ');

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
          bottles,
          questions: [],
          message: `Data preloaded with default questions for ${bottles.length} bottles (${bottleNamesStr}). Ready to start tasting.`
        };
      }

      const bottlesCount = questionsResult.bottlesCount || bottles.length;
      const questionsCount = questionsResult.totalQuestions || 0;

      // Generate detailed stats for the success message
      let detailedMessage = `Data preloaded successfully: ${bottlesCount} bottles and ${questionsCount} questions loaded.`;

      // Add bottle names
      detailedMessage += `\n\nBottles found: ${bottleNamesStr}`;

      // Add question details per bottle if available
      if (questionsResult.bottleQuestionCounts) {
        detailedMessage += "\n\nQuestions per bottle:";
        Object.entries(questionsResult.bottleQuestionCounts).forEach(([bottleName, count]) => {
          detailedMessage += `\n- ${bottleName}: ${count} questions`;
        });
      }

      detailedMessage += "\n\nReady to start tasting.";

      console.log(`✅ Successfully preloaded ${questionsResult.questions.length} questions for ${bottlesCount} bottles`);

      // Data preload successful
      setPreloadSuccess(true);
      setPreloading(false);
      if (!toastShownRef.current) {
        toast.success('Data preloaded successfully. Ready to start tasting.', { id: 'preload-success' });
        toastShownRef.current = true;
      }

      return {
        success: true,
        bottles: bottles,
        questions: questionsResult.questions,
        message: detailedMessage
      };

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
