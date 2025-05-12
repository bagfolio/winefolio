
export interface UserInfo {
  name: string;
  email: string;
  sessionId: string;
}

export interface WineTastingResponse {
  initialThoughts: string;
  rating: number;
  fruitFlavors: string[];
  acidityRating: number;
  additionalThoughts: string;
}

export interface Question {
  id: string;
  type: 'signin' | 'text' | 'scale' | 'multipleChoice' | 'interlude' | 'thanks';
  title?: string;
  description?: string;
  options?: string[];
}
