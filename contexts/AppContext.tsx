import React, { createContext, useContext, useState, useEffect } from 'react';
import { loadData, getState } from '../lib/data';
import { ApiClient } from '../lib/api';
import type { AppState } from '../lib/supabase';
import { supabase } from '../lib/supabase';

interface AppContextType {
  state: AppState;
  refresh: () => Promise<void>;
  updateEntity: (type: string, data: any) => Promise<void>;
  deleteEntity: (type: string, id: number) => Promise<void>;
}

const AppContext = createContext<AppContextType | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AppState>(getState());
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    const initializeApp = async () => {
      try {
        console.log('Initializing app...');
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session) {
          console.log('Session exists, loading data...');
          const newState = await loadData();
          setState(newState);
        } else {
          console.log('No session found');
        }
      } catch (error) {
        console.error('Error initializing app:', error);
      } finally {
        setIsInitialized(true);
      }
    };

    initializeApp();

    // Subscribe to auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth state changed in AppContext:', event);
      
      if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
        const newState = await loadData();
        setState(newState);
      } else if (event === 'SIGNED_OUT') {
        setState(getState()); // Reset to initial state
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const refresh = async () => {
    try {
      const newState = await loadData();
      setState(newState);
    } catch (error) {
      console.error('Error refreshing data:', error);
      throw error;
    }
  };

  const updateEntity = async (type: string, data: any) => {
    // Actualización optimista
    setState(prev => ({
      ...prev,
      [type]: prev[type].map(item => 
        item.id === data.id ? { ...item, ...data } : item
      )
    }));
    
    try {
      await ApiClient[`update${type}`](data.id, data);
      await refresh(); // Actualización real
    } catch (error) {
      // Revertir cambios si hay error
      await refresh();
      throw error;
    }
  };

  const deleteEntity = async (type: string, id: number) => {
    // Actualización optimista
    setState(prev => ({
      ...prev,
      [type]: prev[type].filter(item => item.id !== id)
    }));
    
    try {
      await ApiClient[`delete${type}`](id);
      await refresh(); // Actualización real
    } catch (error) {
      // Revertir cambios si hay error
      await refresh();
      throw error;
    }
  };

  // Show loading state while initializing
  if (!isInitialized) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <AppContext.Provider value={{ state, refresh, updateEntity, deleteEntity }}>
      {children}
    </AppContext.Provider>
  );
}

export function useAppContext() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
} 