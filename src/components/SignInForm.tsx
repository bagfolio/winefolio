
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useWineTasting } from '@/context/WineTastingContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const SignInForm = () => {
  const { setUserInfo, nextQuestion, setLoading, setPackageInfo } = useWineTasting();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [sessionId, setSessionId] = useState('');
  const [errors, setErrors] = useState({ name: '', email: '', sessionId: '' });
  const [availablePackages, setAvailablePackages] = useState([]);
  const [fetchingPackages, setFetchingPackages] = useState(true);
  const { toast } = useToast();
  
  // Fetch all package IDs on component mount
  useEffect(() => {
    const fetchAllPackageIds = async () => {
      try {
        setFetchingPackages(true);
        console.log('Fetching package data from Supabase...');
        
        // Direct query for Packages table - use correct case as defined in types
        const { data, error } = await supabase
          .from('Packages')
          .select('*');
          
        console.log('Raw response from Packages table:', data, error);
        
        if (error) {
          console.error('Error fetching packages:', error);
          toast({
            title: 'Error',
            description: 'Could not load available packages. Please try again later.',
            variant: 'destructive',
          });
        } else if (data && data.length > 0) {
          console.log('Successfully fetched packages:', data);
          setAvailablePackages(data);
          
          // Pre-fill with the first package ID if available
          if (data[0]?.package_id) {
            setSessionId(data[0].package_id);
          }
        } else {
          console.log('No packages found in database');
          
          // Add a dummy package for testing if none are found
          const dummyPackages = [
            { 
              name: 'Demo Wine Tasting', 
              package_id: 'DEMO001',
              bottles: 'Cabernet Sauvignon,Merlot,Pinot Noir',
              sommeliers: 'Jane Smith',
              tastings: 'Red Wine Basics',
              hosts: 'Wine Club'
            }
          ];
          
          setAvailablePackages(dummyPackages);
          setSessionId(dummyPackages[0].package_id);
          
          toast({
            title: 'Demo Mode',
            description: 'No packages found. Using demo package for testing.',
          });
        }
      } catch (err) {
        console.error('Unexpected error in fetchAllPackageIds:', err);
        toast({
          title: 'Error',
          description: 'An unexpected error occurred. Using demo mode.',
          variant: 'destructive',
        });
        
        // Provide fallback data for testing
        const fallbackPackage = { 
          name: 'Fallback Package', 
          package_id: 'FALLBACK001',
          bottles: 'Demo Wine 1,Demo Wine 2',
          sommeliers: 'Demo Sommelier',
          tastings: 'Demo Tasting',
          hosts: 'Demo Host'
        };
        
        setAvailablePackages([fallbackPackage]);
        setSessionId(fallbackPackage.package_id);
      } finally {
        setFetchingPackages(false);
      }
    };
    
    // Immediately call the function
    fetchAllPackageIds();
  }, [toast]);

  const validateEmail = (email: string) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    let valid = true;
    const newErrors = { name: '', email: '', sessionId: '' };
    
    if (!name.trim()) {
      newErrors.name = 'Name is required';
      valid = false;
    }
    
    if (!email.trim()) {
      newErrors.email = 'Email is required';
      valid = false;
    } else if (!validateEmail(email)) {
      newErrors.email = 'Please enter a valid email';
      valid = false;
    }
    
    if (!sessionId.trim()) {
      newErrors.sessionId = 'Session ID is required';
      valid = false;
    }
    
    setErrors(newErrors);
    
    if (valid) {
      // Set loading to true before validating session ID
      setLoading(true);
      
      try {
        console.log('Validating session ID:', sessionId);
        const trimmedSessionId = sessionId.trim();
        
        // Try to look for the package in the database
        console.log('Looking for package with ID:', trimmedSessionId);
        
        // Use Packages table name with correct case
        const { data: packageData, error: packageError } = await supabase
          .from('Packages')
          .select('*')
          .eq('package_id', trimmedSessionId)
          .maybeSingle();
        
        console.log('Package query result:', packageData, packageError);
        
        if (packageError) {
          console.error('Error fetching package:', packageError);
          toast({
            title: 'Error',
            description: 'An error occurred while validating the session code.',
            variant: 'destructive',
          });
          setLoading(false);
          return;
        }
        
        // If no package found, check if it's one of our fallback/demo packages
        let finalPackageData = packageData;
        
        if (!finalPackageData) {
          console.log('No package found in database, checking local packages');
          finalPackageData = availablePackages.find(pkg => pkg.package_id === trimmedSessionId);
          
          if (!finalPackageData) {
            console.log('No package found with ID:', trimmedSessionId);
            toast({
              title: 'Invalid Session Code',
              description: 'The session code you entered could not be found.',
              variant: 'destructive',
            });
            setLoading(false);
            return;
          }
          console.log('Found package in local cache:', finalPackageData);
        }
        
        // We found a package, store it in context
        setPackageInfo(finalPackageData);
        
        // Store user info
        setUserInfo({ name, email, sessionId: trimmedSessionId });
        
        // Proceed to next question
        nextQuestion();
        
        toast({
          title: 'Success',
          description: 'Session code validated successfully!',
        });
      } catch (error) {
        console.error('Error in session validation:', error);
        toast({
          title: 'Error',
          description: 'An unexpected error occurred. Please try again.',
          variant: 'destructive',
        });
        setLoading(false);
      }
    }
  };

  return (
    <div className="flex flex-col items-center justify-center px-6 py-8 mx-auto">
      <div className="w-full max-w-md p-6 rounded-lg shadow-lg bg-purple-900/30 backdrop-blur-sm">
        <h2 className="text-2xl font-bold mb-6 text-center text-white">
          Join Wine Tasting Session
        </h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="sessionId" className="block text-sm font-medium text-white mb-1">
              Session ID
            </label>
            <Select 
              value={sessionId}
              onValueChange={(value) => setSessionId(value)}
            >
              <SelectTrigger className="bg-purple-800/30 border-purple-700 text-white">
                <SelectValue placeholder="Select a session code" />
              </SelectTrigger>
              <SelectContent className="bg-purple-900 border-purple-700 text-white z-50">
                {fetchingPackages ? (
                  <SelectItem value="loading" disabled className="text-purple-300">
                    Loading packages...
                  </SelectItem>
                ) : availablePackages.length > 0 ? (
                  availablePackages.map((pkg) => (
                    <SelectItem 
                      key={pkg.package_id} 
                      value={pkg.package_id || ""}
                      className="hover:bg-purple-800 focus:bg-purple-800 text-white"
                    >
                      {pkg.name || "Unnamed Package"} ({pkg.package_id || "No ID"})
                    </SelectItem>
                  ))
                ) : (
                  <SelectItem value="none" disabled className="text-purple-300">
                    No packages available
                  </SelectItem>
                )}
              </SelectContent>
            </Select>
            {errors.sessionId && <p className="text-red-300 text-sm mt-1">{errors.sessionId}</p>}
          </div>
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-white mb-1">
              Your Name
            </label>
            <Input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="bg-purple-800/30 border-purple-700 text-white placeholder-purple-300"
              placeholder="John Doe"
            />
            {errors.name && <p className="text-red-300 text-sm mt-1">{errors.name}</p>}
          </div>
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-white mb-1">
              Your Email
            </label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="bg-purple-800/30 border-purple-700 text-white placeholder-purple-300"
              placeholder="john@example.com"
            />
            {errors.email && <p className="text-red-300 text-sm mt-1">{errors.email}</p>}
          </div>
          <Button 
            type="submit" 
            className="w-full bg-white hover:bg-gray-200 text-purple-900 transition duration-300 font-semibold"
          >
            Start Tasting
          </Button>
        </form>
      </div>
    </div>
  );
};

export default SignInForm;
