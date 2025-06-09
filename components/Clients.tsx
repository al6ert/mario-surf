import React, { useState, useEffect } from 'react';
import { supabase, Client } from '../lib/supabase';
import ClientModal from './ClientModal';
import { DocumentTextIcon } from '@heroicons/react/24/outline';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUsers } from '@fortawesome/free-solid-svg-icons';
import { usePaginatedData } from '../hooks/usePaginatedData';
import { useDebounce } from '../hooks/useDebounce';
import ClientTable from './ClientTable';
import { useSearch } from '../hooks/useSearch';
import { useGlobalLimit } from '../hooks/useGlobalLimit';

export default function Clients() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const { limit, setLimit } = useGlobalLimit();
  
  const {
    searchTerm,
    setSearchTerm,
    appliedSearch,
    page,
    setPage
  } = useSearch();

  const {
    data: clients,
    total,
    loading,
    error,
    refresh: refreshTable
  } = usePaginatedData('Clients', {
    page,
    limit,
    filters: {
      search: appliedSearch
    },
    sort: { field: 'name', direction: 'asc' }
  });

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
    try {
      await supabase.from('clients').delete().eq('id', id);
      refreshTable();
    } catch (error) {
      console.error('Error deleting client:', error);
    }
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
    try {
      if (selectedClient) {
        // Editar
        await supabase.from('clients').update(dataToInsert).eq('id', selectedClient.id);
      } else {
        // Crear
        await supabase.from('clients').insert([dataToInsert]);
      }
      setIsModalOpen(false);
      setSelectedClient(null);
      refreshTable();
    } catch (error) {
      console.error('Error saving client:', error);
      throw error;
    }
  };

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
          <ClientTable
            clients={clients || []}
            total={total || 0}
            page={page}
            limit={limit}
            onPageChange={setPage}
            onEdit={handleEdit}
            onDelete={handleDelete}
            loading={loading}
            error={error}
            onLimitChange={newLimit => { setLimit(newLimit); setPage(1); }}
          />
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