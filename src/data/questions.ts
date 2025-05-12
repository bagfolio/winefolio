
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
  // First wine - deep dive
  {
    id: 3,
    type: 'interlude',
    question: 'You are now moving to the deep dive section for the first wine (Pinot Noir).',
    bottleNumber: 1,
  },
  {
    id: 4,
    type: 'multipleChoice',
    question: 'What fruit flavors do you smell and taste in this Pinot Noir?',
    options: ['Cherry', 'Raspberry', 'Cranberry', 'Strawberry', 'Plum'],
    bottleNumber: 1,
  },
  {
    id: 5,
    type: 'scale',
    question: 'How much did you enjoy the acidity of this Pinot Noir on a scale of 1-10?',
    bottleNumber: 1,
  },
  {
    id: 6,
    type: 'text',
    question: 'Anything else the sommelier should know about what you thought of this Pinot Noir?',
    bottleNumber: 1,
  },
  // Interlude between wines
  {
    id: 7,
    type: 'interlude',
    question: 'Now we'll move on to the second wine. Take a moment to clear your palate before continuing.',
    description: 'Please drink some water and perhaps have a neutral snack like crackers before the next wine.',
  },
  // Second wine - initial thoughts
  {
    id: 8,
    type: 'text',
    question: 'What do you think of the second wine (Chardonnay) in your own words?',
    bottleNumber: 2,
  },
  {
    id: 9,
    type: 'scale',
    question: 'On a scale of 1-10, how did you enjoy this Chardonnay?',
    bottleNumber: 2,
  },
  // Second wine - deep dive
  {
    id: 10,
    type: 'interlude',
    question: 'You are now moving to the deep dive section for the second wine (Chardonnay).',
    bottleNumber: 2,
  },
  {
    id: 11,
    type: 'multipleChoice',
    question: 'What fruit flavors do you smell and taste in this Chardonnay?',
    options: ['Citrus driven', 'Green apple', 'Pear', 'Peach', 'Tropical fruits'],
    bottleNumber: 2,
  },
  {
    id: 12,
    type: 'scale',
    question: 'How much did you enjoy the acidity of this Chardonnay on a scale of 1-10?',
    bottleNumber: 2,
  },
  {
    id: 13,
    type: 'text',
    question: 'Anything else the sommelier should know about what you thought of this Chardonnay?',
    bottleNumber: 2,
  },
  // Thanks screen
  {
    id: 14,
    type: 'thanks',
    question: 'Thank you for completing the wine tasting! Your results will be emailed to you shortly.',
  },
];
