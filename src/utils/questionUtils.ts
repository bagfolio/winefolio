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
export function parseOptions(choices: any): string[] | null {
  if (!choices) return null;
  if (Array.isArray(choices)) return choices;
  if (typeof choices === 'string') {
    try {
      // Try to parse as JSON array
      const parsed = JSON.parse(choices);
      if (Array.isArray(parsed)) return parsed;
      // Otherwise, treat as comma-separated string
      return choices.split(',').map((c: string) => c.trim());
    } catch {
      // Fallback to comma-separated
      return choices.split(',').map((c: string) => c.trim());
    }
  }
  return null;
}

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
  
  bottles.forEach((bottle, bottleIndex) => {
    const bottleNumber = bottleIndex + 1;
    const bottleName = bottle.Name || bottle.name || `Bottle ${bottleNumber}`;
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
    bottleQuestions.forEach((q, qIndex) => {
      dynamicQuestions.push({
        id: 100 + (bottleNumber * 10) + qIndex + 1,
        type: q.question_type,
        question: q.question_text,
        description: q.description || '',
        options: q.options,
        bottleNumber
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
