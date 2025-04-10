import React, { useState } from 'react';
import { signIn } from '../lib/auth';
import { Button } from './Button';
import { Input } from './Input';

interface LoginFormProps {
  onLoginSuccess: () => void;
}

export const LoginForm: React.FC<LoginFormProps> = ({ onLoginSuccess }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      setError('Email and password are required');
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      await signIn(email, password);
      onLoginSuccess();
    } catch (err) {
      console.error('Login error:', err);
      setError(
        err instanceof Error 
          ? err.message 
          : 'Login failed. Please check your credentials and try again.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-6 flex flex-col items-center">
      <div className="w-full max-w-md neo-brutal-box p-6 bg-white">
        <h2 className="text-xl font-bold mb-6 font-space text-center">Login to Bookmarko</h2>
        
        {error && (
          <div className="bg-red-100 border-2 border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit}>
          <Input
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            placeholder="your@email.com"
            disabled={isLoading}
          />
          
          <Input
            label="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            placeholder="Your password"
            disabled={isLoading}
          />
          
          <Button
            type="submit"
            className="w-full mt-6"
            disabled={isLoading}
          >
            {isLoading ? 'Logging in...' : 'Login'}
          </Button>
        </form>
      </div>
      
      <p className="mt-4 text-sm text-gray-600">
        Don't have an account? Sign up at{' '}
        <a 
          href="https://bookmarko.app/signup" 
          target="_blank" 
          rel="noopener noreferrer"
          className="text-primary font-medium hover:underline"
        >
          bookmarko.app
        </a>
      </p>
    </div>
  );
}; 