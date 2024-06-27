import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { supabase } from '@/lib/supabaseClient';
import LogOutIcon from '@/components/icons/logoutIcon';

interface LogOutButtonProps {
  children?: React.ReactNode;
}

const LogOutButton: React.FC<LogOutButtonProps> = ({ children }) => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogout = async () => {
    setIsLoading(true);
    setError('');

    const { error: signOutError } = await supabase.auth.signOut();
    
    if (signOutError) {
      console.error('Error logging out:', signOutError.message);
      setError('Failed to log out. Please try again.');
    } else {
      router.push('/');
    }

    setIsLoading(false);
  };

  return (
    <>
      <Button 
        className="bg-background hover:bg-background" 
        onClick={handleLogout}
        disabled={isLoading}
      >
        {children || (
          <div className="flex flex-row items-center font-thin">
            {isLoading ? 'LOGGING OUT...' : 'LOG OUT'}
            <LogOutIcon className="ml-2" />
          </div>
        )}
      </Button>
      {error && <p className="text-red-500 mt-2">{error}</p>}
    </>
  );
};

export default LogOutButton;