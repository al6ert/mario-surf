/* middleware.ts */
import { NextResponse, type NextRequest } from 'next/server'
import { createServerClient } from '@supabase/ssr'

export async function middleware(request: NextRequest) {
  let response = NextResponse.next()

  console.log('Middleware - Iniciando middleware para ruta:', request.nextUrl.pathname)

  // 1) Crea cliente con cookies de la request
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          const cookies = request.cookies.getAll()
          console.log('Middleware - Cookies obtenidas:', cookies)
          return cookies
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            console.log('Middleware - Estableciendo cookie:', name, value, options)
            response.cookies.set(name, value, options)
          })
        }
      }
    }
  )

  // 2) Obliga a refrescar sesión si el JWT caducó
  const { data: { session }, error } = await supabase.auth.getSession()
  console.log('Middleware - Sesión obtenida:', session, error)

  return response
}

export const config = {
  // excluye assets estáticos (favicon, _next, etc.)
  matcher: ['/((?!_next|recovery|reset-password|favicon.ico).*)']
}



