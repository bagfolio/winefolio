import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { BottleData } from '@/context/types';
import { PackageInfo } from '@/types';
import { toast } from 'sonner';

export const usePackageBottles = (packageInfo: PackageInfo | null) => {
  const [bottlesData, setBottlesData] = useState<BottleData[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    const fetchBottlesForPackage = async () => {
      if (!packageInfo || !packageInfo.package_id) {
        console.log('No package info available, skipping bottle fetch');
        return;
      }

      try {
        setLoading(true);
        console.log('Fetching bottles for package:', packageInfo.package_id, packageInfo);
        
        // Parse bottle names from package
        const bottleNames = packageInfo.bottles?.split(',').map(b => b.trim()) || [];
        if (bottleNames.length === 0) {
          console.warn('No bottles found in package info');
          toast.warning('No bottles found for this tasting session');
          setLoading(false);
          return;
        }
        
        console.log('Looking for these bottles:', bottleNames);

        // Fetch all bottles first to debug
        const { data: allBottles, error: allBottlesError } = await supabase
          .from('Bottles')
          .select('*');
          
        if (allBottlesError) {
          console.error('Error fetching all bottles:', allBottlesError);
        } else {
          console.log('All available bottles in database:', allBottles);
        }

        // Now fetch the specific bottles we need
        const { data: bottlesData, error } = await supabase
          .from('Bottles')
          .select('*');
          
        if (error) {
          console.error('Error fetching bottles:', error);
          toast.error('Failed to load wine bottles data');
          setLoading(false);
          return;
        }
        
        // Filter bottles by name manually since the 'in' operator might not be working as expected
        const matchedBottles = bottlesData?.filter(bottle => 
          bottleNames.some(name => bottle.Name?.toLowerCase() === name.toLowerCase())
        );
        
        if (!matchedBottles || matchedBottles.length === 0) {
          console.warn('No matching bottles found in database after filtering');
          console.log('Available bottles:', bottlesData?.map(b => b.Name));
          console.log('Looking for:', bottleNames);
          toast.warning('No matching bottles found for this tasting');
          setLoading(false);
          return;
        }
        
        console.log('Matched bottles data:', matchedBottles);
        
        // Sort bottles according to the sequence field or original package order
        const sortedBottles = matchedBottles.sort((a, b) => {
          // If sequence is available, use it
          if (a.sequence !== null && b.sequence !== null) {
            return (a.sequence || 0) - (b.sequence || 0);
          }
          
          // Otherwise sort by the order they appear in the package bottles string
          const aIndex = bottleNames.indexOf(a.Name || '');
          const bIndex = bottleNames.indexOf(b.Name || '');
          return aIndex - bIndex;
        });
        
        // Process bottles to have consistent field names
        const mappedBottles = sortedBottles.map(bottle => {
          // Create a new object with both naming conventions
          return {
            ...bottle,
            // Map the intro questions field from either format
            introQuestions: bottle["Intro Questions"],
            // Map the deep questions field from either format
            deepQuestions: bottle["Deep Question"],
            // Map the final questions field from either format
            finalQuestions: bottle["Final Questions"],
          };
        });
        
        console.log('Processed bottles with mapped fields:', mappedBottles);
        setBottlesData(mappedBottles);
      } catch (err) {
        console.error('Failed to fetch bottles:', err);
        toast.error('An error occurred while loading bottle data');
      } finally {
        setLoading(false);
      }
    };

    if (packageInfo?.package_id) {
      fetchBottlesForPackage();
    }
  }, [packageInfo]);

  return {
    bottlesData,
    loading,
    setBottlesData
  };
};
