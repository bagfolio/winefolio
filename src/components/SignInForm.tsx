
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useWineTasting } from '@/context/WineTastingContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';

const SignInForm = () => {
  const { setUserInfo, nextQuestion, setLoading, setPackageInfo } = useWineTasting();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [sessionId, setSessionId] = useState('');
  const [errors, setErrors] = useState({ name: '', email: '', sessionId: '' });

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
        // Query the Packages table to find the package with the given session ID
        const { data: packageData, error } = await supabase
          .from('Packages')
          .select('*')
          .eq('package_id', sessionId)
          .single();
        
        if (error) {
          console.error('Error fetching package:', error);
          toast({
            title: 'Invalid Session Code',
            description: 'The session code you entered could not be found.',
            variant: 'destructive',
          });
          setLoading(false);
          return;
        }
        
        if (packageData) {
          // Store package info in context
          setPackageInfo(packageData);
          
          // Store user info
          setUserInfo({ name, email, sessionId });
          
          // Proceed to next question
          nextQuestion();
        } else {
          toast({
            title: 'Session Not Found',
            description: 'Please check your session code and try again.',
            variant: 'destructive',
          });
        }
      } catch (error) {
        console.error('Error in session validation:', error);
        toast({
          title: 'Error',
          description: 'An unexpected error occurred. Please try again.',
          variant: 'destructive',
        });
      } finally {
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
            <Input
              id="sessionId"
              type="text"
              value={sessionId}
              onChange={(e) => setSessionId(e.target.value)}
              className="bg-purple-800/30 border-purple-700 text-white placeholder-purple-300"
              placeholder="Enter session code"
            />
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
