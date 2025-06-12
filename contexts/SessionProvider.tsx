/* contexts/SessionProvider.tsx */
'use client'

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode
} from 'react'
import { Session } from '@supabase/supabase-js'
import { createClient } from '../utils/supabase/client'

const SessionContext = createContext<Session | null>(null)

export const useSession = () => useContext(SessionContext)

export function SessionProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null)

  useEffect(() => {
    const supabase = createClient()

    // Sesión inicial
    supabase.auth.getSession().then(({ data }) => {
      console.log('Sesión inicial:', data.session)
      setSession(data.session)
    })

    // Escucha los eventos de Auth
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, currentSession) => {
        console.log('Evento de Auth:', _event, currentSession)
        setSession(currentSession)
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  return (
    <SessionContext.Provider value={session}>
      {children}
    </SessionContext.Provider>
  )
}
