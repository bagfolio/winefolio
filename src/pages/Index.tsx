
import React from 'react';
import { WineTastingProvider } from '../context/WineTastingContext';
import WineTastingFlow from '../components/WineTastingFlow';

const Index = () => {
  return (
    <WineTastingProvider>
      <WineTastingFlow />
    </WineTastingProvider>
  );
};

export default Index;
