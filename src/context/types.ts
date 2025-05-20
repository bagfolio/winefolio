import { UserInfo, WineTastingResponse, PackageInfo } from '../types';
import { Json } from '../integrations/supabase/types';

export interface BottleData {
  name: string;
  bottle_image_url: string | null;
  sequence: number | null;
  questions?: any[];
  [key: string]: any;
}

export interface WineTastingContextType {
  currentQuestionIndex: number;
  userInfo: UserInfo | null;
  packageInfo: PackageInfo | null;
  bottlesData: BottleData[];
  wineTastingResponse: {
    [bottleNumber: number]: WineTastingResponse;
  };
  loading: boolean;
  setLoading: (isLoading: boolean) => void;
  setUserInfo: (info: UserInfo) => void;
  setPackageInfo: (info: PackageInfo) => void;
  setBottlesData: (bottles: BottleData[]) => void;
  setInitialThoughts: (thoughts: string, bottleNumber?: number) => void;
  setRating: (rating: number, bottleNumber?: number) => void;
  setFruitFlavors: (flavors: string[], bottleNumber?: number) => void;
  setAcidityRating: (rating: number, bottleNumber?: number) => void;
  setAdditionalThoughts: (thoughts: string, bottleNumber?: number) => void;
  nextQuestion: () => void;
  previousQuestion: () => void;
  submitResponses: () => void;
  dynamicQuestions: any[];
  setDynamicQuestions: (questions: any[]) => void;
}
