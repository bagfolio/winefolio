
import React, { createContext, useEffect, useState, useContext } from 'react';
import { Toaster } from '@/components/ui/sonner';
import { supabase } from '@/integrations/supabase/client';

type SupabaseContextType = {
  isInitialized: boolean;
  connectionError: Error | null;
};

const SupabaseContext = createContext<SupabaseContextType>({
  isInitialized: false,
  connectionError: null,
});

export const useSupabase = () => useContext(SupabaseContext);

export const SupabaseProvider = ({ children }: { children: React.ReactNode }) => {
  const [isInitialized, setIsInitialized] = useState(false);
  const [connectionError, setConnectionError] = useState<Error | null>(null);

  useEffect(() => {
    const initializeSupabase = async () => {
      try {
        // Perform a simple query to verify connection
        const { data, error } = await supabase
          .from('Packages')
          .select('name')
          .limit(1);
        
        if (error) {
          console.error('Supabase connection error:', error);
          setConnectionError(error);
        } else {
          console.log('Supabase connection established successfully');
          setIsInitialized(true);
        }
      } catch (err) {
        console.error('Failed to initialize Supabase:', err);
        setConnectionError(err instanceof Error ? err : new Error('Unknown error initializing Supabase'));
      }
    };

    initializeSupabase();
  }, []);

  return (
    <SupabaseContext.Provider value={{ isInitialized, connectionError }}>
      {children}
      <Toaster />
    </SupabaseContext.Provider>
  );
};
