import React, { useState, useEffect } from 'react';
import { supabase, Activity } from '../lib/supabase';
import ActivityModal from './ActivityModal';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBicycle } from '@fortawesome/free-solid-svg-icons';
import { usePaginatedData, LIMIT} from '../hooks/usePaginatedData';
import { useDebounce } from '../hooks/useDebounce';
import ActivityTable from './ActivityTable';

export default function Activities() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedActivity, setSelectedActivity] = useState<Activity | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(LIMIT);

  // Estados auxiliares para los filtros aplicados
  const [appliedSearch, setAppliedSearch] = useState('');

  const debouncedSearch = useDebounce(searchTerm);

  // Reset page when debounced search changes
  useEffect(() => {
    setPage(1);
  }, [debouncedSearch]);

  // Cuando la página es 1, aplica los filtros al hook
  useEffect(() => {
    if (page === 1) {
      setAppliedSearch(debouncedSearch);
    }
  }, [debouncedSearch, page]);

  const {
    data: activities,
    total,
    loading,
    error,
    refresh: refreshTable
  } = usePaginatedData('Activities', {
    page,
    limit,
    filters: {
      search: appliedSearch
    },
    sort: { field: 'name', direction: 'asc' }
  });

  const handleAdd = () => {
    setSelectedActivity(null);
    setIsModalOpen(true);
  };

  const handleEdit = (activity: Activity) => {
    setSelectedActivity(activity);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('¿Eliminar esta actividad?')) return;
    try {
      await supabase.from('activities').delete().eq('id', id);
      refreshTable();
    } catch (error) {
      console.error('Error deleting activity:', error);
    }
  };

  const handleSave = async (activityData: Partial<Activity>) => {
    try {
      if (selectedActivity) {
        // Editar
        await supabase.from('activities').update(activityData).eq('id', selectedActivity.id);
      } else {
        // Crear
        await supabase.from('activities').insert([activityData]);
      }
      setIsModalOpen(false);
      setSelectedActivity(null);
      refreshTable();
    } catch (error) {
      console.error('Error saving activity:', error);
      throw error;
    }
  };

  return (
    <div className="flex justify-center w-full">
      <div className="w-full px-2 md:px-6">
        <div className="flex flex-row justify-between items-center mt-4 mb-6">
          <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
            <FontAwesomeIcon icon={faBicycle} className="w-7 h-7 text-gray-700" />
            Actividades
          </h1>
          <button
            onClick={handleAdd}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center shadow"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Nueva Actividad
          </button>
        </div>
        <div className="bg-white rounded-lg shadow-md p-2 md:p-4 mb-6 w-full">
          <div className="flex flex-col md:flex-row gap-4 mb-6 items-center">
            <div className="flex-1 w-full">
              <input
                type="text"
                placeholder="Buscar actividades..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          <ActivityTable
            activities={activities || []}
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
          <ActivityModal
            activity={selectedActivity}
            onClose={() => { setIsModalOpen(false); setSelectedActivity(null); }}
            onSave={handleSave}
          />
        )}
      </div>
    </div>
  );
} 