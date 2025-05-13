import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { BottleData } from '@/context/types';
import { PackageInfo } from '@/types';
import { toast } from 'sonner';

export const usePackageBottles = (packageInfo: PackageInfo | null) => {
  const [bottlesData, setBottlesData] = useState<BottleData[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchBottlesForPackage = async (packageInfoToUse: PackageInfo) => {
    if (!packageInfoToUse || !packageInfoToUse.package_id) {
      console.log('📦 No package info available, skipping bottle fetch');
      setError('No package information available');
      return { success: false, error: 'No package information available' };
    }

    try {
      setLoading(true);
      setError(null);
      console.log('📦 FETCHING BOTTLES - Package ID:', packageInfoToUse.package_id);
      console.log('📦 Package details:', JSON.stringify(packageInfoToUse, null, 2));
      
      // Parse bottle names from package
      const bottleNames = packageInfoToUse.bottles?.split(',').map(b => b.trim()).filter(Boolean) || [];
      if (bottleNames.length === 0) {
        console.warn('⚠️ No bottles found in package info');
        toast.warning('No bottles found for this tasting session');
        setLoading(false);
        setError('No bottles found in package information');
        return { success: false, error: 'No bottles found in package information' };
      }
      
      console.log('🍷 Looking for these bottles:', bottleNames);

      // Fetch all bottles first to debug
      console.log('🔍 Fetching all bottles from database...');
      const { data: allBottles, error: allBottlesError } = await supabase
        .from('Bottles')
        .select('*');
        
      if (allBottlesError) {
        console.error('❌ Error fetching all bottles:', allBottlesError);
        setLoading(false);
        setError(`Database error: ${allBottlesError.message}`);
        toast.error('Could not connect to the wine database');
        return { success: false, error: `Database error: ${allBottlesError.message}` };
      } else {
        console.log(`✅ Successfully fetched ${allBottles?.length || 0} bottles from database`);
        console.log('🍾 Available bottles:', allBottles?.map(b => b.Name));
      }

      // Case insensitive matching for bottles
      console.log('🔍 Filtering bottles by name (case-insensitive)...');
      const matchedBottles = allBottles?.filter(bottle => 
        bottleNames.some(name => {
          // Convert both to lowercase for case-insensitive matching
          const bottleName = (bottle.Name || '').toLowerCase();
          const searchName = name.toLowerCase();
          const match = bottleName === searchName || bottleName.includes(searchName);
          
          if (match) {
            console.log(`✅ Found match for "${name}": ${bottle.Name}`);
          }
          return match;
        })
      );
      
      console.log(`📊 Matched bottles: ${matchedBottles?.length || 0} out of ${bottleNames.length} requested`);
      
      if (!matchedBottles || matchedBottles.length === 0) {
        console.warn('⚠️ No matching bottles found in database after filtering');
        console.log('🍾 Available bottles in DB:', allBottles?.map(b => b.Name));
        console.log('🔍 Looking for these bottle names:', bottleNames);
        toast.warning('No matching bottles found for this tasting');
        
        // For development/demo purposes, use any available bottles if no matches found
        if (allBottles && allBottles.length > 0) {
          console.log('⚠️ Using fallback bottles for development');
          const fallbackBottles = allBottles.slice(0, Math.min(3, allBottles.length)); 
          console.log('🍷 Fallback bottles:', fallbackBottles.map(b => b.Name));
          const result = processFinalBottles(fallbackBottles, bottleNames);
          return { success: true, bottles: result, fallback: true };
        } else {
          setLoading(false);
          setError('No matching bottles found in database');
          return { success: false, error: 'No matching bottles found in database' };
        }
      }
      
      console.log('✅ Successfully matched bottles:', matchedBottles.map(b => b.Name));
      const result = processFinalBottles(matchedBottles, bottleNames);
      return { success: true, bottles: result };
      
    } catch (err: any) {
      console.error('❌ Failed to fetch bottles:', err);
      toast.error('An error occurred while loading bottle data');
      setLoading(false);
      setError(err.message || 'Unknown error occurred');
      return { success: false, error: err.message || 'Unknown error occurred' };
    }
  };
  
  // Helper function to process and sort bottles
  const processFinalBottles = (bottles: any[], bottleNames: string[]) => {
    if (!bottles || bottles.length === 0) {
      console.warn('⚠️ No bottles to process');
      setLoading(false);
      setError('No bottles to process');
      return [];
    }
    
    console.log('🔄 Processing and sorting bottles...');
    
    // Sort bottles according to the sequence field or original package order
    const sortedBottles = bottles.sort((a, b) => {
      // If sequence is available, use it
      if (a.sequence !== null && b.sequence !== null) {
        return (a.sequence || 0) - (b.sequence || 0);
      }
      
      // Otherwise sort by the order they appear in the package bottles string
      const aIndex = bottleNames.findIndex(name => 
        (a.Name || '').toLowerCase().includes(name.toLowerCase())
      );
      const bIndex = bottleNames.findIndex(name => 
        (b.Name || '').toLowerCase().includes(name.toLowerCase())
      );
      return aIndex - bIndex;
    });
    
    // Process bottles to have consistent field names
    console.log('🔄 Normalizing bottle data fields...');
    const mappedBottles = sortedBottles.map((bottle, index) => {
      console.log(`🍷 Processing bottle #${index + 1}: ${bottle.Name}`);
      console.log(`  - Intro Questions: ${bottle["Intro Questions"] ? 'Present' : 'Missing'}`);
      console.log(`  - Deep Question: ${bottle["Deep Question"] ? 'Present' : 'Missing'}`);
      console.log(`  - Final Questions: ${bottle["Final Questions"] ? 'Present' : 'Missing'}`);
      
      // Create a new object with both naming conventions
      return {
        ...bottle,
        // Map the intro questions field from either format
        introQuestions: bottle["Intro Questions"] || null,
        // Map the deep questions field from either format
        deepQuestions: bottle["Deep Question"] || null,
        // Map the final questions field from either format
        finalQuestions: bottle["Final Questions"] || null,
      };
    });
    
    console.log('✅ Final processed bottles:', mappedBottles.map(b => b.Name));
    setBottlesData(mappedBottles);
    setLoading(false);
    return mappedBottles;
  };

  useEffect(() => {
    if (packageInfo?.package_id) {
      console.log('🚀 Initiating bottle fetch for package:', packageInfo.package_id);
      fetchBottlesForPackage(packageInfo);
    }
  }, [packageInfo]);

  return {
    bottlesData,
    loading,
    error,
    setBottlesData,
    fetchBottlesForPackage
  };
};
