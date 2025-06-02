import { useEffect, useState } from 'react';
import { supabase, Settings } from '../lib/supabase';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCog } from '@fortawesome/free-solid-svg-icons';

export default function Setup() {
  const [form, setForm] = useState<Partial<Settings>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    setLoading(true);
    const { data, error } = await supabase.from('settings').select('*').single();
    if (data) setForm(data);
    if (error) setError('No se pudo cargar la configuración');
    setLoading(false);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: type === 'number' ? Number(value) : value
    }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(false);
    try {
      const { error } = await supabase.from('settings').upsert([
        {
          id: form.id || 1, // Siempre la misma fila
          company_name: form.company_name,
          company_address: form.company_address,
          company_phone: form.company_phone,
          company_email: form.company_email,
          iva_percentage: form.iva_percentage,
        }
      ]);
      if (error) throw error;
      setSuccess(true);
    } catch (err: any) {
      setError('No se pudo guardar la configuración');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-4">Cargando configuración...</div>;

  return (
    <div className="flex justify-center w-full">
      <div className="w-full px-2 md:px-6">
        <div className="flex flex-row justify-between items-center mt-4 mb-6">
          <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
            <FontAwesomeIcon icon={faCog} className="w-7 h-7 text-gray-700" />
            Configuración
          </h1>
          <span className="text-gray-500 text-base">Fecha: {new Date().toLocaleDateString()}</span>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <form onSubmit={handleSave} className="max-w-xl mx-auto">
            <h2 className="text-xl font-bold mb-4">Configuración General</h2>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block mb-1 font-medium">Nombre de la empresa:</label>
                <input type="text" name="company_name" value={form.company_name || ''} onChange={handleChange} className="w-full border rounded px-3 py-2" />
              </div>
              <div>
                <label className="block mb-1 font-medium">Dirección:</label>
                <input type="text" name="company_address" value={form.company_address || ''} onChange={handleChange} className="w-full border rounded px-3 py-2" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block mb-1 font-medium">Teléfono:</label>
                <input type="text" name="company_phone" value={form.company_phone || ''} onChange={handleChange} className="w-full border rounded px-3 py-2" />
              </div>
              <div>
                <label className="block mb-1 font-medium">Email:</label>
                <input type="email" name="company_email" value={form.company_email || ''} onChange={handleChange} className="w-full border rounded px-3 py-2" />
              </div>
            </div>
            <h2 className="text-xl font-bold mt-8 mb-4">Configuración de Facturación</h2>
            <div className="mb-4">
              <label className="block mb-1 font-medium">Porcentaje de IVA (%):</label>
              <input type="number" name="iva_percentage" value={form.iva_percentage || ''} onChange={handleChange} className="w-full border rounded px-3 py-2" />
            </div>
            {error && <div className="text-red-600 mb-2">{error}</div>}
            {success && <div className="text-green-600 mb-2">¡Configuración guardada!</div>}
            <button type="submit" className="bg-blue-600 text-white px-6 py-2 rounded font-semibold" disabled={saving}>
              {saving ? 'Guardando...' : 'Guardar Configuración'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
} 