import React, { createContext, useContext, useState, useEffect } from 'react';
import { loadData, getState } from '../lib/data';
import { ApiClient } from '../lib/api';
import type { AppState } from '../lib/supabase';

interface AppContextType {
  state: AppState;
  refresh: () => Promise<void>;
  updateEntity: (type: string, data: any) => Promise<void>;
  deleteEntity: (type: string, id: number) => Promise<void>;
}

const AppContext = createContext<AppContextType | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AppState>(getState());

  useEffect(() => {
    const loadInitialData = async () => {
      const newState = await loadData();
      setState(newState);
    };
    loadInitialData();
  }, []);

  const refresh = async () => {
    const newState = await loadData();
    setState(newState);
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