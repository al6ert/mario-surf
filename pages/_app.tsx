/* pages/_app.tsx */
import '../styles/globals.css'
import type { AppProps } from 'next/app'
import { SessionProvider } from '../contexts/SessionProvider'
import { AppProvider } from '../contexts/AppContext'

export default function MyApp({ Component, pageProps }: AppProps) {
  return (
    <SessionProvider>
      <AppProvider>
        <Component {...pageProps} />
      </AppProvider>
    </SessionProvider>
  )
}
