import React, { createContext, useEffect, useState, useContext, useRef } from 'react';
import { Toaster } from '@/components/ui/sonner';
import { toast } from 'sonner';
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
  const connectionToastShownRef = useRef(false);

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
          toast.error('Failed to connect to the database');
        } else {
          console.log('Supabase connection established successfully');
          setIsInitialized(true);
        }
      } catch (err) {
        console.error('Failed to initialize Supabase:', err);
        const error = err instanceof Error ? err : new Error('Unknown error initializing Supabase');
        setConnectionError(error);
        toast.error('Failed to initialize the database connection');
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
