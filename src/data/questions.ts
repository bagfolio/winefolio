import { Question } from '@/types';

/**
 * Static fallback questions in case dynamic questions can't be generated
 */
export const questions: Question[] = [
  {
    id: 1,
    type: 'signin',
    question: 'Welcome to the Wine Tasting Experience',
    description: 'Please sign in to get started'
  },
  
  // Bottle 1 Questions
  {
    id: 110,
    type: 'interlude',
    question: 'Now let\'s taste the first wine',
    description: 'Prepare your palate for the first wine',
    bottleNumber: 1
  },
  {
    id: 111,
    type: 'text',
    question: 'What are your initial thoughts about this wine?',
    description: 'Share your first impressions',
    bottleNumber: 1
  },
  {
    id: 112,
    type: 'scale',
    question: 'How would you rate this wine overall?',
    description: 'Rate from 1 (poor) to 10 (excellent)',
    bottleNumber: 1
  },
  {
    id: 113,
    type: 'multipleChoice',
    question: 'What fruit flavors do you detect in this wine?',
    options: [
      'Apple', 'Pear', 'Citrus', 'Tropical', 
      'Cherry', 'Strawberry', 'Raspberry', 'Blueberry',
      'Plum', 'Blackberry', 'Currant', 'Other'
    ],
    bottleNumber: 1
  },
  {
    id: 114,
    type: 'text',
    question: 'Any additional thoughts about this wine?',
    description: 'Share your final impressions',
    bottleNumber: 1
  },
  
  // Divider for Intro
  {
    id: 10,
    type: 'divider',
    title: 'Intro Questions',
    divider: true
  },
  // Regular intro question
  {
    id: 11,
    type: 'text',
    question: 'What do you notice first?',
    bottleNumber: 1
  },
  // Host-only audio message
  {
    id: 12,
    type: 'audio',
    question: 'Host briefing audio',
    bottleNumber: 1,
    for_host: true
  },
  // Divider for Deep Dive
  {
    id: 20,
    type: 'divider',
    title: 'Deep Dive',
    divider: true
  },
  // Regular deep dive question
  {
    id: 21,
    type: 'text',
    question: 'Describe the acidity.',
    bottleNumber: 1
  },
  // Host-only video message
  {
    id: 22,
    type: 'video',
    question: 'Host video message',
    bottleNumber: 1,
    for_host: true
  },
  // Divider for Final
  {
    id: 30,
    type: 'divider',
    title: 'Final Questions',
    divider: true
  },
  // Regular final question
  {
    id: 31,
    type: 'text',
    question: 'Any final thoughts?',
    bottleNumber: 1
  },
  
  // Thank you screen
  {
    id: 9999,
    type: 'thanks',
    question: 'Thank you for participating!',
    description: 'Your responses have been recorded.'
  }
];
