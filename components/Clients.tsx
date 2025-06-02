import React, { useState, useEffect } from 'react';
import { supabase, Client } from '../lib/supabase';
import ClientModal from './ClientModal';
import { DocumentTextIcon } from '@heroicons/react/24/outline';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUsers } from '@fortawesome/free-solid-svg-icons';

export default function Clients() {
  const [clients, setClients] = useState<Client[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchClients();
  }, []);

  const fetchClients = async () => {
    setIsLoading(true);
    const { data, error } = await supabase.from('clients').select('*').order('name', { ascending: true });
    if (!error) setClients(data || []);
    setIsLoading(false);
  };

  const handleAdd = () => {
    setSelectedClient(null);
    setIsModalOpen(true);
  };

  const handleEdit = (client: Client) => {
    setSelectedClient(client);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('¿Eliminar este cliente?')) return;
    const { error } = await supabase.from('clients').delete().eq('id', id);
    if (!error) setClients(clients.filter(c => c.id !== id));
  };

  const handleSave = async (clientData: Partial<Client>) => {
    // Asegurar que todos los campos requeridos estén presentes
    const dataToInsert = {
      name: clientData.name || '',
      email: clientData.email || '',
      phone: clientData.phone || '',
      dni: clientData.dni || '',
      address: clientData.address || '',
      notes: clientData.notes || '',
    };
    if (selectedClient) {
      // Editar
      const { error, data } = await supabase.from('clients').update(dataToInsert).eq('id', selectedClient.id).select();
      if (!error && data) setClients(clients.map(c => c.id === selectedClient.id ? data[0] : c));
      setIsModalOpen(false);
      setSelectedClient(null);
    } else {
      // Crear
      const { error, data } = await supabase.from('clients').insert([dataToInsert]).select();
      if (!error && data) {
        setClients([...clients, data[0]]);
        setIsModalOpen(false);
        setSelectedClient(null);
      }
    }
  };

  const filtered = clients.filter(c => {
    const term = searchTerm.toLowerCase();
    return (
      c.name.toLowerCase().includes(term) ||
      (c.dni || '').toLowerCase().includes(term) ||
      (c.email || '').toLowerCase().includes(term) ||
      (c.phone || '').toLowerCase().includes(term)
    );
  });

  return (
    <div className="flex justify-center w-full">
      <div className="w-full px-2 md:px-6">
        <div className="flex flex-row justify-between items-center mt-4 mb-6">
          <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
            <FontAwesomeIcon icon={faUsers} className="w-7 h-7 text-gray-700" />
            Clientes
          </h1>
          <button
            onClick={handleAdd}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center shadow"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Nuevo Cliente
          </button>
        </div>
        <div className="bg-white rounded-lg shadow-md p-2 md:p-4 mb-6 w-full">
          <div className="flex flex-col md:flex-row gap-4 mb-6 items-center">
            <div className="flex-1 w-full">
              <input
                type="text"
                placeholder="Buscar clientes..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          <div className="w-full">
            <table className="w-full min-w-0 divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-2 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">Nombre</th>
                  <th className="px-2 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">Email</th>
                  <th className="px-2 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">Teléfono</th>
                  <th className="px-2 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">Nota</th>
                  <th className="px-2 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">Fecha de creación</th>
                  <th className="px-2 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">Acciones</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filtered.map(client => (
                  <tr key={client.id} className="hover:bg-gray-50">
                    <td className="px-2 py-4 whitespace-nowrap text-sm text-gray-900 max-w-[160px] truncate">{client.name}</td>
                    <td className="px-2 py-4 whitespace-nowrap text-sm text-gray-900">{client.email}</td>
                    <td className="px-2 py-4 whitespace-nowrap text-sm text-gray-900">{client.phone}</td>
                    <td className="px-2 py-4 whitespace-nowrap text-center">
                      {client.notes ? (
                        <div className="relative group inline-block">
                          <DocumentTextIcon className="w-5 h-5 text-blue-500 inline-block cursor-pointer" />
                          <div className="absolute z-10 left-1/2 -translate-x-1/2 mt-2 w-64 bg-gray-900 text-white text-xs rounded-lg px-3 py-2 opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-200 shadow-lg">
                            {client.notes}
                          </div>
                        </div>
                      ) : null}
                    </td>
                    <td className="px-2 py-4 whitespace-nowrap text-center text-sm text-gray-900">
                      {client.created_at ? new Date(client.created_at).toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' }) : ''}
                    </td>
                    <td className="px-2 py-4 whitespace-nowrap text-sm font-medium">
                      <button onClick={() => handleEdit(client)} className="text-blue-600 hover:text-blue-900 mr-3">Editar</button>
                      <button onClick={() => handleDelete(client.id)} className="text-red-600 hover:text-red-900">Eliminar</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        {isModalOpen && (
          <ClientModal
            client={selectedClient}
            onClose={() => { setIsModalOpen(false); setSelectedClient(null); }}
            onSave={handleSave}
          />
        )}
      </div>
    </div>
  );
} 