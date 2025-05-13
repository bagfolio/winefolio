
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
import { PackageInfo } from '../types';

const SignInForm = () => {
  const { setUserInfo, nextQuestion, setLoading, setPackageInfo } = useWineTasting();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [sessionId, setSessionId] = useState('');
  const [errors, setErrors] = useState({ name: '', email: '', sessionId: '' });
  const [availablePackages, setAvailablePackages] = useState<PackageInfo[]>([]);
  const [fetchingPackages, setFetchingPackages] = useState(true);
  const [debugInfo, setDebugInfo] = useState<string>('');
  const { toast } = useToast();
  
  // Fetch all package IDs on component mount
  useEffect(() => {
    const fetchAllPackageIds = async () => {
      try {
        setFetchingPackages(true);
        setDebugInfo('Starting to fetch package data from Supabase...');
        
        // Log Supabase client details (without exposing sensitive information)
        console.log('Supabase client initialized:', !!supabase);
        
        // Use the exact capitalization from the database schema
        setDebugInfo(prev => prev + '\nAttempting to fetch from "Packages" table with correct capitalization...');
        
        const { data: packagesData, error: packagesError } = await supabase
          .from('Packages')
          .select('*');
          
        if (packagesError) {
          setDebugInfo(prev => prev + `\nError with 'Packages': ${packagesError.message}`);
          throw new Error(`Could not fetch packages data: ${packagesError.message}`);
        }
        
        setDebugInfo(prev => prev + `\nSuccessfully fetched ${packagesData?.length || 0} packages from 'Packages'`);
        
        if (packagesData && packagesData.length > 0) {
          console.log('Raw packages data:', JSON.stringify(packagesData));
          setDebugInfo(prev => prev + `\nRaw data: ${JSON.stringify(packagesData)}`);
          
          // Transform the data to match PackageInfo type
          // Making sure we use the correct property names from the database
          const formattedPackages: PackageInfo[] = packagesData.map(pkg => ({
            name: pkg.name || 'Unnamed Package',
            package_id: pkg.package_id || 'NO_ID',
            bottles: pkg.bottles || '',
            sommeliers: pkg.sommeliers || '',
            tastings: pkg.tastings || '',
            hosts: pkg.hosts || ''
          }));
          
          setAvailablePackages(formattedPackages);
          setSessionId(formattedPackages[0]?.package_id || '');
        } else {
          throw new Error('No packages found in database');
        }
      } catch (err: any) {
        console.error('Error in fetchAllPackageIds:', err);
        setDebugInfo(prev => prev + `\nCaught error: ${err.message}`);
        
        toast({
          title: 'Database Connection Issue',
          description: 'Could not load packages. Using demo packages instead.',
          variant: 'destructive',
        });
        
        // Provide demo packages for testing
        const demoPackages: PackageInfo[] = [
          { 
            name: 'Demo Wine Tasting', 
            package_id: 'DEMO001',
            bottles: 'Cabernet Sauvignon,Merlot,Pinot Noir',
            sommeliers: 'Jane Smith',
            tastings: 'Red Wine Basics',
            hosts: 'Wine Club'
          },
          { 
            name: 'Premium Wine Experience', 
            package_id: 'DEMO002',
            bottles: 'Chardonnay,Sauvignon Blanc,Riesling',
            sommeliers: 'Robert Johnson',
            tastings: 'White Wine Journey',
            hosts: 'Vineyard Tours'
          }
        ];
        
        setDebugInfo(prev => prev + '\nFalling back to demo packages');
        setAvailablePackages(demoPackages);
        setSessionId(demoPackages[0].package_id);
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
        const trimmedSessionId = sessionId.trim();
        
        // Find the package in our available packages
        const selectedPackage = availablePackages.find(pkg => pkg.package_id === trimmedSessionId);
        
        if (!selectedPackage) {
          toast({
            title: 'Invalid Session Code',
            description: 'The session code you entered could not be found.',
            variant: 'destructive',
          });
          setLoading(false);
          return;
        }
        
        // Store package info in context
        setPackageInfo(selectedPackage);
        
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
        
        {/* Debug info section */}
        <div className="mb-4 p-2 bg-purple-800/40 rounded text-xs text-white overflow-auto max-h-32">
          <p className="font-semibold mb-1">Database Connection Status:</p>
          <pre className="whitespace-pre-wrap">{debugInfo || 'No debug info available yet'}</pre>
        </div>
        
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
