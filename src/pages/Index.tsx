
import React from 'react';
import { WineTastingProvider } from '../context/WineTastingContext';
import WineTastingFlow from '../components/WineTastingFlow';

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-900 to-purple-950">
      <WineTastingProvider>
        <WineTastingFlow />
      </WineTastingProvider>
    </div>
  );
};

export default Index;
