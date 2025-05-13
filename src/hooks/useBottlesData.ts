
import { useState, useEffect } from 'react';
import { PackageInfo } from '../types';
import { BottleData } from '../context/types';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';

export const useBottlesData = (packageInfo: PackageInfo | null) => {
  const [bottlesData, setBottlesData] = useState<BottleData[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const fetchBottlesData = async () => {
      if (!packageInfo || !packageInfo.bottles) {
        console.log('No package info or bottles available');
        return;
      }
      
      setLoading(true);
      try {
        // Parse bottle names from the package
        const bottleNames = packageInfo.bottles.split(',').map(name => name.trim());
        console.log('Fetching bottles with names:', bottleNames);
        
        if (bottleNames.length === 0) {
          console.log('No bottle names found in package');
          setLoading(false);
          return;
        }
        
        // Fetch bottles data
        const { data: bottles, error } = await supabase
          .from('Bottles')
          .select('*')
          .in('Name', bottleNames)
          .order('sequence', { ascending: true });
        
        if (error) {
          console.error('Error fetching bottles:', error);
          toast({
            title: 'Error',
            description: 'Failed to load bottle information.',
            variant: 'destructive',
          });
          setLoading(false);
          return;
        }
        
        console.log('Fetched bottles:', bottles);
        
        if (!bottles || bottles.length === 0) {
          console.log('No bottles found with the provided names:', bottleNames);
          // If no bottles are found using direct matching, try using ILIKE for case-insensitive matching
          const { data: fallbackBottles, error: fallbackError } = await supabase
            .from('Bottles')
            .select('*')
            .or(bottleNames.map(name => `Name.ilike.${name}`).join(','));
            
          if (fallbackError || !fallbackBottles || fallbackBottles.length === 0) {
            toast({
              title: 'Warning',
              description: 'No wine bottle information found for this tasting session.',
            });
            setLoading(false);
            return;
          }
          
          console.log('Found bottles using fallback search:', fallbackBottles);
          setBottlesData(fallbackBottles);
        } else {
          setBottlesData(bottles);
        }
      } catch (error) {
        console.error('Error in fetchBottlesData:', error);
        toast({
          title: 'Error',
          description: 'Failed to load tasting information.',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchBottlesData();
  }, [packageInfo, toast]);

  return { bottlesData, loading, setLoading };
};
