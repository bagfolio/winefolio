
// Add additional utility functions for question handling

import { Json } from '../integrations/supabase/types';
import { Question } from '@/types';

// Helper function to get question type based on response type
export const getQuestionType = (responseType: string): Question['type'] => {
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
