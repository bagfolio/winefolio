
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
      if (!packageInfo) {
        console.log('No package info available');
        return;
      }
      
      // If no bottles found in package, try to fetch all bottles
      if (!packageInfo.bottles) {
        console.log('No bottles information in package, will try to fetch all bottles');
        
        setLoading(true);
        try {
          // Test Supabase connection first
          const { error: connectionTest } = await supabase
            .from('Packages')
            .select('name')
            .limit(1);
            
          if (connectionTest) {
            console.error('Supabase connection error:', connectionTest);
            toast({
              title: 'Database Connection Error',
              description: 'Unable to connect to the database. Please check your network connection.',
              variant: 'destructive',
            });
            setLoading(false);
            return;
          }
          
          // Fetch all bottles, ordered by sequence
          const { data: allBottles, error } = await supabase
            .from('Bottles')
            .select('*')
            .order('sequence', { ascending: true });
            
          if (error) {
            console.error('Error fetching all bottles:', error);
            toast({
              title: 'Error',
              description: 'Failed to load bottle information.',
              variant: 'destructive',
            });
          } else if (allBottles && allBottles.length > 0) {
            console.log('Found all bottles:', allBottles);
            // Process questions data before setting bottlesData
            const processedBottles = processBottlesQuestions(allBottles);
            setBottlesData(processedBottles);
          } else {
            console.log('No bottles found in the database');
            toast({
              title: 'Warning',
              description: 'No wine bottle information available for this tasting session.',
            });
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
        
        // Fetch bottles data using IN clause for exact matches
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
        
        console.log('Fetched bottles with exact match:', bottles);
        
        if (!bottles || bottles.length === 0) {
          console.log('No bottles found with exact names, trying case-insensitive search');
          
          // If no bottles found using direct matching, try using OR conditions with ILIKE for each bottle name
          let query = supabase.from('Bottles').select('*');
          
          // Build the query with multiple ILIKE conditions
          const conditions = bottleNames.map(name => `Name.ilike.%${name}%`).join(',');
          
          console.log('Using ILIKE conditions:', conditions);
          const { data: fallbackBottles, error: fallbackError } = await query.or(conditions);
            
          if (fallbackError || !fallbackBottles || fallbackBottles.length === 0) {
            console.log('No bottles found with case-insensitive search either');
            
            // As a final fallback, just get some bottles to show
            const { data: anyBottles, error: anyError } = await supabase
              .from('Bottles')
              .select('*')
              .order('sequence', { ascending: true })
              .limit(3);
              
            if (anyBottles && anyBottles.length > 0) {
              console.log('Using fallback bottles:', anyBottles);
              // Process questions data before setting bottlesData
              const processedBottles = processBottlesQuestions(anyBottles);
              setBottlesData(processedBottles);
            } else {
              toast({
                title: 'Warning',
                description: 'No wine bottle information found for this tasting session.',
              });
            }
          } else {
            console.log('Found bottles using case-insensitive search:', fallbackBottles);
            // Process questions data before setting bottlesData
            const processedBottles = processBottlesQuestions(fallbackBottles);
            setBottlesData(processedBottles);
          }
        } else {
          // Process questions data before setting bottlesData
          const processedBottles = processBottlesQuestions(bottles);
          setBottlesData(processedBottles);
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
  
  // Helper function to process bottle questions data
  const processBottlesQuestions = (bottles: any[]): BottleData[] => {
    return bottles.map(bottle => {
      // Ensure all question fields are properly formatted JSON objects
      const processedBottle: BottleData = {
        ...bottle,
        introQuestions: ensureJsonObject(bottle.introQuestions || bottle["Intro Questions"]),
        deepQuestions: ensureJsonObject(bottle.deepQuestions || bottle["Deep Question"]),
        finalQuestions: ensureJsonObject(bottle.finalQuestions || bottle["Final Questions"]),
        sequence: bottle.sequence || 0,
        Name: bottle.Name || "Unknown Wine"
      };
      
      console.log(`Processed bottle ${processedBottle.Name} with questions:`, {
        intro: processedBottle.introQuestions,
        deep: processedBottle.deepQuestions,
        final: processedBottle.finalQuestions
      });
      
      return processedBottle;
    });
  };
  
  // Helper function to ensure a value is a valid JSON object
  const ensureJsonObject = (value: any): Record<string, any> => {
    if (!value) return {};
    
    if (typeof value === 'string') {
      try {
        // Try to parse if it's a JSON string
        return JSON.parse(value);
      } catch (e) {
        console.warn('Failed to parse JSON string:', value);
        return { text: value }; // Use the string as a text property
      }
    }
    
    if (typeof value === 'object') {
      return value; // Already an object
    }
    
    return {}; // Default empty object
  };

  return { bottlesData, loading, setLoading };
};
