'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'           // next/router si usas pages/
import { createClient } from '../utils/supabase/client' // 👈 tu wrapper browser-side

export default function InvitePage() {
  const supabase = createClient()
  const router   = useRouter()

  /* ─────── estados de la UI ─────── */
  const [loading, setLoading]   = useState(true)        // spinner inicial
  const [error,   setError]     = useState<string|null>(null)
  const [success, setSuccess]   = useState(false)

  /* form */
  const [password, setPassword] = useState('')
  const [confirm,  setConfirm]  = useState('')

  /* ───────────────────────────────────────────────────────────────
     1 · Al montar el componente intentamos instalar la sesión     */
  useEffect(() => {
    const bootstrap = async () => {
      // 1-A · ¿Ya hay sesión (p.ej. recarga de página)?
      const { data: { session } } = await supabase.auth.getSession()
      if (session) {
        setLoading(false)
        return
      }

      // 1-B · Extrae access y refresh token del fragmento "#…"
      const hash   = window.location.hash.slice(1)          // sin '#'
      const params = new URLSearchParams(hash)

      const access_token  = params.get('access_token')
      const refresh_token = params.get('refresh_token')

      if (access_token && refresh_token) {
        const { error } = await supabase.auth.setSession({
          access_token,
          refresh_token
        })

        if (error) {
          setError(error.message)
        } else {
          // Limpia la URL (sin los tokens) para no dejar rastro en historial
          window.history.replaceState({}, '', '/invite')
        }
      } else {
        setError('Enlace de invitación inválido o expirado')
      }

      setLoading(false)
    }

    bootstrap()
  }, [])

  /* ───────────────────────────────────────────────────────────────
     2 · Enviar el formulario: poner contraseña (mín. 6 chars)      */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (password.length < 6)      { setError('Mínimo 6 caracteres'); return }
    if (password !== confirm)     { setError('Las contraseñas no coinciden'); return }

    setLoading(true)
    const { error } = await supabase.auth.updateUser({ password })

    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }

    setSuccess(true)
    // Redirige al dashboard (o login) tras 2 s
    setTimeout(() => router.push('/'), 2000)
  }

  /* ─────── vistas de la UI ─────── */
  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="animate-spin h-12 w-12 rounded-full border-b-2 border-indigo-600" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="bg-red-50 text-red-700 p-6 rounded-xl">{error}</div>
      </div>
    )
  }

  if (success) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="bg-green-50 text-green-700 p-6 rounded-xl">
          Contraseña establecida. Redirigiendo…
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4">
      <form
        onSubmit={handleSubmit}
        className="max-w-md w-full space-y-6 bg-white p-8 rounded-xl shadow"
      >
        <h1 className="text-3xl font-extrabold text-center">Bienvenido a Mario Surf</h1>
        <p className="text-sm text-center text-gray-600">
          Establece tu contraseña para comenzar
        </p>

        <div className="space-y-4">
          <input
            type="password"
            placeholder="Nueva contraseña"
            minLength={6}
            required
            className="w-full px-3 py-2 border rounded"
            value={password}
            onChange={e => setPassword(e.target.value)}
          />

          <input
            type="password"
            placeholder="Confirmar contraseña"
            minLength={6}
            required
            className="w-full px-3 py-2 border rounded"
            value={confirm}
            onChange={e => setConfirm(e.target.value)}
          />
        </div>

        <button
          type="submit"
          className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded"
        >
          Establecer contraseña
        </button>
      </form>
    </div>
  )
}
