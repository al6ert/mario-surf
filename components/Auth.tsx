import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useRouter } from 'next/router';

export default function Auth() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // Check if we have an access token in the URL (invitation)
    const hash = window.location.hash;
    if (hash) {
      router.push('/invite');
      return;
    }

    // Check if we have a recovery token in the URL
    const { token, type } = router.query;
    if (token && type === 'recovery') {
      // Keep the original URL parameters and hash when redirecting
      const url = new URL(window.location.href);
      router.push({
        pathname: '/recovery',
        query: { token, type },
        hash: url.hash
      });
    }
  }, [router, router.query]);

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    const formData = new FormData(e.currentTarget);
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;
      
      router.push('/');
    } catch (error) {
      setError(error instanceof Error ? error.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    const formData = new FormData(e.currentTarget);
    const email = formData.get('email') as string;

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/recovery`
      });

      if (error) throw error;
      
      setSuccess('Se ha enviado un correo con las instrucciones para restablecer tu contraseña');
      setIsForgotPassword(false);
    } catch (error) {
      console.error('Error sending recovery email:', error);
      setError(error instanceof Error ? error.message : 'Error al enviar el correo de recuperación');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 to-white py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-xl shadow-lg">
        <div>
          <h2 className="mt-2 text-center text-3xl font-extrabold text-gray-900">
            {isForgotPassword ? 'Recuperar Contraseña' : 'Iniciar Sesión'}
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            {isForgotPassword 
              ? 'Ingresa tu correo electrónico para recibir instrucciones'
              : 'Ingresa tus credenciales para acceder'}
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={isForgotPassword ? handleForgotPassword : handleLogin}>
          <div className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                placeholder="tu@email.com"
              />
            </div>
            
            {!isForgotPassword && (
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                  Contraseña
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  placeholder="••••••••"
                />
              </div>
            )}
          </div>

          {error && (
            <div className="rounded-md bg-red-50 p-4">
              <div className="flex">
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800">{error}</h3>
                </div>
              </div>
            </div>
          )}

          {success && (
            <div className="rounded-md bg-green-50 p-4">
              <div className="flex">
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-green-800">{success}</h3>
                </div>
              </div>
            </div>
          )}

          <div className="flex items-center justify-between">
            {!isForgotPassword && (
              <button
                type="button"
                onClick={() => setIsForgotPassword(true)}
                className="text-sm font-medium text-indigo-600 hover:text-indigo-500"
              >
                ¿Olvidaste tu contraseña?
              </button>
            )}
            {isForgotPassword && (
              <button
                type="button"
                onClick={() => setIsForgotPassword(false)}
                className="text-sm font-medium text-indigo-600 hover:text-indigo-500"
              >
                Volver al login
              </button>
            )}
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
            >
              {loading ? (
                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              ) : isForgotPassword ? 'Enviar instrucciones' : 'Iniciar sesión'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 