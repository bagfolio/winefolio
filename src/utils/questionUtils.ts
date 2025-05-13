
// Add additional utility functions for question handling

import { Json } from '../integrations/supabase/types';
import { Question } from '@/types';
import { BottleData } from '@/context/types';

// Helper function to get question type based on response type
export const getQuestionType = (responseType: string): Question['type'] => {
  switch (responseType?.toLowerCase()) {
    case 'scale':
    case '1-10':
    case 'rating':
    case 'number':
      return 'scale';
    case 'multiple choice':
    case 'multipleChoice':
    case 'multiple':
    case 'checkbox':
      return 'multipleChoice';
    case 'audio':
      return 'audio';
    case 'video':
      return 'video';
    case 'text':
    case 'textarea':
    case 'string':
      return 'text';
    case 'interlude':
      return 'interlude';
    case 'thanks':
      return 'thanks';
    case 'signin':
      return 'signin';
    default:
      return 'text'; // Default to text for unknown types
  }
};

// Helper function to parse options from choices string
export const parseOptions = (choices: string | null | undefined): string[] | undefined => {
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
export const getJsonProperty = (json: any, property: string, defaultValue: string): string => {
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

// Generate dynamic questions based on bottle data
export const getAvailableQuestions = (bottles: BottleData[]): Question[] => {
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
    
    // Add intro questions
    dynamicQuestions.push({
      id: 100 + (bottleNumber * 10) + 1,
      type: 'text',
      question: getJsonProperty(bottle["Intro Questions"] || bottle.introQuestions, 'question', 'What are your initial thoughts about this wine?'),
      description: getJsonProperty(bottle["Intro Questions"] || bottle.introQuestions, 'description', 'Share your first impressions'),
      bottleNumber
    });
    
    // Add deep dive questions  
    dynamicQuestions.push({
      id: 100 + (bottleNumber * 10) + 2,
      type: 'scale',
      question: getJsonProperty(bottle["Deep Question"] || bottle.deepQuestions, 'question', 'How would you rate this wine overall?'),
      description: getJsonProperty(bottle["Deep Question"] || bottle.deepQuestions, 'description', 'Rate from 1 (poor) to 10 (excellent)'),
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
    dynamicQuestions.push({
      id: 100 + (bottleNumber * 10) + 4,
      type: 'text',
      question: getJsonProperty(bottle["Final Questions"] || bottle.finalQuestions, 'question', 'Any additional thoughts about this wine?'),
      description: getJsonProperty(bottle["Final Questions"] || bottle.finalQuestions, 'description', 'Share your final impressions'),
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
  
  return dynamicQuestions;
};
