
export interface UserInfo {
  name: string;
  email: string;
}

export interface WineTastingResponse {
  userId?: string;
  initialThoughts: string;
  rating: number;
  fruitFlavors: string[];
  acidityRating: number;
  additionalThoughts: string;
}

export interface Question {
  id: number;
  type: 'signin' | 'text' | 'scale' | 'multipleChoice' | 'interlude' | 'thanks';
  question: string;
  options?: string[];
}
