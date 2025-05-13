import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useWineTasting } from '@/context/WineTastingContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PackageInfo } from '../types';
import { useDataPreload } from '@/hooks/useDataPreload';

const SignInForm = () => {
  const { setUserInfo, nextQuestion, setLoading, setPackageInfo } = useWineTasting();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [sessionId, setSessionId] = useState('');
  const [errors, setErrors] = useState({ name: '', email: '', sessionId: '' });
  const [availablePackages, setAvailablePackages] = useState<PackageInfo[]>([]);
  const [fetchingPackages, setFetchingPackages] = useState(true);
  const [connectionStatus, setConnectionStatus] = useState<string>('Initializing...');
  const [selectedPackage, setSelectedPackage] = useState<PackageInfo | null>(null);
  const { preloadData, preloading, preloadError, preloadSuccess } = useDataPreload();

  useEffect(() => {
    const fetchPackages = async () => {
      try {
        setFetchingPackages(true);
        setConnectionStatus('Starting to fetch package data from Supabase...');
        
        // Try fetching from the Packages table
        setConnectionStatus(prev => `${prev}\nAttempting to query the "Packages" table...`);
        
        const { data, error } = await supabase
          .from('Packages')
          .select('*');
          
        if (error) {
          throw new Error(`Error fetching packages: ${error.message}`);
        }
        
        setConnectionStatus(prev => `${prev}\nSuccessfully connected to Supabase!`);
        console.log('Raw packages data:', data);
        
        if (data && data.length > 0) {
          setConnectionStatus(prev => `${prev}\nFound ${data.length} packages in the database.`);
          
          const formattedPackages: PackageInfo[] = data.map((pkg) => ({
            name: pkg.name || 'Unnamed Package',
            package_id: pkg.package_id || 'NO_ID',
            bottles: pkg.bottles || '',
            sommeliers: pkg.sommeliers || '',
            tastings: pkg.tastings || '',
            hosts: pkg.hosts || ''
          }));
          
          setAvailablePackages(formattedPackages);
          if (!sessionId && formattedPackages.length > 0) {
            setSessionId(formattedPackages[0].package_id);
            setSelectedPackage(formattedPackages[0]);
          }
          
          toast.success('Connection Successful', {
            description: `Found ${data.length} wine tasting packages.`
          });
        } else {
          setConnectionStatus(prev => `${prev}\nNo packages found in database or database is empty.`);
          throw new Error('No packages found in database or database is empty');
        }
      } catch (err: any) {
        console.error('Error in fetchPackages:', err);
        setConnectionStatus(prev => `${prev}\nError encountered: ${err.message}`);
        
        toast.error('Database Connection Issue', {
          description: 'Could not load packages. Using demo packages instead.'
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
        
        setConnectionStatus(prev => `${prev}\nFalling back to demo packages`);
        setAvailablePackages(demoPackages);
        if (!sessionId) {
          setSessionId(demoPackages[0].package_id);
          setSelectedPackage(demoPackages[0]);
        }
      } finally {
        setFetchingPackages(false);
      }
    };
    
    fetchPackages();
  }, [sessionId]);

  // When session ID changes, update the selected package
  useEffect(() => {
    if (sessionId && availablePackages.length > 0) {
      const pkg = availablePackages.find(p => p.package_id === sessionId) || null;
      setSelectedPackage(pkg);
      
      if (pkg) {
        console.log(`📦 Selected package: ${pkg.name} (${pkg.package_id})`);
        console.log(`🍾 Bottles: ${pkg.bottles || 'none'}`);
      }
    }
  }, [sessionId, availablePackages]);

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
    
    if (valid && selectedPackage) {
      // Set loading to true before validating session ID
      setLoading(true);
      
      try {
        const trimmedSessionId = sessionId.trim();
        console.log('Submitting session with ID:', trimmedSessionId);
        
        // Find the package in our available packages
        const selectedPackage = availablePackages.find(pkg => pkg.package_id === trimmedSessionId);
        
        if (!selectedPackage) {
          toast.error('The session code you entered could not be found.');
          setLoading(false);
          return;
        }
        
        console.log('Selected package:', selectedPackage);
        
        // Store package info in context
        setPackageInfo(selectedPackage);
        
        // Store user info
        const userData = { name, email, sessionId: trimmedSessionId };
        console.log('Setting user info:', userData);
        setUserInfo(userData);
        
        // Proceed to next question
        console.log('Moving to next question');
        nextQuestion();
        
        toast.success('Session code validated successfully!');
      } catch (error) {
        console.error('Error in session validation:', error);
        toast.error('An unexpected error occurred. Please try again.');
        setLoading(false);
      }
    }
  };

  const handlePreloadData = async () => {
    if (!selectedPackage) {
      toast.error('Please select a package first');
      return;
    }

    try {
      const result = await preloadData(selectedPackage);
      if (result.success) {
        setConnectionStatus(prev => `${prev}\n✅ Data preload successful: ${result.message}`);
      } else {
        setConnectionStatus(prev => `${prev}\n❌ Data preload failed: ${result.message}`);
      }
    } catch (error: any) {
      console.error('Error in preloading data:', error);
      setConnectionStatus(prev => `${prev}\n❌ Error preloading data: ${error.message}`);
      toast.error('Failed to preload data');
    }
  };

  return (
    <div className="flex flex-col items-center justify-center px-6 py-8 mx-auto">
      <div className="w-full max-w-md p-6 rounded-lg shadow-lg bg-purple-900/30 backdrop-blur-sm">
        <h2 className="text-2xl font-bold mb-6 text-center text-white">
          Join Wine Tasting Session
        </h2>
        
        {/* Connection status section - make it scrollable and better formatted */}
        <div className="mb-4 p-2 bg-purple-800/40 rounded text-xs text-white overflow-auto max-h-60">
          <p className="font-semibold mb-1">Database Connection Status:</p>
          <pre className="whitespace-pre-wrap">{connectionStatus}</pre>
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
                      value={pkg.package_id}
                      className="hover:bg-purple-800 focus:bg-purple-800 text-white"
                    >
                      {pkg.name} ({pkg.package_id})
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

            {/* Preload data button */}
            <div className="mt-2">
              <Button 
                type="button" 
                onClick={handlePreloadData}
                disabled={!selectedPackage || preloading}
                className="w-full bg-purple-600 hover:bg-purple-700 text-white transition duration-300 text-sm"
              >
                {preloading ? 'Loading Data...' : 'Test Data Preload'}
              </Button>
              
              {preloadSuccess && (
                <p className="text-green-300 text-xs mt-1">✅ Data preload successful. Ready to proceed.</p>
              )}
              
              {preloadError && (
                <p className="text-red-300 text-xs mt-1">❌ {preloadError}</p>
              )}
            </div>
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
