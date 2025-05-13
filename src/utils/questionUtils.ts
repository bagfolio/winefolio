
import { BottleData } from "@/context/types";
import { Question } from "@/types";

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
      question: bottle.introQuestions?.question || 'What are your initial thoughts about this wine?',
      description: bottle.introQuestions?.description || 'Share your first impressions',
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
      question: bottle.finalQuestions?.question || 'Any additional thoughts about this wine?',
      description: bottle.finalQuestions?.description || 'Share your final impressions',
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
