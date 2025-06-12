'use client'
import { ReactNode } from 'react'
import { useSession } from '../contexts/SessionProvider'
import Auth from './Auth'

export default function ProtectedRoute({ children }: { children: ReactNode }) {
  const session = useSession()

  // 1) Cargando la sesión 👉 spinner
  if (session === undefined) {
    return (
      <div className="h-screen w-screen flex items-center justify-center">
        <div className="animate-spin h-12 w-12 rounded-full border-b-2 border-indigo-600" />
      </div>
    )
  }

  // 2) Ya sé que NO hay sesión 👉 pantalla Auth
  if (session === null) {
    return <Auth />
  }

  // 3) Hay usuario 👉 renderiza la ruta protegida
  return <>{children}</>
}
