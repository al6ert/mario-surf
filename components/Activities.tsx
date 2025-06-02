import React, { useState, useEffect } from 'react';
import { supabase, Activity } from '../lib/supabase';
import ActivityModal from './ActivityModal';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBicycle } from '@fortawesome/free-solid-svg-icons';

export default function Activities() {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedActivity, setSelectedActivity] = useState<Activity | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchActivities();
  }, []);

  const fetchActivities = async () => {
    setIsLoading(true);
    const { data, error } = await supabase.from('activities').select('*').order('name', { ascending: true });
    if (!error) setActivities(data || []);
    setIsLoading(false);
  };

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
    const { error } = await supabase.from('activities').delete().eq('id', id);
    if (!error) setActivities(activities.filter(a => a.id !== id));
  };

  const handleSave = async (activityData: Partial<Activity>) => {
    if (selectedActivity) {
      // Editar
      const { error, data } = await supabase.from('activities').update(activityData).eq('id', selectedActivity.id).select();
      if (!error && data) setActivities(activities.map(a => a.id === selectedActivity.id ? data[0] : a));
    } else {
      // Crear
      const { error, data } = await supabase.from('activities').insert([activityData]).select();
      if (!error && data) setActivities([...activities, data[0]]);
    }
    setIsModalOpen(false);
    setSelectedActivity(null);
  };

  const filtered = activities.filter(a => a.name.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div className="flex justify-center w-full">
      <div className="w-full px-2 md:px-6">
        <div className="flex flex-row justify-between items-center mt-4 mb-6">
          <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
            <FontAwesomeIcon icon={faBicycle} className="w-7 h-7 text-gray-700" />
            Actividades
          </h1>
          <button
            onClick={() => setIsModalOpen(true)}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center shadow"
          >
            + Nueva Actividad
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
          <div className="w-full">
            <table className="w-full min-w-0 divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-2 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">Nombre</th>
                  <th className="px-2 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">Duración (min)</th>
                  <th className="px-2 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">Precio (€)</th>
                  <th className="px-2 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">Máx. participantes</th>
                  <th className="px-2 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">Acciones</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filtered.map(activity => (
                  <tr key={activity.id} className="hover:bg-gray-50">
                    <td className="px-2 py-4 whitespace-nowrap text-sm text-gray-900 max-w-[160px] truncate">{activity.name}</td>
                    <td className="px-2 py-4 whitespace-nowrap text-sm text-gray-900">{activity.duration}</td>
                    <td className="px-2 py-4 whitespace-nowrap text-sm text-gray-900">{activity.price.toFixed(2)}</td>
                    <td className="px-2 py-4 whitespace-nowrap text-sm text-gray-900">{activity.max_participants}</td>
                    <td className="px-2 py-4 whitespace-nowrap text-sm font-medium">
                      <button onClick={() => handleEdit(activity)} className="text-blue-600 hover:text-blue-900 mr-3">Editar</button>
                      <button onClick={() => handleDelete(activity.id)} className="text-red-600 hover:text-red-900">Eliminar</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
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