
import React from 'react';
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { HelpCircle } from 'lucide-react';

interface WineFaqProps {
  currentQuestionId: number;
}

// Wine terminology and explanations
const wineTerms: Record<number, { term: string; explanation: string }[]> = {
  2: [
    { term: 'Overall Rating', explanation: 'Your subjective enjoyment of the wine considering all aspects including taste, aroma, and mouthfeel.' },
  ],
  4: [
    { term: 'Citrus Driven', explanation: 'Flavors resembling lemon, lime, grapefruit or orange, often found in crisp white wines.' },
    { term: 'Tree Fruit', explanation: 'Flavors like apple, pear or quince that give a familiar, sometimes slightly sweet characteristic.' },
    { term: 'Stone Fruit', explanation: 'Flavors of peach, nectarine, apricot or plum that typically indicate a richer white wine.' },
  ],
  5: [
    { term: 'Acidity', explanation: 'The tartness or crispness of a wine. Higher acidity makes wine taste fresh and lively, while lower acidity makes it feel smoother and rounder.' },
    { term: 'Mouthfeel', explanation: 'The physical sensations the wine creates in your mouth, such as weight, texture, and the impression of dryness or sweetness.' },
  ],
};

const WineFaq: React.FC<WineFaqProps> = ({ currentQuestionId }) => {
  const terms = wineTerms[currentQuestionId] || [];
  
  if (terms.length === 0) return null;
  
  return (
    <div className="flex gap-2 mb-6 justify-center">
      {terms.map((item, index) => (
        <Popover key={index}>
          <PopoverTrigger asChild>
            <button className="flex items-center gap-1 rounded-full bg-purple-800/50 border border-purple-700/50 px-3 py-1 text-sm text-white hover:bg-purple-700/60 transition-colors">
              <HelpCircle size={14} />
              <span>{item.term}</span>
            </button>
          </PopoverTrigger>
          <PopoverContent className="w-80 bg-purple-950/90 border-purple-800 text-white backdrop-blur-lg">
            <h4 className="font-medium mb-2 text-purple-300">{item.term}</h4>
            <p className="text-sm text-gray-200">{item.explanation}</p>
          </PopoverContent>
        </Popover>
      ))}
    </div>
  );
};

export default WineFaq;
