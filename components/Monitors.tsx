import { useState, useEffect } from 'react';
import { Monitor } from '../lib/supabase';
import MonitorModal from './MonitorModal';
import { deleteMonitor, updateMonitor, createMonitor } from '../lib/data';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUserSecret } from '@fortawesome/free-solid-svg-icons';
import { usePaginatedData, LIMIT } from '../hooks/usePaginatedData';
import { useDebounce } from '../hooks/useDebounce';
import MonitorTable from './MonitorTable';
import { useSearchAndFilters } from '../hooks/useSearchAndFilters';

export default function Monitors() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedMonitor, setSelectedMonitor] = useState<Monitor | null>(null);
  const [limit, setLimit] = useState(LIMIT);

  const {
    searchTerm,
    setSearchTerm,
    appliedSearch,
    filter: statusFilter,
    setFilter: setStatusFilter,
    appliedFilter: appliedStatus,
    page,
    setPage
  } = useSearchAndFilters<'all' | 'active' | 'inactive'>('all');

  const {
    data: monitors,
    total,
    loading,
    error,
    refresh: refreshTable
  } = usePaginatedData('Monitors', {
    page,
    limit,
    filters: {
      search: appliedSearch,
      active: appliedStatus === 'all' ? undefined : appliedStatus === 'active'
    },
    sort: { field: 'name', direction: 'asc' }
  });

  const handleAdd = () => {
    setSelectedMonitor(null);
    setIsModalOpen(true);
  };

  const handleEdit = (monitor: Monitor) => {
    setSelectedMonitor(monitor);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('¿Eliminar este monitor?')) return;
    try {
      await deleteMonitor(id);
      refreshTable();
    } catch (error) {
      console.error('Error deleting monitor:', error);
    }
  };

  const handleStatusChange = async (id: number, active: boolean) => {
    try {
      await updateMonitor(id, { active });
      refreshTable();
    } catch (error) {
      console.error('Error updating monitor status:', error);
    }
  };

  const handleSave = async (monitorData: Omit<Monitor, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      if (selectedMonitor) {
        await updateMonitor(selectedMonitor.id, monitorData);
      } else {
        await createMonitor(monitorData);
      }
      setIsModalOpen(false);
      setSelectedMonitor(null);
      refreshTable();
    } catch (error) {
      console.error('Error saving monitor:', error);
      throw error;
    }
  };

  return (
    <div className="flex justify-center w-full">
      <div className="w-full px-2 md:px-6">
        <div className="flex flex-row justify-between items-center mt-4 mb-6">
          <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
            <FontAwesomeIcon icon={faUserSecret} className="w-7 h-7 text-gray-700" />
            Monitores
          </h1>
          <button
            onClick={handleAdd}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center shadow"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Nuevo Monitor
          </button>
        </div>
        <div className="bg-white rounded-lg shadow-md p-2 md:p-4 mb-6 w-full">
          <div className="flex flex-col md:flex-row gap-4 mb-6 items-center">
            <div className="flex-1 w-full">
              <input
                type="text"
                placeholder="Buscar monitores..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <select
                value={statusFilter}
                onChange={e => setStatusFilter(e.target.value as 'all' | 'active' | 'inactive')}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">Todos los estados</option>
                <option value="active">Activos</option>
                <option value="inactive">Inactivos</option>
              </select>
            </div>
          </div>
          <MonitorTable
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
            onLimitChange={newLimit => { setLimit(newLimit); setPage(1); }}
          />
        </div>
        {isModalOpen && (
          <MonitorModal
            monitor={selectedMonitor}
            onClose={() => { setIsModalOpen(false); setSelectedMonitor(null); }}
            onSave={handleSave}
          />
        )}
      </div>
    </div>
  );
} 