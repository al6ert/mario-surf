/* contexts/AppContext.tsx */
'use client'

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode
} from 'react'
import { loadData, getState } from '../lib/data'
import { ApiClient } from '../lib/api'
import type { AppState } from '../lib/supabase'
import { useSession } from './SessionProvider'

interface AppContextType {
  state: AppState
  refresh: () => Promise<void>
  updateEntity: (type: string, data: any) => Promise<void>
  deleteEntity: (type: string, id: number) => Promise<void>
}

const AppContext = createContext<AppContextType | null>(null)

export function AppProvider({ children }: { children: ReactNode }) {
  const session = useSession()
  const [state, setState] = useState<AppState>(getState())
  const [isReady, setIsReady] = useState(false)

  /** Carga los datos solo cuando haya sesión */
  useEffect(() => {
    const init = async () => {
      if (!session) return // todavía no hay login

      try {
        setState(await loadData())
      } catch (e) {
        console.error('Error cargando datos', e)
      } finally {
        setIsReady(true)
      }
    }

    init()
  }, [session])

  /** Resetea el estado al hacer logout */
  useEffect(() => {
    if (session === null) setState(getState())
  }, [session])

  const refresh = async () => {
    setState(await loadData())
  }

  const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1)

  /**
   * Actualiza genérica para cualquier tabla del ApiClient.
   *   type  👉 'client', 'activity', 'booking', etc.
   *   data  👉 objeto con id y cambios
   */
  const updateEntity = async (type: string, data: any) => {
    const method = `update${capitalize(type)}` as keyof typeof ApiClient
    if (typeof ApiClient[method] !== 'function') {
      throw new Error(`Método ${method} no existe en ApiClient`)
    }

    // Optimistic UI
    setState(prev => ({
      ...prev,
      [type]: prev[type].map((item: any) =>
        item.id === data.id ? { ...item, ...data } : item
      )
    }))

    try {
      await (ApiClient[method] as any)(data.id, data)
      await refresh()
    } catch (err) {
      await refresh()        // revertir si falla
      throw err
    }
  }

  const deleteEntity = async (type: string, id: number) => {
    const method = `delete${capitalize(type)}` as keyof typeof ApiClient
    if (typeof ApiClient[method] !== 'function') {
      throw new Error(`Método ${method} no existe en ApiClient`)
    }

    // Optimistic UI
    setState(prev => ({
      ...prev,
      [type]: prev[type].filter((item: any) => item.id !== id)
    }))

    try {
      await (ApiClient[method] as any)(id)
      await refresh()
    } catch (err) {
      await refresh()
      throw err
    }
  }

  if (!isReady && !!session) {
    return (
      <div className="h-screen w-screen flex items-center justify-center">
        <div className="animate-spin h-12 w-12 rounded-full border-b-2 border-indigo-600" />
      </div>
    )
  }

  return (
    <AppContext.Provider
      value={{ state, refresh, updateEntity, deleteEntity }}
    >
      {children}
    </AppContext.Provider>
  )
}

export function useAppContext() {
  const context = useContext(AppContext)
  if (!context)
    throw new Error('useAppContext must be used within an AppProvider')
  return context
}
