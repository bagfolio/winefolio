
import React, { useState } from 'react';
import { useWineTasting } from '@/context/WineTastingContext';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { demoQuestions } from '@/data/demoQuestions';

interface SignInFormProps {
  isDemo?: boolean;
}

const SignInForm: React.FC<SignInFormProps> = ({ isDemo = false }) => {
  const [name, setName] = useState('Demo User');
  const [email, setEmail] = useState('demo@example.com');
  const [packageId, setPackageId] = useState('demo-package');
  const [isHost, setIsHost] = useState(false);
  const [loading, setLoading] = useState(false);
  const { setUserInfo, setPackageInfo, nextQuestion, dynamicQuestions, setDynamicQuestions } = useWineTasting();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Immediately validate required fields
      if (!name || !email) {
        toast.error('Please enter both name and email');
        return;
      }
      
      // For demo mode, set demo package and questions
      if (isDemo) {
        console.log('Setting demo questions and proceeding');
        
        // Set demo questions
        setDynamicQuestions(demoQuestions);
        
        // Set user and package info
        setUserInfo({
          name,
          email,
          sessionId: `demo-${Date.now()}`,
          isHost
        });
        
        setPackageInfo({
          name: 'Demo Package',
          package_id: packageId || 'demo-package'
        });
        
        toast.success('Demo mode activated!');
        nextQuestion();
      } else {
        // Normal sign-in process
        // Set user and package info
        setUserInfo({
          name,
          email,
          sessionId: `session-${Date.now()}`,
          isHost
        });
        
        setPackageInfo({
          name: 'Wine Tasting Package',
          package_id: packageId
        });
        
        toast.success('Sign-in successful!');
        nextQuestion();
      }
    } catch (error) {
      console.error('Sign-in error:', error);
      toast.error('Sign in failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-purple-900 to-black p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Wine Tasting Experience</h1>
          <p className="text-purple-200">
            {isDemo ? 'Demo Mode: Try all question types' : 'Sign in to start your tasting journey'}
          </p>
        </div>
        
        <div className="bg-purple-800/30 backdrop-blur-sm border border-purple-700/50 rounded-xl p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-purple-200 mb-1">
                Your Name
              </label>
              <Input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your name"
                className="bg-purple-900/50 border-purple-600 text-white placeholder-purple-400"
                required
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-purple-200 mb-1">
                Email Address
              </label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="bg-purple-900/50 border-purple-600 text-white placeholder-purple-400"
                required
              />
            </div>

            {!isDemo && (
              <div>
                <label htmlFor="packageId" className="block text-sm font-medium text-purple-200 mb-1">
                  Tasting Package
                </label>
                <Select value={packageId} onValueChange={setPackageId}>
                  <SelectTrigger className="bg-purple-900/50 border-purple-600 text-white">
                    <SelectValue placeholder="Select a package" />
                  </SelectTrigger>
                  <SelectContent className="bg-purple-900 border-purple-600 text-white">
                    <SelectItem value="sean-adequacy-001">Sean's Adequacy Test</SelectItem>
                    <SelectItem value="modern-tasting-001">Modern Tasting Set</SelectItem>
                    <SelectItem value="test-pkg-001">Test Package</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="flex items-center">
              <input
                id="isHost"
                type="checkbox"
                checked={isHost}
                onChange={(e) => setIsHost(e.target.checked)}
                className="h-4 w-4 rounded border-gray-300 text-purple-600 focus:ring-purple-500"
              />
              <label htmlFor="isHost" className="ml-2 block text-sm text-purple-200">
                I am the host of this tasting
              </label>
            </div>

            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-purple-600 to-purple-800 hover:from-purple-700 hover:to-purple-900 text-white"
              disabled={loading}
            >
              {loading ? 'Signing in...' : isDemo ? 'Start Demo' : 'Sign In'}
            </Button>
            
            {!isDemo && (
              <div className="text-center mt-4">
                <Button 
                  type="button"
                  variant="link" 
                  className="text-purple-300"
                  onClick={() => window.location.href = '/?demo=true'}
                >
                  Try Demo Mode
                </Button>
              </div>
            )}
          </form>
        </div>
        
        {/* Connection status - shows when demo mode is active */}
        {isDemo && (
          <div className="mt-6 p-3 bg-purple-800/20 border border-purple-700/30 rounded-lg text-sm text-purple-200">
            <div className="flex items-center">
              <div className="w-3 h-3 bg-green-400 rounded-full mr-2"></div>
              <span>Demo Mode Active</span>
            </div>
            <div className="ml-5 mt-1">
              <p>• Loaded {demoQuestions.length} demo questions</p>
              <p>• Showing all available slide types</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SignInForm;
