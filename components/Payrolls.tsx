import React, { useState, useEffect } from 'react';
import { useAppContext } from '../contexts/AppContext';
import { Payroll } from '../lib/supabase';
import PayrollModal from './PayrollModal';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEuro } from '@fortawesome/free-solid-svg-icons';
import PayrollTable from './PayrollTable';
import { useDebounce } from '../hooks/useDebounce';
import { usePaginatedData } from '../hooks/usePaginatedData';
import { createPayroll, updatePayroll, deletePayroll } from '../lib/data';
import { ApiClient } from '../lib/api';

const MONTHS = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
];

export default function Payrolls() {
  const { state } = useAppContext();
  const { monitors } = state;
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPayroll, setSelectedPayroll] = useState<Payroll | undefined>();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'paid' | 'pending'>('all');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [appliedSearch, setAppliedSearch] = useState('');
  const [appliedStatus, setAppliedStatus] = useState<'all' | 'paid' | 'pending'>('all');

  const debouncedSearch = useDebounce(searchTerm, 300);

  useEffect(() => {
    if (page === 1) {
      setAppliedSearch(debouncedSearch);
      setAppliedStatus(statusFilter);
    }
  }, [debouncedSearch, statusFilter, page]);

  const { data: payrolls, total, loading, error, refresh: refreshTable } = usePaginatedData('Payrolls', {
    page,
    limit,
    filters: {
      search: appliedSearch,
      status: appliedStatus === 'all' ? undefined : appliedStatus
    },
    sort: { field: 'date', direction: 'desc' }
  });

  const handleAdd = () => {
    setSelectedPayroll(undefined);
    setIsModalOpen(true);
  };

  const handleEdit = (payroll: Payroll) => {
    setSelectedPayroll(payroll);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('¿Estás seguro de que quieres eliminar esta nómina?')) return;
    try {
      const response = await fetch(`/api/payrolls/${id}`, { method: 'DELETE' });
      if (!response.ok) throw new Error('Error al eliminar la nómina');
      // Actualizar la lista de nóminas
      window.location.reload();
    } catch (error) {
      console.error('Error:', error);
      alert('Error al eliminar la nómina');
    }
  };

  const handleStatusChange = async (id: number, paid: boolean) => {
    try {
      await ApiClient.updatePayroll(id, { paid });
      // Forzar la recarga de datos usando la función refresh
      refreshTable();
    } catch (error) {
      console.error('Error:', error);
      alert('Error al actualizar el estado de la nómina');
    }
  };

  const handleSave = async (payrollData: Partial<Payroll>) => {
    try {
      const url = selectedPayroll
        ? `/api/payrolls/${selectedPayroll.id}`
        : '/api/payrolls';
      const method = selectedPayroll ? 'PUT' : 'POST';
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payrollData)
      });
      if (!response.ok) throw new Error('Error al guardar la nómina');
      setIsModalOpen(false);
      setSelectedPayroll(undefined);
      // Actualizar la lista de nóminas
      window.location.reload();
    } catch (error) {
      console.error('Error:', error);
      alert('Error al guardar la nómina');
    }
  };

  return (
    <div className="w-full px-2 md:px-6">
      <div className="flex flex-row justify-between items-center mt-4 mb-6">
        <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
          <FontAwesomeIcon icon={faEuro} className="w-7 h-7 text-gray-700" />
          Nóminas
        </h1>
        <button
          onClick={handleAdd}
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center shadow"
        >
          Nueva Nómina
        </button>
      </div>
      <div className="bg-white rounded-lg shadow-md p-2 md:p-4 mb-6 w-full">
        <div className="flex flex-col md:flex-row gap-4 mb-6 items-center">
          <div className="flex-1 w-full">
            <input
              type="text"
              placeholder="Buscar por monitor..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value as 'all' | 'paid' | 'pending')}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">Todos los estados</option>
              <option value="paid">Pagados</option>
              <option value="pending">Pendientes</option>
            </select>
          </div>
        </div>
        <PayrollTable
          payrolls={payrolls}
          monitors={monitors}
          total={total}
          page={page}
          limit={limit}
          onPageChange={setPage}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onStatusChange={handleStatusChange}
          loading={loading}
          error={error}
          onLimitChange={setLimit}
        />
      </div>
      <PayrollModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedPayroll(undefined);
        }}
        onSave={handleSave}
        payroll={selectedPayroll}
        monitors={monitors}
      />
    </div>
  );
} 