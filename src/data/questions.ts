
import { Question } from '../types';

export const questions: Question[] = [
  {
    id: 0,
    type: 'signin',
    question: 'Please sign in to begin your wine tasting experience',
  },
  {
    id: 1,
    type: 'text',
    question: 'What do you think of the wine in your own words? Remember the more details that you jot down, the more the Somm can opine',
  },
  {
    id: 2,
    type: 'scale',
    question: 'On a scale of 1-10, how did you enjoy Pinot Noir?',
  },
  {
    id: 3,
    type: 'interlude',
    question: 'You are now moving to the deep dive section of the tasting where you will explore each wine more closely.',
  },
  {
    id: 4,
    type: 'multipleChoice',
    question: 'What fruit flavors do you smell and taste in this example?',
    options: ['Citrus driven', 'Tree fruit', 'Stone fruit'],
  },
  {
    id: 5,
    type: 'scale',
    question: 'How much did you enjoy the acidity of the wine on a scale of 1-10?',
  },
  {
    id: 6,
    type: 'text',
    question: 'Anything else the sommelier should know about what you thought of this wine? Do you want to say anything more about your previous answers?',
  },
  {
    id: 7,
    type: 'thanks',
    question: 'Thank you for completing the wine tasting! Your results will be emailed to you shortly.',
  },
];
