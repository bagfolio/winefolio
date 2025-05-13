
import React from 'react';
import WineTastingFlow from '../components/WineTastingFlow';

const Index = () => {
  console.log('📝 Rendering Index page');
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-950 to-black">
      <WineTastingFlow />
    </div>
  );
};

export default Index;
