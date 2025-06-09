import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '../lib/supabase';
import Auth from './Auth';

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const router = useRouter();

  useEffect(() => {
    // Check initial session
    const checkSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Error checking session:', error);
          setIsAuthenticated(false);
          return;
        }

        setIsAuthenticated(!!session);
      } catch (error) {
        console.error('Error in session check:', error);
        setIsAuthenticated(false);
      }
    };

    checkSession();

    // Subscribe to auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('Auth state changed:', event, session ? 'Session exists' : 'No session');
      
      if (event === 'SIGNED_OUT') {
        setIsAuthenticated(false);
        router.push('/');
      } else if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
        setIsAuthenticated(true);
      }
    });

    // Cleanup subscription
    return () => {
      subscription.unsubscribe();
    };
  }, [router]);

  // Show loading state while checking authentication
  if (isAuthenticated === null) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  // Show auth page if not authenticated
  if (!isAuthenticated) {
    return <Auth />;
  }

  // Show protected content if authenticated
  return <>{children}</>;
} 