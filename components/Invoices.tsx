import React, { useState } from 'react';
import { supabase, Invoice } from '../lib/supabase';
import InvoiceModal from './InvoiceModal';
import { updateInvoice, createInvoice } from '../lib/data';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFileText } from '@fortawesome/free-solid-svg-icons';
import { usePaginatedData } from '../hooks/usePaginatedData';
import { useDebounce } from '../hooks/useDebounce';
import InvoiceTable from './InvoiceTable';

export default function Invoices() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'paid' | 'pending' | 'cancelled'>('all');
  const [page, setPage] = useState(1);
  const limit = 10;

  const debouncedSearch = useDebounce(searchTerm, 300);

  const {
    data: invoices,
    total,
    loading,
    error,
    refresh
  } = usePaginatedData('Invoices', {
    page,
    limit,
    filters: {
      search: debouncedSearch,
      status: statusFilter === 'all' ? undefined : statusFilter
    },
    sort: { field: 'date', direction: 'desc' }
  });

  const handleAdd = () => {
    setSelectedInvoice(null);
    setIsModalOpen(true);
  };

  const handleEdit = (invoice: Invoice) => {
    setSelectedInvoice(invoice);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('¿Eliminar esta factura?')) return;
    const { error } = await supabase.from('invoices').delete().eq('id', id);
    if (!error) refresh();
  };

  const handleStatusChange = async (id: number, newStatus: 'pending' | 'paid' | 'cancelled') => {
    await updateInvoice(id, { status: newStatus });
    refresh();
  };

  const handleSave = async (invoiceData, items) => {
    try {
      if (selectedInvoice) {
        await updateInvoice(selectedInvoice.id, invoiceData, items);
      } else {
        await createInvoice(invoiceData, items);
      }
      setIsModalOpen(false);
      setSelectedInvoice(null);
      refresh();
    } catch (error) {
      throw error;
    }
  };

  return (
    <div className="flex justify-center w-full">
      <div className="w-full px-2 md:px-6">
        <div className="flex flex-row justify-between items-center mt-4 mb-6">
          <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
            <FontAwesomeIcon icon={faFileText} className="w-7 h-7 text-gray-700" />
            Facturas
          </h1>
          <button
            onClick={handleAdd}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center shadow"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Nueva Factura
          </button>
        </div>
        <div className="bg-white rounded-lg shadow-md p-2 md:p-4 mb-6 w-full">
          <div className="flex flex-col md:flex-row gap-4 mb-6 items-center">
            <div className="flex-1 w-full">
              <input
                type="text"
                placeholder="Buscar facturas..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <select
                value={statusFilter}
                onChange={e => setStatusFilter(e.target.value as 'all' | 'paid' | 'pending' | 'cancelled')}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">Todas</option>
                <option value="paid">Pagadas</option>
                <option value="pending">Pendientes</option>
                <option value="cancelled">Canceladas</option>
              </select>
            </div>
          </div>
          <InvoiceTable
            invoices={invoices}
            total={total}
            page={page}
            limit={limit}
            onPageChange={setPage}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onStatusChange={handleStatusChange}
            loading={loading}
            error={error}
          />
        </div>
        {isModalOpen && (
          <InvoiceModal
            invoice={selectedInvoice}
            onClose={() => { setIsModalOpen(false); setSelectedInvoice(null); }}
            onSave={handleSave}
          />
        )}
      </div>
    </div>
  );
} 