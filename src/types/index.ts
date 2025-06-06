import { Json } from '../integrations/supabase/types';

export interface UserInfo {
  name: string;
  email: string;
  sessionId: string;
  isHost?: boolean;
}

export interface PackageInfo {
  name: string;
  package_id: string;
  sommeliers?: string;
  tastings?: string;
  hosts?: string;
  bottles?: string;
  [key: string]: any; // Allow for additional fields from Supabase
}

export interface WineTastingResponse {
  initialThoughts: string;
  rating: number;
  fruitFlavors: string[];
  acidityRating: number;
  additionalThoughts: string;
}

export interface Question {
  id: number;
  type: 'signin' | 'text' | 'scale' | 'multipleChoice' | 'interlude' | 'thanks' | 'audio' | 'video' | 'divider';
  title?: string;
  description?: string;
  options?: string[];
  question?: string;
  bottleNumber?: number;
  mediaUrl?: string;
  sommelierName?: string;
  for_host?: boolean; // Only show to hosts
  divider?: boolean;  // Is a divider screen
}
