
import { BottleData } from "@/context/types";
import { Question } from "@/types";
import { Json } from "@/integrations/supabase/types";

/**
 * Helper function to safely extract a string property from a Json object
 */
const getJsonProperty = (json: Json | null, property: string, defaultValue: string): string => {
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

/**
 * Dynamically generates questions based on available bottles data
 */
export const generateBottleQuestions = (bottlesData: BottleData[]): Question[] => {
  const dynamicQuestions: Question[] = [];
  
  // Start with signin question
  dynamicQuestions.push({
    id: 1,
    type: 'signin',
    question: 'Welcome to the Wine Tasting Experience',
    description: 'Please sign in to get started'
  });
  
  // Generate questions for each bottle
  bottlesData.forEach((bottle, bottleIndex) => {
    const bottleNumber = bottleIndex + 1;
    
    // Add bottle interlude
    dynamicQuestions.push({
      id: 100 + (bottleNumber * 10),
      type: 'interlude',
      question: `Now let's taste bottle #${bottleNumber}: ${bottle.Name}`,
      description: 'Prepare your palate for the next wine',
      bottleNumber
    });
    
    // Initial thoughts question
    dynamicQuestions.push({
      id: 100 + (bottleNumber * 10) + 1,
      type: 'text',
      question: getJsonProperty(bottle.introQuestions, 'question', 'What are your initial thoughts about this wine?'),
      description: getJsonProperty(bottle.introQuestions, 'description', 'Share your first impressions'),
      bottleNumber
    });
    
    // Rating question
    dynamicQuestions.push({
      id: 100 + (bottleNumber * 10) + 2,
      type: 'scale',
      question: 'How would you rate this wine overall?',
      description: 'Rate from 1 (poor) to 10 (excellent)',
      bottleNumber
    });
    
    // Fruit flavors question
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
    
    // Additional thoughts
    dynamicQuestions.push({
      id: 100 + (bottleNumber * 10) + 4,
      type: 'text',
      question: getJsonProperty(bottle.finalQuestions, 'question', 'Any additional thoughts about this wine?'),
      description: getJsonProperty(bottle.finalQuestions, 'description', 'Share your final impressions'),
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

/**
 * Gets the next available question to display
 */
export const getAvailableQuestions = (bottlesData: BottleData[]): Question[] => {
  if (!bottlesData || bottlesData.length === 0) {
    // Return some default questions if no bottles are available
    return [
      {
        id: 1,
        type: 'signin',
        question: 'Welcome to the Wine Tasting Experience',
        description: 'Please sign in to get started'
      },
      {
        id: 9999,
        type: 'thanks',
        question: 'Thank you for participating!',
        description: 'Your responses have been recorded.'
      }
    ];
  }
  
  return generateBottleQuestions(bottlesData);
};

