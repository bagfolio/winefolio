
import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Wine } from 'lucide-react';

const LoadingScreen = () => {
  const [fillLevel, setFillLevel] = useState(0);
  
  useEffect(() => {
    const timer = setTimeout(() => {
      setFillLevel(100);
    }, 500);
    
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-purple-950 bg-opacity-95 backdrop-blur-sm">
      <div className="relative flex flex-col items-center">
        <div className="relative mb-12">
          {/* Wine bottle */}
          <motion.div 
            className="absolute -top-24 left-1/2 -ml-6"
            initial={{ y: -20, rotate: -20 }}
            animate={{ y: 0, rotate: -45 }}
            transition={{ duration: 1.5, ease: "easeInOut" }}
          >
            <Wine size={48} className="text-purple-300" />
          </motion.div>
          
          {/* Wine glass with stem */}
          <div className="relative w-20 h-32">
            {/* Glass bowl */}
            <div className="absolute top-0 left-0 w-20 h-14 border-2 border-white/30 rounded-b-full overflow-hidden">
              {/* Wine filling animation */}
              <motion.div 
                className="absolute bottom-0 w-full bg-gradient-to-tr from-purple-800 to-purple-500"
                initial={{ height: "0%" }}
                animate={{ height: `${fillLevel}%` }}
                transition={{ duration: 2, ease: "easeOut", delay: 0.5 }}
              />
            </div>
            
            {/* Glass stem */}
            <div className="absolute top-14 left-1/2 -ml-1 w-2 h-12 bg-white/30"></div>
            
            {/* Glass base */}
            <div className="absolute bottom-0 left-1/2 -ml-5 w-10 h-2 bg-white/30 rounded-full"></div>
          </div>
        </div>
        
        <motion.h1 
          className="text-3xl font-bold text-white mt-8 tracking-tight"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 1 }}
        >
          Sommelier Session
        </motion.h1>
        
        <motion.div 
          className="mt-6 flex gap-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1, duration: 1 }}
        >
          {[0, 1, 2].map((i) => (
            <motion.div 
              key={i}
              className="w-2 h-2 rounded-full bg-white/60"
              animate={{
                scale: [1, 1.5, 1],
                opacity: [0.6, 1, 0.6],
              }}
              transition={{
                repeat: Infinity,
                repeatType: "loop",
                duration: 1.5,
                delay: i * 0.3,
                ease: "easeInOut",
              }}
            />
          ))}
        </motion.div>
      </div>
    </div>
  );
};

export default LoadingScreen;
