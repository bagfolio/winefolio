
import { Question } from '../types';

export const questions: Question[] = [
  {
    id: 0,
    type: 'signin',
    question: 'Please sign in to begin your wine tasting experience',
  },
  // First wine - initial thoughts
  {
    id: 1,
    type: 'text',
    question: 'What do you think of the first wine (Pinot Noir) in your own words?',
    bottleNumber: 1,
  },
  {
    id: 2,
    type: 'scale',
    question: 'On a scale of 1-10, how did you enjoy this Pinot Noir?',
    bottleNumber: 1,
  },
  // Sommelier audio message for first wine
  {
    id: 3,
    type: 'audio',
    title: 'Sommelier\'s Notes: Argyle Pinot Noir',
    description: 'Listen to hear special insights about this Pinot Noir',
    mediaUrl: 'https://storage.googleapis.com/kyg-recordings/Argyle.m4a',
    sommelierName: 'Alex',
    bottleNumber: 1,
  },
  // First wine - deep dive
  {
    id: 4,
    type: 'interlude',
    question: 'You are now moving to the deep dive section for the first wine (Pinot Noir).',
    bottleNumber: 1,
  },
  {
    id: 5,
    type: 'multipleChoice',
    question: 'What fruit flavors do you smell and taste in this Pinot Noir?',
    options: ['Cherry', 'Raspberry', 'Cranberry', 'Strawberry', 'Plum'],
    bottleNumber: 1,
  },
  {
    id: 6,
    type: 'scale',
    question: 'How much did you enjoy the acidity of this Pinot Noir on a scale of 1-10?',
    bottleNumber: 1,
  },
  {
    id: 7,
    type: 'text',
    question: 'Anything else the sommelier should know about what you thought of this Pinot Noir?',
    bottleNumber: 1,
  },
  // Interlude between wines
  {
    id: 8,
    type: 'interlude',
    question: 'Now we\'ll move on to the second wine. Take a moment to clear your palate before continuing.',
    description: 'Please drink some water and perhaps have a neutral snack like crackers before the next wine.',
  },
  // Second wine - initial thoughts
  {
    id: 9,
    type: 'text',
    question: 'What do you think of the second wine (Chardonnay) in your own words?',
    bottleNumber: 2,
  },
  {
    id: 10,
    type: 'scale',
    question: 'On a scale of 1-10, how did you enjoy this Chardonnay?',
    bottleNumber: 2,
  },
  // Sommelier video message for second wine
  {
    id: 11,
    type: 'video',
    title: 'Sommelier\'s Video Notes',
    description: 'Watch the sommelier explain the unique qualities of this Chardonnay',
    mediaUrl: 'https://storage.googleapis.com/kyg-recordings/IMG_3786.mov',
    sommelierName: 'Michelle',
    bottleNumber: 2,
  },
  // Second wine - deep dive
  {
    id: 12,
    type: 'interlude',
    question: 'You are now moving to the deep dive section for the second wine (Chardonnay).',
    bottleNumber: 2,
  },
  {
    id: 13,
    type: 'multipleChoice',
    question: 'What fruit flavors do you smell and taste in this Chardonnay?',
    options: ['Citrus driven', 'Green apple', 'Pear', 'Peach', 'Tropical fruits'],
    bottleNumber: 2,
  },
  {
    id: 14,
    type: 'scale',
    question: 'How much did you enjoy the acidity of this Chardonnay on a scale of 1-10?',
    bottleNumber: 2,
  },
  {
    id: 15,
    type: 'text',
    question: 'Anything else the sommelier should know about what you thought of this Chardonnay?',
    bottleNumber: 2,
  },
  // Thanks screen
  {
    id: 16,
    type: 'thanks',
    question: 'Thank you for completing the wine tasting! Your results will be emailed to you shortly.',
  },
];
