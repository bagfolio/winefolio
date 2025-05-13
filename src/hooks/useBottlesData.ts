
import { useState, useEffect } from 'react';
import { PackageInfo } from '@/types';
import { BottleData } from '@/context/types';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export const useBottlesData = (packageInfo: PackageInfo | null) => {
  const [bottlesData, setBottlesData] = useState<BottleData[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  
  // Debug function to fetch all bottles
  const fetchAllBottles = async () => {
    try {
      const { data, error } = await supabase
        .from('Bottles')
        .select('*');
      
      if (error) {
        console.error('Error fetching all bottles:', error);
        return null;
      }
      
      console.log('All bottles in database:', data);
      return data;
    } catch (err) {
      console.error('Failed to fetch all bottles:', err);
      return null;
    }
  };

  // Debug Supabase connection on component mount
  useEffect(() => {
    const checkConnection = async () => {
      try {
        // Try a simple query to test the connection
        const { data: packages, error } = await supabase
          .from('Packages')
          .select('*');
        
        if (error) {
          console.error('Supabase connection test failed:', error);
          toast.error('Database connection failed');
        } else {
          console.log('Supabase connection test passed. Raw packages data:', packages);
          
          // Test bottle fetching
          const bottles = await fetchAllBottles();
          if (bottles) {
            console.log('Successfully fetched bottles. Count:', bottles.length);
          }
        }
      } catch (err) {
        console.error('Error testing Supabase connection:', err);
      }
    };
    
    checkConnection();
  }, []);

  return {
    bottlesData,
    loading,
    setLoading,
    setBottlesData
  };
};
