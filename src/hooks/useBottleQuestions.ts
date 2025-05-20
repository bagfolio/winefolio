import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { BottleData } from '@/context/types';
import { Question } from '@/types';
import { toast } from 'sonner';

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
        // Fetch all questions from the correct table
        const { data: allQuestions, error: allQuestionsError } = await (supabase as any)
          .from('questions')
          .select('*');
        if (allQuestionsError) {
          console.error('❌ Error fetching all questions:', allQuestionsError);
          toast.error('Failed to load question data');
          setIsLoading(false);
          return;
        } else {
          console.log(`✅ Successfully fetched ${allQuestions?.length || 0} questions from database`);
        }
        // Attach questions to bottles by bottle_id
        const bottlesWithQuestions = bottles.map(bottle => ({
          ...bottle,
          questions: (allQuestions || []).filter((q: any) => String(q.bottle_id) === String(bottle.id))
        }));
        // Generate dynamic questions based on bottle and question data
        const mappedQuestions = generateDynamicQuestionsFromData(bottlesWithQuestions);
        setDynamicQuestions(mappedQuestions);
      } catch (err) {
        console.error('❌ Failed to fetch questions:', err);
        toast.error('An error occurred while loading questions');
        setDynamicQuestions([]);
      } finally {
        setIsLoading(false);
      }
    };
    if (bottles.length > 0) {
      fetchQuestionsForBottles();
    }
  }, [bottles]);

  // Function to normalize question types from DB to UI
  function normalizeQuestionType(dbType: string) {
    if (dbType === 'multiple_choice') return 'multipleChoice';
    if (dbType === '1-10 sliding scale') return 'scale';
    return dbType; // fallback for 'text', etc.
  }

  // Function to generate dynamic questions based on bottle and question data
  const generateDynamicQuestionsFromData = (bottles: BottleData[]): Question[] => {
    const dynamicQuestions: Question[] = [];
    // Start with signin question
    dynamicQuestions.push({
      id: 1,
      type: 'signin',
      question: 'Welcome to the Wine Tasting Experience',
      description: 'Please sign in to get started'
    });
    bottles.forEach((bottle, bottleIndex) => {
      const bottleNumber = bottleIndex + 1;
      const bottleName = bottle.name || bottle.Name || `Bottle ${bottleNumber}`;
      // Add bottle interlude
      dynamicQuestions.push({
        id: 100 + (bottleNumber * 10),
        type: 'interlude',
        question: `Now let's taste bottle #${bottleNumber}: ${bottleName}`,
        description: 'Prepare your palate for the next wine',
        bottleNumber
      });
      // Add each question for this bottle in order
      const bottleQuestions = bottle.questions || [];
      bottleQuestions.forEach((q: any, qIndex: number) => {
        dynamicQuestions.push({
          id: 100 + (bottleNumber * 10) + qIndex + 1,
          type: normalizeQuestionType(q.question_type) as 'multipleChoice' | 'scale' | 'signin' | 'text' | 'interlude' | 'thanks' | 'audio' | 'video',
          question: q.question_text,
          description: '',
          options: q.options,
          bottleNumber,
          for_host: q.for_host === true || q.for_host === 'true' // ensure boolean
        });
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

  return {
    dynamicQuestions,
    isLoading
  };
};
