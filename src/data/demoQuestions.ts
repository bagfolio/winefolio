
import { Question } from '@/types';

export const demoQuestions: Question[] = [
  {
    id: 1,
    type: 'signin',
    title: 'Welcome to the Wine Tasting Demo',
    description: 'Please sign in to experience all slide types'
  },
  
  // Divider slide
  {
    id: 2,
    type: 'divider',
    title: 'Starting the Demo',
    divider: true
  },
  
  // Text question example
  {
    id: 3,
    type: 'text',
    question: 'What are your initial thoughts about this wine?',
    description: 'This is a text question where users can type free-form responses',
    bottleNumber: 1
  },
  
  // Scale question example
  {
    id: 4,
    type: 'scale',
    question: 'How would you rate this wine overall?',
    description: 'This is a scale question where users can select a value from 0-10',
    bottleNumber: 1
  },
  
  // Multiple choice question example
  {
    id: 5,
    type: 'multipleChoice',
    question: 'What fruit flavors do you detect in this wine?',
    options: [
      'Apple', 'Pear', 'Citrus', 'Tropical', 
      'Cherry', 'Strawberry', 'Raspberry', 'Blueberry'
    ],
    description: 'This is a multiple choice question where users can select multiple options',
    bottleNumber: 1
  },
  
  // Audio message example
  {
    id: 6,
    type: 'audio',
    title: 'Audio Message Example',
    description: 'This demonstrates how audio messages appear in the flow',
    mediaUrl: 'https://actions.google.com/sounds/v1/alarms/digital_watch_alarm_long.ogg',
    sommelierName: 'Demo Sommelier',
    bottleNumber: 1
  },
  
  // Video message example
  {
    id: 7,
    type: 'video',
    title: 'Video Message Example',
    description: 'This demonstrates how video messages appear in the flow',
    mediaUrl: 'https://storage.googleapis.com/webfundamentals-assets/videos/chrome.mp4',
    sommelierName: 'Demo Sommelier',
    bottleNumber: 1
  },
  
  // Interlude example
  {
    id: 8,
    type: 'interlude',
    question: 'Let\'s move on to the next section',
    description: 'This is an interlude slide that separates sections of the tasting',
    bottleNumber: 2
  },
  
  // Thanks screen at the end
  {
    id: 9,
    type: 'thanks',
    question: 'Demo Complete!',
    description: 'You\'ve seen all the slide types available in the wine tasting app'
  }
];
