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
      console.log('🔍 Fetching all bottles for debugging...');
      const { data, error } = await supabase
        .from('bottles')
        .select('*');
      
      if (error) {
        console.error('❌ Error fetching all bottles:', error);
        return null;
      }
      
      console.log('🍾 All bottles in database:', data?.map(b => b.Name) || []);
      console.log('🔢 Total bottles found:', data?.length || 0);
      return data;
    } catch (err) {
      console.error('❌ Failed to fetch all bottles:', err);
      return null;
    }
  };

  // Debug Supabase connection on component mount
  useEffect(() => {
    const checkConnection = async () => {
      try {
        setLoading(true);
        console.log('🔌 Testing Supabase connection...');
        
        // Try a simple query to test the connection
        const { data: packages, error } = await supabase
          .from('packages')
          .select('*');
        
        if (error) {
          console.error('❌ Supabase connection test failed:', error);
          toast.error('Database connection failed');
        } else {
          console.log('✅ Supabase connection test passed. Packages found:', packages?.length || 0);
          
          // Test bottle fetching
          const bottles = await fetchAllBottles();
          if (bottles) {
            console.log('✅ Successfully fetched bottles. Count:', bottles.length);
          }
        }
      } catch (err) {
        console.error('❌ Error testing Supabase connection:', err);
      } finally {
        setLoading(false);
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
